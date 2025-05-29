import { app, BrowserWindow, dialog, ipcMain, session, shell } from 'electron';
import { dirname, join } from "path";
import fs from "fs";
import { exec } from "child_process";

// Game Downloader
import axios from "axios";
import unzipper from 'unzipper';

const bIsProd = process.env.NODE_ENV === 'production';

// Parameter store
import Datastore from 'nedb';
import type { GameInstallInfo, Settings } from "../../renderer/lib/types";

const gameInstallInfoDbPath: string = bIsProd ? join(app.getPath('userData'), 'gameInstallInfo.db') : './gameInstallInfo.db';
const gameInstallInfoDb = new Datastore({ filename: gameInstallInfoDbPath, autoload: true });

const settingsDbPath: string = bIsProd ? join(app.getPath('userData'), 'settings.db') : './settings.db';
const settingsDb = new Datastore({ filename: settingsDbPath, autoload: true });

/**
 * Implementation of ipcMain.handle
 * @param mainWindow Main BrowserWindow
 * @param platformName OS Name
 */
function ipcHandler(mainWindow: BrowserWindow, platformName: string) {
    // 신호등 버튼
    ipcMain.on('app-close', function (event) {
        mainWindow.close();
    });

    ipcMain.on('app-minimize', function (event) {
        mainWindow.minimize();
    });

    ipcMain.on('app-maximize', function (event) {
        if(mainWindow.isMaximized()) {
            mainWindow.restore();
        }
        else {
            mainWindow.maximize();
        }

    });

    ipcMain.handle('is-maximized', (event) => {
        return mainWindow.isMaximized();
    });

    // 파일 경로 지정
    ipcMain.handle('show-dialog', async (event, options) => {
        const result = await dialog.showOpenDialog(mainWindow, options);
        return result.filePaths[0]; // 사용자가 선택한 파일 경로
    });

    // 플랫폼 가져오기
    ipcMain.handle('get-platform', (event) => {
        return platformName;
    });

    // 플랫폼 가져오기
    ipcMain.handle('get-locale', (event): string => {
        return app.getLocale();
    });

    // download
    ipcMain.handle('download-file', async (event, { url, savePath }) => {
        // 디렉터리 없을 시 생성
        const directory = dirname(savePath);
        if(!fs.existsSync(directory)) {
            fs.mkdirSync(directory, { recursive: true });
        }

        const writer = fs.createWriteStream(savePath);

        try {
            const response = await axios.get(url, {
                responseType: 'stream',
                onDownloadProgress: (progressEvent) => {
                    const progress = (progressEvent.loaded / progressEvent.total!) * 100;
                    event.sender.send('download-progress', progress);
                },
            });

            response.data.pipe(writer);

            await new Promise((resolve: any, reject) => {
                writer.on('finish', resolve);
                writer.on('error', reject);
            });

            return savePath; // 다운로드한 파일 경로 반환
        } catch (error) {
            console.error('다운로드 실패:', error);
            throw error;
        }
    });

    ipcMain.handle('extract-zip', async (event, zipPath) => {
        const extractPath = dirname(zipPath);

        try {
            const zip = fs.createReadStream(zipPath);
            const directory = await unzipper.Open.file(zipPath);
            const totalFiles = directory.files.length;
            let extractedFiles = 0;

            // 파일을 하나씩 해제하며 진행률 계산
            await new Promise<void>((resolve, reject) => {
                zip
                    .pipe(unzipper.Extract({ path: extractPath }))
                    .on('entry', (entry) => {
                        extractedFiles++;
                        const progress = Math.round((extractedFiles / totalFiles) * 100);
                        event.sender.send('extract-progress', progress); // 진행률 전송
                        entry.autodrain(); // 필요하지 않은 경우 스트림 자동 소멸
                    })
                    .on('close', resolve) // 압축 해제 완료
                    .on('error', reject); // 에러 발생
            });

            fs.rmSync(zipPath, { recursive: true });

            if(platformName === 'darwin') {
                new Promise<string>((resolve, reject) => {
                    exec(`chmod -R 755 "${extractPath}"`, (error, stdout, stderr) => {
                        if (error) {
                            reject(stderr || error.message);
                        }
                        resolve(stdout);
                    });
                })
            }

            return extractPath;
        } catch (error) {
            console.error('압축 해제 실패:', error);
            throw error;
        }
    });

    // Open File
    ipcMain.handle('run-command', (event, command) => {
        return new Promise<string>((resolve, reject) => {
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    console.log("'run-command' error", stderr, error);
                    reject(stderr || error.message);
                } else {
                    console.log("'run-command' completed", stdout);
                    resolve(stdout);
                }
            });
        });
    });

    // Check Is Installed
    ipcMain.handle('check-executable-or-app', (event, dirPath: string): boolean => {
        try {
            const extensionName = platformName === 'darwin'
                ? '.app/'
                : '.exe';
            const targetPath = dirPath + extensionName;
            console.log(`dirPath: ${dirPath}, targetPath: ${targetPath}`);
            return fs.existsSync(targetPath);
        } catch (error) {
            console.error(error);
            return false;
        }
    });

    // Delete file
    ipcMain.handle('remove-file',  (event, targetPath: string): boolean => {
        // 파일 또는 디렉터리가 존재하는지 확인
        if (fs.existsSync(targetPath)) {
            const stats = fs.statSync(targetPath);
            if (stats.isDirectory()) {
                // targetPath가 디렉터리라면 삭제
                fs.rmSync(targetPath, { recursive: true, force: true });
            } else {
                // targetPath가 파일이라면 삭제
                fs.unlinkSync(targetPath);
            }
        }

        // targetPath 삭제 여부 반환
        return !fs.existsSync(targetPath);
    });

    // Save data
    // 데이터 설정
    ipcMain.handle('game-install-info-insert', (_, value: GameInstallInfo): Promise<any> => {
        return new Promise((resolve, reject) => {
            gameInstallInfoDb.insert(value, (err, newDoc) => {
                if (err) {
                    reject(err);
                } else {
                    gameInstallInfoDb.loadDatabase();
                    resolve(newDoc);
                }
            })
        })
    });

    // 데이터 가져오기
    ipcMain.handle('game-install-info-get-by-index', (_, gameIdIndex: number): Promise<any> => {
        return new Promise((resolve, reject) => {
            gameInstallInfoDb.findOne({ gameId: gameIdIndex }, (err, docs: GameInstallInfo) => {
                if (err) {
                    console.error(err);
                    reject(err);
                } else {
                    // console.log("GetByIndex Succeed: ", typeof docs, docs);
                    resolve(docs);
                }
            })
        })
    });

    // 데이터 삭제
    ipcMain.handle('game-install-info-delete', (_, gameIdIndex: number): Promise<any> => {
        return new Promise((resolve, reject) => {
            gameInstallInfoDb.remove({ gameId: gameIdIndex }, function (err, numRemoved) {
                if (err) {
                    reject(err);
                } else {
                    gameInstallInfoDb.loadDatabase();
                    resolve(numRemoved);
                }
            });
        })
    });

    // 데이터 업데이트
    ipcMain.handle('game-install-info-update', (event, gameIdIndex: number, gameInstallInfo: GameInstallInfo) => {
        // 조건에 맞는 데이터 업데이트
        return new Promise((resolve, reject) => {
            gameInstallInfoDb.update({ gameId: gameIdIndex }, { $set: gameInstallInfo }, { upsert: false }, function (err, numReplaced) {
                if (err) {
                    reject(err);
                } else {
                    gameInstallInfoDb.loadDatabase();
                    resolve(numReplaced);
                }
            });
        })
    });

    // Settings
    ipcMain.handle('settings-update', (event, newSettings: Settings) => {
        return new Promise((resolve, reject) => {
            settingsDb.update({ id: 0 }, { $set: newSettings }, { upsert: true }, function (err, numReplaced) {
                if (err) {
                    reject(err);
                } else {
                    settingsDb.loadDatabase();
                    resolve(numReplaced);
                }
            });
        })
    });

    ipcMain.handle('settings-get', (event) => {
        return new Promise((resolve, reject) => {
            settingsDb.findOne({ id: 0 }, (err, docs: GameInstallInfo) => {
                if (err) {
                    console.error(err);
                    reject(err);
                } else {
                    console.log("GetByIndex Succeed: ", typeof docs, docs);
                    resolve(docs);
                }
            })
        })
    });

    ipcMain.handle('get-electron-appdata-path', async (event): Promise<string> => {
        return app.getPath('userData');
    })

    // 🟢 로그인 처리 핸들러
    ipcMain.handle("login", async (event, username, password) => {
        const apiUrl = "https://wiki.prodbybitmap.com/w/api.php";

        try {
            // 1. CSRF 로그인 토큰 가져오기
            const tokenRes = await session.defaultSession.fetch(`${apiUrl}?action=query&meta=tokens&type=login&format=json`, {
                method: "GET",
                credentials: "include",
            });

            // 2. 쿠키 확인
            const cookies = await session.defaultSession.cookies.get({ url: apiUrl });
            console.log("저장된 쿠키:", cookies);

            const tokenData = await tokenRes.json();
            const loginToken = tokenData?.query?.tokens?.logintoken;
            console.log("로그인 토큰:", loginToken);

            if (!loginToken) throw new Error("CSRF 로그인 토큰을 가져올 수 없습니다.");

            // 2. 로그인 요청
            const loginRes = await session.defaultSession.fetch(apiUrl, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams({
                    action: "login",
                    format: "json",
                    lgname: username,
                    lgpassword: password,
                    lgtoken: loginToken,
                }),
            });

            const loginData = await loginRes.json();
            console.log("로그인 응답:", loginData);

            if (loginData?.login?.result === "Success") {
                console.log("로그인 성공! 🎉");
                return { success: true, username };
            } else {
                return { success: false, error: loginData };
            }
        } catch (error: any) {
            console.error("로그인 에러:", error);
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle("register", async (event, username: string, email: string, password: string) => {
        const apiUrl = "https://wiki.prodbybitmap.com/w/api.php";

        // 1. CSRF 토큰 가져오기
        const tokenRes = await session.defaultSession.fetch(`${apiUrl}?action=query&meta=tokens&type=createaccount&format=json`, {
            method: "GET",
            credentials: "include", // 쿠키 필요 시
            headers: {
                "Content-Type": "application/json",
            },
        });

        const tokenData = await tokenRes.json();
        const csrfToken = tokenData?.query?.tokens?.createaccounttoken;

        if (!csrfToken) {
            throw new Error("CSRF 토큰을 가져올 수 없습니다.");
        }

        // 2. 계정 생성 요청
        const accountRes = await session.defaultSession.fetch(apiUrl, {
            method: "POST",
            credentials: "include", // 쿠키 필요 시
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                action: "createaccount",
                format: "json",
                username: username,
                password: password,
                retype: password,
                email: email,
                createreturnurl: "https://wiki.prodbybitmap.com/",
                token: csrfToken,
            }),
        });

        const accountData = await accountRes.json();

        if (accountData?.createaccount?.status === "PASS") {
            console.log("계정이 성공적으로 생성되었습니다:", accountData.createaccount.username);
            return true;
        } else {
            console.error("계정 생성 실패:", accountData);
            return false;
        }
    });

    // 로그아웃 API 호출 핸들러
    ipcMain.handle("logout", async () => {
        try {
            const apiUrl = "https://wiki.prodbybitmap.com/w/api.php";
            // 1️⃣ CSRF 토큰 가져오기
            const tokenRes = await session.defaultSession.fetch(`${apiUrl}?action=query&meta=tokens&type=csrf&format=json`, {
                method: "GET",
                credentials: "include",
            });

            const tokenData = await tokenRes.json();
            const csrfToken = tokenData?.query?.tokens?.csrftoken;
            console.log("CSRF 토큰:", csrfToken);

            if (!csrfToken) throw new Error("CSRF 토큰을 가져올 수 없습니다.");

            // 2️⃣ 현재 세션의 쿠키 가져오기
            const cookies = await session.defaultSession.cookies.get({ url: apiUrl });

            // 3️⃣ 로그아웃 요청 보내기
            const logoutRes = await session.defaultSession.fetch(`${apiUrl}?action=logout&format=json`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    Cookie: cookies.map(c => `${c.name}=${c.value}`).join("; "), // 쿠키 전달
                },
                body: new URLSearchParams({ token: csrfToken }).toString(),
            });

            const logoutData = await logoutRes.json();
            console.log("로그아웃 응답:", logoutData);

            return { success: true, data: logoutData };
        } catch (error: any) {
            console.error("로그아웃 오류:", error);
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle("get-cookies", async (event, cookieName: string) => {
        try {
            const url = "https://wiki.prodbybitmap.com/w/api.php";
            const cookies = await session.defaultSession.cookies.get({ url });
            const cookie = cookies.find(c => c.name === cookieName);
            return cookie ? cookie.value : null;
        } catch (error) {
            console.error('쿠키 가져오기 실패:', error);
            return null;
        }
    });

    ipcMain.handle('fetch-data', async (_, url: string) => {
        try {
            const response = await axios.get(url);
            return response.data;
        } catch (error: any) {
            return {error: error.message};
        }
    });
}

export { ipcHandler };
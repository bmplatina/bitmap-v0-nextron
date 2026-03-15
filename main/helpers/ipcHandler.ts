import { app, BrowserWindow, dialog, ipcMain, session, shell, nativeTheme } from "electron";
import { autoUpdater } from "electron-updater";
import { userStore } from "./user-store";
import { dirname, join } from "path";
import fs from "fs";
import { exec } from "child_process";

// Game Downloader
import axios from "axios";
import unzipper from "unzipper";

const axiosGetCancelToken = axios.CancelToken;
const source = axiosGetCancelToken.source();

// Parameter store
import Datastore from "@seald-io/nedb";
import type { GameInstallInfo, Settings } from "../../renderer/lib/types";

/**
 * Implementation of ipcMain.handle
 * @param mainWindow Main BrowserWindow
 * @param platformName OS Name
 */
class ipcHandle {
  constructor(
    bIsProduction: boolean,
    MAIN_WINDOW: BrowserWindow,
    processPlatform: string,
  ) {
    // Electron
    this.bIsProd = bIsProduction;
    this.mainWindow = MAIN_WINDOW;
    this.platformName = processPlatform;

    // neDB state store
    this.gameInstallInfoDbPath = this.bIsProd
      ? join(app.getPath("userData"), "gameInstallInfo.db")
      : "./gameInstallInfo.db";
    this.gameInstallInfoDb = new Datastore({
      filename: this.gameInstallInfoDbPath,
      autoload: true,
    });

    this.settingsDbPath = this.bIsProd
      ? join(app.getPath("userData"), "settings.db")
      : "./settings.db";
    this.settingsDb = new Datastore({
      filename: this.settingsDbPath,
      autoload: true,
    });
  }

  // Electron
  private readonly bIsProd: boolean;
  private readonly mainWindow: BrowserWindow;
  private readonly platformName: string;

  // neDB state store
  private readonly gameInstallInfoDbPath: string;
  private readonly gameInstallInfoDb: Datastore<any>;

  private readonly settingsDbPath: string;
  private readonly settingsDb: Datastore<any>;

  private readonly API_URI: string = "https://api.prodbybitmap.com/";

  /**
   * API 링크 생성
   * @param substring 도메인 뒤 링크
   */
  getApiLinkByPurpose(substring: string): string {
    const API_DOMAIN: string = "https://api.prodbybitmap.com/";
    return `${API_DOMAIN}${substring}`;
  }

  initializeIpc() {
    nativeTheme.on('updated', () => {
      const currentMode = userStore.get("screenMode") || "system";
      if (currentMode === "system" && this.mainWindow) {
        const isDarkMode = nativeTheme.shouldUseDarkColors;
        this.mainWindow.setTitleBarOverlay({
          color: "#00000000",
          symbolColor: isDarkMode ? "#ffffff" : "#000000",
        });
      }
    });

    // 신호등 버튼
    ipcMain.on("app-close", (event) => {
      this.mainWindow.close();
    });

    ipcMain.on("app-minimize", (event) => {
      this.mainWindow.minimize();
    });

    ipcMain.on("app-maximize", (event) => {
      if (this.mainWindow.isMaximized()) {
        this.mainWindow.restore();
      } else {
        this.mainWindow.maximize();
      }
    });

    ipcMain.handle("is-maximized", (event) => {
      return this.mainWindow.isMaximized();
    });

    // 파일 경로 지정
    ipcMain.handle("show-dialog", async (event, options) => {
      const result = await dialog.showOpenDialog(this.mainWindow, options);
      return result.filePaths[0]; // 사용자가 선택한 파일 경로
    });

    // 플랫폼 가져오기
    ipcMain.handle("get-platform", (_event): string => {
      return this.platformName;
    });

    ipcMain.handle("get-locale", (_event): string => {
      return userStore.get("locale");
    });

    ipcMain.handle("set-locale", (_event, locale: "ko" | "en") => {
      userStore.set("locale", locale);
    });

    ipcMain.handle("get-token", (_event): string => {
      return userStore.get("token");
    });

    ipcMain.handle("set-token", (_event, token: string) => {
      userStore.set("token", token);
    });

    ipcMain.handle("get-screen-mode", (_event): string => {
      return userStore.get("screenMode");
    });

    ipcMain.handle(
      "set-screen-mode",
      (_, screenMode: "light" | "system" | "dark") => {
        userStore.set("screenMode", screenMode);
        if (!this.mainWindow) return;

        const isDarkMode = screenMode === "dark" || (screenMode === "system" && nativeTheme.shouldUseDarkColors);

        if (isDarkMode) {
          this.mainWindow.setTitleBarOverlay({
            color: "#00000000", // 배경색 (투명)
            symbolColor: "#ffffff", // 아이콘색 (흰색)
          });
        } else {
          this.mainWindow.setTitleBarOverlay({
            color: "#00000000", // 배경색 (투명)
            symbolColor: "#000000", // 아이콘색 (검정색)
          });
        }
      },
    );

    ipcMain.handle("open-external", async (_event, url: string) => {
      return shell.openExternal(url);
    });

    ipcMain.handle(
      "axios-get",
      async (event, uriSubstring: string, token?: string) => {
        const response = await axios.get(
          this.getApiLinkByPurpose(uriSubstring),
          {
            timeout: 30000,
            headers: {
              "Content-Type": "application/json",
              ...(token && { Authorization: `Bearer ${token}` }),
            },
            onDownloadProgress: (progressEvent) => {
              if (progressEvent.total) {
                const percentCompleted = Math.round(
                  (progressEvent.loaded * 100) / progressEvent.total,
                );
                event.sender.send("axios-get-progress", percentCompleted);
              }
            },
          },
        );
        return response.data;
      },
    );

    ipcMain.handle(
      "axios-post",
      async (
        event,
        uriSubstring: string,
        body: object,
        token?: string,
        contentType?: string,
      ) => {
        const response = await axios.post(
          this.getApiLinkByPurpose(uriSubstring),
          body,
          {
            timeout: 30000,
            headers: {
              "Content-Type": contentType || "application/json",
              ...(token && { Authorization: `Bearer ${token}` }),
            },
            onUploadProgress: (progressEvent) => {
              if (progressEvent.total) {
                const percentCompleted = Math.round(
                  (progressEvent.loaded * 100) / progressEvent.total,
                );
                event.sender.send("axios-post-progress", percentCompleted);
              }
            },
          },
        );
        return response.data;
      },
    );

    // download
    ipcMain.handle("download-file", async (event, { url, savePath }) => {
      // 디렉터리 없을 시 생성
      const directory = dirname(savePath);
      if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
      }

      const writer = fs.createWriteStream(savePath);

      try {
        const response = await axios.get(url, {
          responseType: "stream",
          cancelToken: source.token,
          onDownloadProgress: (progressEvent) => {
            const progress =
              (progressEvent.loaded / progressEvent.total!) * 100;
            event.sender.send("download-progress", progress);
          },
        });

        response.data.pipe(writer);

        await new Promise((resolve: any, reject) => {
          writer.on("finish", resolve);
          writer.on("error", reject);
        });

        return savePath; // 다운로드한 파일 경로 반환
      } catch (error) {
        console.error("다운로드 실패:", error);
        throw error;
      }
    });

    ipcMain.handle("download-cancel", async (event) => {
      source.cancel();
    });

    ipcMain.handle("extract-zip", async (event, zipPath) => {
      const extractPath = dirname(zipPath);

      try {
        const zip = fs.createReadStream(zipPath);
        const directory = await unzipper.Open.file(zipPath);
        const totalFiles = directory.files.length;
        let extractedFiles = 0;

        // 파일을 하나씩 해제하며 진행률 계산
        await new Promise<void>((resolve, reject) => {
          zip
            .pipe(unzipper.Parse())
            .on("entry", (entry) => {
              const fileName = entry.path;
              const type = entry.type; // 'Directory' or 'File'
              const fullPath = join(extractPath, fileName);

              if (type === "Directory") {
                fs.mkdirSync(fullPath, { recursive: true });
                entry.autodrain();
              } else {
                fs.mkdirSync(dirname(fullPath), { recursive: true });
                entry.pipe(fs.createWriteStream(fullPath)).on("finish", () => {
                  extractedFiles++;
                  const progress = Math.round((extractedFiles / totalFiles) * 100);
                  event.sender.send("extract-progress", progress); // 진행률 전송
                });
              }
            })
            .on("close", resolve) // 압축 해제 완료
            .on("error", reject); // 에러 발생
        });

        fs.rmSync(zipPath, { recursive: true });

        if (this.platformName === "darwin") {
          new Promise<string>((resolve, reject) => {
            exec(`chmod -R 755 "${extractPath}"`, (error, stdout, stderr) => {
              if (error) {
                reject(stderr || error.message);
              }
              resolve(stdout);
            });
          });
        }

        return extractPath;
      } catch (error) {
        console.error("압축 해제 실패:", error);
        throw error;
      }
    });

    // Open File
    ipcMain.handle("run-command", (event, command) => {
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
    ipcMain.handle(
      "check-executable-or-app",
      (event, dirPath: string): boolean => {
        try {
          const extensionName =
            this.platformName === "darwin" ? ".app/" : ".exe";
          const targetPath = dirPath + extensionName;
          console.log(`dirPath: ${dirPath}, targetPath: ${targetPath}`);
          return fs.existsSync(targetPath);
        } catch (error) {
          console.error(error);
          return false;
        }
      },
    );

    // Delete file
    ipcMain.handle("remove-file", (event, targetPath: string): boolean => {
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
    ipcMain.handle(
      "game-install-info-insert",
      (_, value: GameInstallInfo): Promise<any> => {
        return new Promise((resolve, reject) => {
          this.gameInstallInfoDb.insert(value, (err, newDoc) => {
            if (err) {
              reject(err);
            } else {
              this.gameInstallInfoDb.loadDatabase();
              resolve(newDoc);
            }
          });
        });
      },
    );

    // 데이터 가져오기
    ipcMain.handle(
      "game-install-info-get-by-index",
      (_, gameIdIndex: number): Promise<any> => {
        return new Promise((resolve, reject) => {
          this.gameInstallInfoDb.findOne(
            { gameId: gameIdIndex },
            (err, docs: GameInstallInfo) => {
              if (err) {
                console.error(err);
                reject(err);
              } else {
                console.log("GetByIndex Succeed: ", typeof docs, docs);
                resolve(docs);
              }
            },
          );
        });
      },
    );

    // 데이터 삭제
    ipcMain.handle(
      "game-install-info-delete",
      (_, gameIdIndex: number): Promise<any> => {
        return new Promise((resolve, reject) => {
          this.gameInstallInfoDb.remove(
            { gameId: gameIdIndex },
            (err, numRemoved) => {
              if (err) {
                reject(err);
              } else {
                this.gameInstallInfoDb.loadDatabase();
                resolve(numRemoved);
              }
            },
          );
        });
      },
    );

    // 데이터 업데이트
    ipcMain.handle(
      "game-install-info-update",
      (_event, gameIdIndex: number, gameInstallInfo: GameInstallInfo) => {
        // 조건에 맞는 데이터 업데이트
        return new Promise((resolve, reject) => {
          this.gameInstallInfoDb.update(
            { gameId: gameIdIndex },
            { $set: gameInstallInfo },
            { upsert: false },
            (err, numReplaced) => {
              if (err) {
                reject(err);
              } else {
                this.gameInstallInfoDb.loadDatabase();
                resolve(numReplaced);
              }
            },
          );
        });
      },
    );

    // Settings
    ipcMain.handle("settings-update", (_event, newSettings: Settings) => {
      return new Promise((resolve, reject) => {
        this.settingsDb.update(
          { id: 0 },
          { $set: newSettings },
          { upsert: true },
          (err, numReplaced) => {
            if (err) {
              reject(err);
            } else {
              this.settingsDb.loadDatabase();
              resolve(numReplaced);
            }
          },
        );
      });
    });

    ipcMain.handle("settings-get", (_event) => {
      return new Promise((resolve, reject) => {
        this.settingsDb.findOne({ id: 0 }, (err, docs: GameInstallInfo) => {
          if (err) {
            console.error(err);
            reject(err);
          } else {
            console.log("GetByIndex Succeed: ", typeof docs, docs);
            resolve(docs);
          }
        });
      });
    });

    ipcMain.handle(
      "get-electron-appdata-path",
      async (event): Promise<string> => {
        return app.getPath("userData");
      },
    );

    // 렌더러로부터 설치 명령 수신
    ipcMain.on("quit-and-install", () => {
      autoUpdater.quitAndInstall();
    });
  }
}

export { ipcHandle };

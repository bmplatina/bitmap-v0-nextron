import {
  app,
  BrowserWindow,
  dialog,
  ipcMain,
  session,
  shell,
  nativeTheme,
} from "electron";
import { userStore } from "./user-store";
import * as types from "./types";
import path, { dirname, join } from "path";
import fs, { promises } from "fs";
import { exec, spawn } from "child_process";
import type { ChildProcess } from "child_process";
import log from "./logger";
import updater from "./auto-updater";
import setMenu from "./menu-bar";
import { pipeline } from "stream/promises";
import getFoldersize from "get-folder-size";

// Game Downloader
import axios from "axios";
import unzipper from "unzipper";

// Parameter store
import Datastore from "@seald-io/nedb";
import type { GameInstallInfo, Settings } from "../../renderer/lib/types";

/**
 * Implementation of ipcMain.handle
 * @param mainWindow Main BrowserWindow
 * @param platformName OS Name
 */
class ipcHandle {
  constructor(bIsProduction: boolean, processPlatform: string) {
    // Electron
    this.bIsProd = bIsProduction;
    this.platformName = processPlatform;

    // neDB state store
    this.gameInstallInfoDbPath = this.bIsProd
      ? join(app.getPath("userData"), "gameInstallInfo.db")
      : "./gameInstallInfo.db";
    this.gameInstallInfoDb = new Datastore({
      filename: this.gameInstallInfoDbPath,
      autoload: true,
    });
    this.gameInstallInfoDbReady = this.initializeGameInstallInfoDb();

    this.settingsDbPath = this.bIsProd
      ? join(app.getPath("userData"), "settings.db")
      : "./settings.db";
    this.settingsDb = new Datastore({
      filename: this.settingsDbPath,
      autoload: true,
    });
    const desyncBinaryName =
      processPlatform === "win32" ? "desync.exe" : "desync";
    this.desyncPath = !app.isPackaged
      ? path.join(process.cwd(), "resources", processPlatform, desyncBinaryName)
      : path.join(process.resourcesPath, "bin", desyncBinaryName);
    // this.DESYNC_TEMP_PATH =
    //   this.platformName === "darwin"
    //     ? path.join(app.getPath("temp"), "caidx")
    //     : path.join(app.getPath("userData"), "caidx");
    this.DESYNC_TEMP_PATH = path.join(
      app.getPath("temp"),
      "Bitmap Production",
      "caidx",
    );
  }

  // Electron
  private readonly bIsProd: boolean;
  private readonly platformName: string;
  private readonly desyncPath: string;

  // neDB state store
  private readonly gameInstallInfoDbPath: string;
  private readonly gameInstallInfoDb: Datastore<any>;
  private readonly gameInstallInfoDbReady: Promise<void>;

  private readonly settingsDbPath: string;
  private readonly settingsDb: Datastore<any>;

  private readonly SAFARI_USERAGENT: string =
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.4 Safari/605.1.15";
  private readonly API_URI: string = "https://api.prodbybitmap.com/";
  private readonly DEPOT_URI: string = "https://depot.prodbybitmap.com/";

  private readonly DESYNC_TEMP_PATH: string;

  private activeDownloads = new Map<string, Electron.DownloadItem>();
  private pendingDownloads = new Map<
    string,
    {
      savePath: string;
      sender: Electron.WebContents;
      resolve: (value: string) => void;
      reject: (reason?: any) => void;
      startTime: number;
      lastTime: number;
      lastLoaded: number;
    }
  >();

  private runningGames = new Map<number, ChildProcess>();
  private runningDesyncProcesses = new Set<ChildProcess>();
  private activePullGameId: number | null = null;

  /**
   * Migrate legacy data before enabling the constraint. Older versions did
   * not enforce gameId uniqueness, so creating the index first would fail on
   * users who already have duplicate installation records.
   */
  private async initializeGameInstallInfoDb(): Promise<void> {
    const documents = await new Promise<GameInstallInfo[]>(
      (resolve, reject) => {
        this.gameInstallInfoDb.find({}, (error, docs: GameInstallInfo[]) => {
          if (error) reject(error);
          else resolve(docs);
        });
      },
    );

    const seenGameIds = new Set<number>();
    const duplicateDocumentIds = documents
      .filter((document: GameInstallInfo & { _id?: string }) => {
        if (seenGameIds.has(document.gameId)) return true;
        seenGameIds.add(document.gameId);
        return false;
      })
      .map((document: GameInstallInfo & { _id?: string }) => document._id)
      .filter((id): id is string => Boolean(id));

    if (duplicateDocumentIds.length > 0) {
      const backupPath = `${this.gameInstallInfoDbPath}.before-gameid-unique-index.bak`;
      if (!fs.existsSync(backupPath)) {
        fs.copyFileSync(this.gameInstallInfoDbPath, backupPath);
      }
      log.warn(
        `Removing ${duplicateDocumentIds.length} duplicate game installation record(s) before applying the gameId unique index. A backup was saved to ${backupPath}.`,
      );
      await new Promise<void>((resolve, reject) => {
        this.gameInstallInfoDb.remove(
          { _id: { $in: duplicateDocumentIds } },
          { multi: true },
          (error) => {
            if (error) reject(error);
            else resolve();
          },
        );
      });
    }

    await new Promise<void>((resolve, reject) => {
      this.gameInstallInfoDb.ensureIndex(
        { fieldName: "gameId", unique: true },
        (error) => {
          if (error) reject(error);
          else resolve();
        },
      );
    });
  }

  /**
   * API 링크 생성
   * @param substring 도메인 뒤 링크 또는 전체 URL
   */
  getApiLinkByPurpose(substring: string): string {
    if (substring.startsWith("http://") || substring.startsWith("https://")) {
      return substring;
    }
    return `${this.API_URI}${substring}`;
  }

  private removePathIfExists(targetPath: string): boolean {
    try {
      const stat = fs.lstatSync(targetPath);
      if (stat.isDirectory() && !stat.isSymbolicLink()) {
        fs.rmSync(targetPath, { recursive: true, force: true });
      } else {
        fs.unlinkSync(targetPath);
      }
      return true;
    } catch (error: any) {
      if (error?.code === "ENOENT") {
        return false;
      }
      throw error;
    }
  }

  private terminateChildProcess(child: ChildProcess): void {
    try {
      if (!child.pid) {
        child.kill("SIGTERM");
        return;
      }

      if (this.platformName !== "win32") {
        try {
          process.kill(-child.pid, "SIGTERM");
          return;
        } catch {
          // Not a process-group leader or already exited; fall through.
        }
      }

      child.kill("SIGTERM");
    } catch (error: any) {
      log.error("Failed to terminate child process", error);
    }
  }

  initializeIpc() {
    this.appLifecycleHandlers();
    this.electronTools();
    this.bitmapAPI();
    this.deprecatedHandlers();
  }

  private appLifecycleHandlers() {
    app.on("before-quit", () => {
      for (const [gameId, child] of this.runningGames.entries()) {
        this.terminateChildProcess(child);
        log.info(`Stopped running game on app quit: ${gameId}`);
      }
      this.runningGames.clear();

      for (const child of this.runningDesyncProcesses) {
        this.terminateChildProcess(child);
      }
      this.runningDesyncProcesses.clear();
    });
  }

  private electronTools() {
    // 신호등 버튼
    ipcMain.on("app-close", (event) => {
      const mainWindow = BrowserWindow.fromWebContents(event.sender);
      mainWindow.close();
    });

    ipcMain.on("app-minimize", (event) => {
      const mainWindow = BrowserWindow.fromWebContents(event.sender);
      mainWindow.minimize();
    });

    ipcMain.on("app-maximize", (event) => {
      const mainWindow = BrowserWindow.fromWebContents(event.sender);

      if (mainWindow.isMaximized()) {
        mainWindow.restore();
      } else {
        mainWindow.maximize();
      }
    });

    ipcMain.on("app-restart", async (_event) => {
      app.relaunch();
      app.exit(0);
    });

    ipcMain.handle("is-maximized", (event) => {
      const mainWindow = BrowserWindow.fromWebContents(event.sender);
      return mainWindow.isMaximized();
    });

    // 파일 경로 지정
    ipcMain.handle("show-dialog", async (event, options) => {
      const mainWindow = BrowserWindow.fromWebContents(event.sender);
      const result = await dialog.showOpenDialog(mainWindow, options);
      return result.filePaths[0]; // 사용자가 선택한 파일 경로
    });

    // 플랫폼 가져오기
    ipcMain.handle("get-platform", (_event): string => {
      return this.platformName;
    });

    ipcMain.handle("get-version", (_event): string => {
      return app.getVersion();
    });

    ipcMain.handle("get-locale", (_event): string => {
      return userStore.get("locale");
    });

    ipcMain.handle("set-locale", (event, locale: "ko" | "en") => {
      userStore.set("locale", locale);
      const mainWindow = BrowserWindow.fromWebContents(event.sender);
      setMenu(mainWindow);
    });

    ipcMain.handle("open-external", async (_event, url: string) => {
      return shell.openExternal(url);
    });

    ipcMain.handle(
      "get-electron-appdata-path",
      async (_event): Promise<string> => {
        return app.getPath("userData");
      },
    );

    // 렌더러로부터 설치 명령 수신
    ipcMain.on("quit-and-install", () => {
      updater.quitAndInstall();
    });
  }

  private bitmapAPI() {
    session.defaultSession.on("will-download", (event, item, webContents) => {
      const url = item.getURLChain()[0] || item.getURL();
      const pending = this.pendingDownloads.get(url);

      if (pending) {
        item.setSavePath(pending.savePath);
        this.activeDownloads.set(url, item);

        item.on("updated", (event, state) => {
          if (state === "interrupted") {
            log.info("Download is interrupted but can be resumed");
          } else if (state === "progressing") {
            if (item.isPaused()) {
              log.info("Download is paused");
            } else {
              const currentTime = Date.now();
              const timeDiff = (currentTime - pending.lastTime) / 1000;

              if (timeDiff >= 1.0) {
                const loadedDiff = item.getReceivedBytes() - pending.lastLoaded;
                const instantSpeedInMbps =
                  (loadedDiff * 8) / (timeDiff * 1024 * 1024);
                pending.sender.send(
                  "download-speed-realtime",
                  instantSpeedInMbps.toFixed(2),
                );

                pending.lastTime = currentTime;
                pending.lastLoaded = item.getReceivedBytes();
              }

              const progress =
                (item.getReceivedBytes() / (item.getTotalBytes() || 1)) * 100;
              const totalDurationInSeconds =
                (currentTime - pending.startTime) / 1000;

              if (totalDurationInSeconds > 0) {
                const avgSpeedInBytesPerSecond =
                  item.getReceivedBytes() / totalDurationInSeconds;
                const avgSpeedInMbps =
                  (avgSpeedInBytesPerSecond * 8) / (1024 * 1024);

                pending.sender.send("download-progress", progress);
                pending.sender.send(
                  "download-speed-avg",
                  avgSpeedInMbps.toFixed(2),
                );
              }
            }
          }
        });

        item.once("done", (_event, state) => {
          if (state === "completed") {
            pending.resolve(pending.savePath);
          } else if (state === "cancelled") {
            pending.reject("cancelled");
          } else {
            pending.reject(new Error(`Download failed: ${state}`));
          }
          this.activeDownloads.delete(url);
          this.pendingDownloads.delete(url);
        });
      }
    });

    ipcMain.handle(
      "axios-get",
      async (
        event,
        identifier: string,
        uriSubstring: string,
        token?: string,
      ) => {
        const response = await axios.get(
          this.getApiLinkByPurpose(uriSubstring),
          {
            timeout: 30000,
            headers: {
              "Content-Type": "application/json",
              "User-Agent": this.SAFARI_USERAGENT,
              ...(token && { Authorization: `Bearer ${token}` }),
            },
            onDownloadProgress: (progressEvent) => {
              if (progressEvent.total) {
                const percentCompleted = Math.round(
                  (progressEvent.loaded * 100) / progressEvent.total,
                );
                event.sender.send(
                  `axios-get-progress-${identifier}`,
                  percentCompleted,
                );
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
        identifier: string,
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
              "User-Agent": this.SAFARI_USERAGENT,
              ...(token && { Authorization: `Bearer ${token}` }),
            },
            onUploadProgress: (progressEvent) => {
              if (progressEvent.total) {
                const percentCompleted = Math.round(
                  (progressEvent.loaded * 100) / progressEvent.total,
                );
                event.sender.send(
                  `axios-post-progress-${identifier}`,
                  percentCompleted,
                );
              }
            },
          },
        );
        return response.data;
      },
    );

    ipcMain.handle(
      "axios-put",
      async (
        event,
        identifier: string,
        uriSubstring: string,
        body: object,
        token?: string,
        contentType?: string,
      ) => {
        const response = await axios.put(
          this.getApiLinkByPurpose(uriSubstring),
          body,
          {
            timeout: 30000,
            headers: {
              "Content-Type": contentType || "application/json",
              "User-Agent": this.SAFARI_USERAGENT,
              ...(token && { Authorization: `Bearer ${token}` }),
            },
            onUploadProgress: (progressEvent) => {
              if (progressEvent.total) {
                const percentCompleted = Math.round(
                  (progressEvent.loaded * 100) / progressEvent.total,
                );
                event.sender.send(
                  `axios-put-progress-${identifier}`,
                  percentCompleted,
                );
              }
            },
          },
        );
        return response.data;
      },
    );

    ipcMain.handle(
      "axios-delete",
      async (
        _event,
        uriSubstring: string,
        body: object,
        token?: string,
        contentType?: string,
      ) => {
        const response = await axios.delete(
          this.getApiLinkByPurpose(uriSubstring),

          {
            data: body,
            timeout: 30000,
            headers: {
              "Content-Type": contentType || "application/json",
              "User-Agent": this.SAFARI_USERAGENT,
              ...(token && { Authorization: `Bearer ${token}` }),
            },
          },
        );
        return response.data;
      },
    );

    ipcMain.handle("get-token", (_event): string => {
      return userStore.get("token");
    });

    ipcMain.handle("set-token", (event, token: string) => {
      userStore.set("token", token);
      const mainWindow = BrowserWindow.fromWebContents(event.sender);
      setMenu(mainWindow);
    });

    ipcMain.handle("get-screen-mode", (_event): string => {
      return userStore.get("screenMode");
    });

    ipcMain.handle("set-screen-mode", (event, screenMode: types.screenMode) => {
      userStore.set("screenMode", screenMode);
      nativeTheme.themeSource = screenMode;
      const mainWindow = BrowserWindow.fromWebContents(event.sender);

      if (!mainWindow) {
        log.error("set-screen-mode: mainWindow is null");
        return;
      }

      if (this.platformName !== "win32") {
        log.warn(
          "set-screen-mode: setTitleBarOverlay method is not supported on",
          this.platformName,
        );
        return;
      }

      const isDarkMode =
        screenMode === "dark" ||
        (screenMode === "system" && nativeTheme.shouldUseDarkColors);

      if (isDarkMode) {
        mainWindow.setTitleBarOverlay({
          color: "#00000000", // 배경색 (투명 - 다크)
          symbolColor: "#FFFFFFFF", // 아이콘색 (흰색)
        });
      } else {
        mainWindow.setTitleBarOverlay({
          color: "#FFFFFF00", // 배경색 (투명 - 라이트, Electron 리페인팅 트리거용)
          symbolColor: "#000000FF", // 아이콘색 (검정색)
        });
      }
    });

    // download
    ipcMain.handle("download-file", async (event, { url, savePath }) => {
      const directory = dirname(savePath);
      if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
      }

      return new Promise<string>((resolve, reject) => {
        this.pendingDownloads.set(url, {
          savePath,
          sender: event.sender,
          resolve,
          reject,
          startTime: Date.now(),
          lastTime: Date.now(),
          lastLoaded: 0,
        });

        event.sender.downloadURL(url);
      });
    });

    ipcMain.handle("download-pause", async (event, url: string) => {
      const item = this.activeDownloads.get(url);
      if (item && !item.isPaused()) {
        item.pause();
      }
    });

    ipcMain.handle("download-resume", async (event, url: string) => {
      const item = this.activeDownloads.get(url);
      if (item && item.canResume()) {
        item.resume();
      }
    });

    ipcMain.handle("download-cancel", async (event, url: string) => {
      const item = this.activeDownloads.get(url);
      if (item) {
        item.cancel();
      } else {
        const pending = this.pendingDownloads.get(url);
        if (pending) {
          pending.reject("cancelled");
          this.pendingDownloads.delete(url);
        }
      }
    });

    ipcMain.handle(
      "pull-game",
      async (event, gameId: number, destPath: string, bUseCache: boolean) => {
        if (
          this.activePullGameId !== null ||
          this.runningDesyncProcesses.size > 0
        ) {
          const runningGameId = this.activePullGameId;
          log.warn(
            `pull-game blocked: gameId=${gameId}, runningGameId=${runningGameId}`,
          );
          throw new Error("Another game installation is already in progress.");
        }
        this.activePullGameId = gameId;

        // caidx를 저장할 임시 경로. <temp>/caidx/games/${gameId}/<file>.caidx
        const caidxDirPath = path.join(
          this.DESYNC_TEMP_PATH,
          "games",
          gameId.toString(),
        );
        const platform = this.platformName === "win32" ? "Windows" : "macOS";
        const caidxSavePath = path.join(
          caidxDirPath,
          `${gameId}_${platform}_latest.caidx`,
        );
        const desyncCachePath = path.join(caidxDirPath, "cache");
        const authToken = userStore.get("token");
        if (!fs.existsSync(caidxDirPath)) {
          fs.mkdirSync(caidxDirPath, { recursive: true });
        }
        if (!fs.existsSync(desyncCachePath)) {
          fs.mkdirSync(desyncCachePath, { recursive: true });
        }
        const installParentPath = path.dirname(destPath);
        if (!fs.existsSync(installParentPath)) {
          fs.mkdirSync(installParentPath, { recursive: true });
        }

        const isMacBundleTarget =
          this.platformName === "darwin" && destPath.endsWith(".app");
        if (isMacBundleTarget && !fs.existsSync(destPath)) {
          fs.mkdirSync(destPath, { recursive: true });
        }

        try {
          const writer = fs.createWriteStream(caidxSavePath);

          const response = await axios.get(
            this.getApiLinkByPurpose(
              `games/caidx/${gameId}?platform=${platform}&version=latest`,
            ),
            {
              responseType: "stream",
              headers: {
                "Content-Type": "application/json",
                "User-Agent": this.SAFARI_USERAGENT,
                ...(authToken && { Authorization: `Bearer ${authToken}` }),
              },
            },
          );

          await pipeline(response.data, writer);
        } catch (error) {
          this.activePullGameId = null;
          throw error;
        }

        // macOS 앱 번들은 .app 내부에서 untar 해야 Contents/가 번들 내부로 배치됨
        const untarTargetPath = isMacBundleTarget ? "." : destPath;

        // desync untar -i -s DEPOT_URI <path/to/caidx.caidx> <target>
        const desyncArgs = [
          "untar",
          "-i",
          "-s",
          this.DEPOT_URI,
          ...(bUseCache ? ["-c", desyncCachePath] : []),
          caidxSavePath,
          untarTargetPath,
        ];

        let child: ChildProcess;
        try {
          child = spawn(this.desyncPath, desyncArgs, {
            ...(isMacBundleTarget ? { cwd: destPath } : {}),
            env: {
              ...process.env,
              DESYNC_ENABLE_PARSABLE_PROGRESS: "1",
              ...(authToken && { BITMAP_AUTH_TOKEN: authToken }),
            },
          });
        } catch (error) {
          this.activePullGameId = null;
          throw error;
        }
        this.runningDesyncProcesses.add(child);

        let isCompleted = false;
        let stderrBuffer = "";
        let lastCompletedChunks: number | null = null;
        let lastProgressTimestamp: number | null = null;

        const cleanupCaidxAndNotify = (success: boolean) => {
          if (isCompleted) {
            return;
          }
          isCompleted = true;

          if (fs.existsSync(caidxSavePath)) {
            fs.unlink(caidxSavePath, (unlinkError) => {
              if (unlinkError) {
                log.error("pull-game: failed to delete caidx", unlinkError);
              }
              event.sender.send(`game-install-complete-${gameId}`, success);
            });
            return;
          }

          event.sender.send(`game-install-complete-${gameId}`, success);
        };

        child.stderr.on("data", (data) => {
          stderrBuffer += data.toString().replace(/\r/g, "\n");

          let newlineIndex;
          while ((newlineIndex = stderrBuffer.indexOf("\n")) !== -1) {
            const line = stderrBuffer.slice(0, newlineIndex).trim();
            stderrBuffer = stderrBuffer.slice(newlineIndex + 1);
            console.log(line);

            // Parsing e.g.: Unpacking 79170 / 79481 99.61% 00m01s
            const progressRegex =
              /(\d+)\s*\/\s*(\d+)\s+(\d+(?:\.\d+)?)%\s+((?:\d+h)?\d+m\d+s)/i;
            const match = line.match(progressRegex);

            if (match) {
              const completedChunks = parseInt(match[1], 10);
              const currentTimestamp = Date.now();
              let speed = 0;
              // 사용자의 실제 다운로드 속도 체감을 맞추기 위한 보정값 (약 34.7KB)
              const chunkSizeBytes = 34.7 * 1024;

              if (
                lastCompletedChunks !== null &&
                lastProgressTimestamp !== null &&
                currentTimestamp > lastProgressTimestamp
              ) {
                const elapsedSeconds =
                  (currentTimestamp - lastProgressTimestamp) / 1000;
                const deltaChunks = completedChunks - lastCompletedChunks;
                const bytesPerSecond =
                  (deltaChunks * chunkSizeBytes) / elapsedSeconds;
                speed = Math.max(0, (bytesPerSecond * 8) / (1024 * 1024));
              }

              lastCompletedChunks = completedChunks;
              lastProgressTimestamp = currentTimestamp;

              const progress = {
                percent: parseFloat(match[3]),
                eta: match[4],
                speed: parseFloat(speed.toFixed(2)),
              };
              event.sender.send(`game-install-progress-${gameId}`, progress);
            }
          }
        });

        child.on("error", (error) => {
          this.runningDesyncProcesses.delete(child);
          this.activePullGameId = null;
          log.error("pull-game: failed to start desync", error);
          cleanupCaidxAndNotify(false);
        });

        child.on("close", (code) => {
          this.runningDesyncProcesses.delete(child);
          this.activePullGameId = null;
          cleanupCaidxAndNotify(code === 0);
        });
      },
    );

    ipcMain.handle(
      "create-shortcut",
      async (_event, installationPath: string, title: string) => {
        try {
          if (this.platformName === "win32") {
            // 1. 파일명으로 쓸 수 없는 특수문자 제거 (안정성 강화)
            const safeTitle = title.replace(/[\\/:*?"<>|]/g, "");
            const shortcutPath = path.join(
              app.getPath("desktop"),
              `${safeTitle}.lnk`,
            );

            const shortcutOptions = {
              target: installationPath,
              cwd: path.dirname(installationPath),
              args: "--open-settings",
              description: `${title} 실행 바로가기`,
              // 실행 파일 자체에 아이콘이 있다면 그대로 유지, 없다면 별도 경로 지정 필요
              icon: installationPath,
              iconIndex: 0,
            };

            // 2. 생성 시도 및 결과 반환
            const success = shell.writeShortcutLink(
              shortcutPath,
              "create", // 이미 있으면 덮어쓰고 싶다면 'replace' 권장
              shortcutOptions,
            );

            return { success, path: shortcutPath };
          } else if (this.platformName === "darwin") {
            const shortcutPath = path.join(app.getPath("desktop"), `${title}`); // 기존에 링크가 있다면 삭제 (오류 방지)
            this.removePathIfExists(shortcutPath);
            // 심볼릭 링크 생성 (원본 경로, 생성될 경로)
            fs.symlinkSync(installationPath, shortcutPath);
            log.info("맥 가상본(심볼릭 링크) 생성 완료");
            return { success: true, path: shortcutPath };
          }
        } catch (error) {
          log.error("바로가기 생성 중 오류 발생:", error);
          return { success: false, error: error.message };
        }
      },
    );

    ipcMain.handle("remove-shortcut", async (_event, title: string) => {
      try {
        const shortcutPaths: string[] = [];
        if (this.platformName === "win32") {
          const safeTitle = title.replace(/[\\/:*?"<>|]/g, "");
          shortcutPaths.push(
            path.join(app.getPath("desktop"), `${safeTitle}.lnk`),
          );
        } else if (this.platformName === "darwin") {
          shortcutPaths.push(path.join(app.getPath("desktop"), `${title}`));
          shortcutPaths.push(path.join(app.getPath("desktop"), `${title}.app`));
        }

        let removed = false;
        for (const shortcutPath of shortcutPaths) {
          if (this.removePathIfExists(shortcutPath)) {
            removed = true;
          }
        }

        return removed;
      } catch (error) {
        log.error("바로가기 제거 중 오류 발생:", error);
        return false;
      }
    });

    ipcMain.handle("get-desync-cache-size", async (_event) => {
      if (fs.existsSync(this.DESYNC_TEMP_PATH)) {
        const result = await getFoldersize(this.DESYNC_TEMP_PATH);
        if (typeof result === "number") {
          return result;
        }

        if (
          result &&
          typeof result === "object" &&
          "size" in result &&
          typeof result.size === "number"
        ) {
          if (
            "errors" in result &&
            Array.isArray(result.errors) &&
            result.errors.length > 0
          ) {
            log.warn("get-desync-cache-size partial errors:", result.errors);
          }
          return result.size;
        }

        return 0;
      }
      return 0;
    });

    ipcMain.handle("remove-desync-cache", async (_event) => {
      if (fs.existsSync(this.DESYNC_TEMP_PATH)) {
        fs.rmSync(this.DESYNC_TEMP_PATH, { recursive: true, force: true });
        return true;
      }
      return false;
    });

    // Open File
    ipcMain.handle("run-command", async (_event, command) => {
      return new Promise<string>((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
          if (error) {
            log.info("'run-command' error", stderr, error);
            reject(stderr || error.message);
          } else {
            log.info("'run-command' completed", stdout);
            resolve(stdout);
          }
        });
      });
    });

    ipcMain.handle(
      "run-game",
      async (event, gameId: number, gamePath: string) => {
        try {
          if (this.runningGames.has(gameId)) {
            log.warn(`Game ${gameId} is already running.`);
            return { success: false, error: "Game is already running." };
          }

          let executablePath = gamePath;
          const startTime = Date.now();

          if (this.platformName === "darwin" && gamePath.endsWith(".app")) {
            const macOSPath = path.join(gamePath, "Contents", "MacOS");
            if (fs.existsSync(macOSPath)) {
              const files = await promises.readdir(macOSPath);
              // .dylib 파일과 숨김 파일(.)을 제외한 첫 번째 파일 선택
              const binary = files.find(
                (f) => !f.endsWith(".dylib") && !f.startsWith("."),
              );
              if (binary) {
                executablePath = path.join(macOSPath, binary);
              }
            }
          }

          if (!fs.existsSync(executablePath)) {
            throw new Error(`Executable not found at ${executablePath}`);
          }

          log.info(`Starting game: ${executablePath}`);

          const child = spawn(executablePath, [], {
            detached: true,
            stdio: "ignore",
            cwd: path.dirname(executablePath),
          });

          this.runningGames.set(gameId, child);

          child.unref();

          child.on("close", (code) => {
            this.runningGames.delete(gameId);
            const endTime = Date.now();
            const durationInMinutes = Math.floor((endTime - startTime) / 60000);

            log.info(
              `Game closed: ${executablePath}. Playtime: ${durationInMinutes}m, ExitCode: ${code}`,
            );

            if (!event.sender.isDestroyed()) {
              event.sender.send(`game-closed-${gameId}`, durationInMinutes);
            }
          });

          return { success: true };
        } catch (error: any) {
          log.error("run-game error:", error);
          this.runningGames.delete(gameId);
          return { success: false, error: error.message };
        }
      },
    );

    ipcMain.handle("stop-game", async (event, gameId: number) => {
      try {
        const child = this.runningGames.get(gameId);
        if (!child) {
          return { success: false, error: "Game is not running." };
        }

        log.info(`Requesting graceful shutdown for game ${gameId}...`);

        // 1. 안전한 종료(SIGTERM) 요청
        child.kill("SIGTERM");

        // 2. 5초 뒤에도 프로세스가 살아있다면 강제 종료(SIGKILL)
        const forceKillTimeout = setTimeout(() => {
          if (this.runningGames.has(gameId)) {
            log.warn(
              `Game ${gameId} did not gracefully shutdown. Force killing...`,
            );
            child.kill("SIGKILL");
          }
        }, 5000); // 5초 대기

        // 프로세스가 무사히 종료되면 타이머 취소
        child.once("close", () => {
          clearTimeout(forceKillTimeout);
        });

        return { success: true };
      } catch (error: any) {
        log.error("stop-game error:", error);
        return { success: false, error: error.message };
      }
    });

    // Check Is Installed
    ipcMain.handle(
      "check-executable-or-app",
      async (_event, dirPath: string): Promise<boolean> => {
        try {
          const extensionName =
            this.platformName === "darwin" ? ".app/" : ".exe";
          const targetPath = dirPath + extensionName;
          log.info(`dirPath: ${dirPath}, targetPath: ${targetPath}`);
          return fs.existsSync(targetPath);
        } catch (error) {
          log.error(error);
          return false;
        }
      },
    );

    // Delete file
    ipcMain.handle("remove-file", (_event, targetPath: string): boolean => {
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
      async (_, value: GameInstallInfo): Promise<any> => {
        await this.gameInstallInfoDbReady;
        return new Promise((resolve, reject) => {
          // An upsert is atomic within NeDB and closes the read-then-insert
          // race that previously allowed duplicate gameId records.
          this.gameInstallInfoDb.update(
            { gameId: value.gameId },
            { $set: value },
            { upsert: true, returnUpdatedDocs: true },
            (err, _numAffected, affectedDocument) => {
              if (err) {
                reject(err);
              } else {
                resolve(affectedDocument);
              }
            },
          );
        });
      },
    );

    // 데이터 모두 가져오기
    ipcMain.handle(
      "game-install-info-get-all",
      async (_event): Promise<GameInstallInfo[]> => {
        await this.gameInstallInfoDbReady;
        return new Promise((resolve, reject) => {
          this.gameInstallInfoDb.find({}, (err, docs: GameInstallInfo[]) => {
            if (err) {
              log.error(err);
              reject(err);
            } else {
              log.info("GetByIndex Succeed: ", typeof docs, docs);
              resolve(docs);
            }
          });
        });
      },
    );

    // 데이터 가져오기
    ipcMain.handle(
      "game-install-info-get-by-index",
      async (_, gameIdIndex: number): Promise<GameInstallInfo> => {
        await this.gameInstallInfoDbReady;
        return new Promise((resolve, reject) => {
          this.gameInstallInfoDb.findOne(
            { gameId: gameIdIndex },
            (err, docs: GameInstallInfo) => {
              if (err) {
                log.error(err);
                reject(err);
              } else {
                log.info("GetByIndex Succeed: ", typeof docs, docs);
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
      async (_, gameIdIndex: number): Promise<any> => {
        await this.gameInstallInfoDbReady;
        return new Promise((resolve, reject) => {
          this.gameInstallInfoDb.remove(
            { gameId: gameIdIndex },
            { multi: true },
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
      async (_event, gameIdIndex: number, gameInstallInfo: GameInstallInfo) => {
        await this.gameInstallInfoDbReady;
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
            log.error(err);
            reject(err);
          } else {
            log.info("GetByIndex Succeed: ", typeof docs, docs);
            resolve(docs);
          }
        });
      });
    });

    ipcMain.handle(
      "get-default-game-installation-path",
      async (_event): Promise<string> => {
        return userStore.get("defaultGamePath");
      },
    );

    ipcMain.handle(
      "set-default-game-installation-path",
      async (_event, newPath: string): Promise<void> => {
        userStore.set("defaultGamePath", newPath);
      },
    );
  }

  private deprecatedHandlers() {
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
                  const progress = Math.round(
                    (extractedFiles / totalFiles) * 100,
                  );
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
        log.error("압축 해제 실패:", error);
        throw error;
      }
    });
  }
}

export { ipcHandle };

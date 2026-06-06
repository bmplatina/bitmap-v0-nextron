import { contextBridge, ipcRenderer, IpcRendererEvent } from "electron";
import type { GameInstallInfo, Settings } from "../renderer/lib/types";

const handler = {
  send(channel: string, value: unknown) {
    ipcRenderer.send(channel, value);
  },
  on(channel: string, callback: (...args: unknown[]) => void) {
    const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
      callback(...args);
    ipcRenderer.on(channel, subscription);

    return () => {
      ipcRenderer.removeListener(channel, subscription);
    };
  },
};

const deeplink = {
  setWindowIsReady: (isReady: boolean) => {
    ipcRenderer.send("window-is-ready", isReady);
  },
  onLauncherUrl: (callback: (url: string) => void) => {
    ipcRenderer.on("launcher-url", (_event: IpcRendererEvent, url: string) => {
      callback(url);
    });
  },
};

const electronTools = {
  onFullscreenChange: (callback: (fullscreenState: boolean) => void) => {
    ipcRenderer.on("fullscreen-change", (event, fullscreenState: boolean) =>
      callback(fullscreenState),
    );
  },
  removeFullscreenListener: () => {
    ipcRenderer.removeAllListeners("fullscreen-change");
  },

  // Window buttons
  closeApp: () => ipcRenderer.send("app-close"),
  minimizeApp: () => ipcRenderer.send("app-minimize"),
  maximizeApp: () => ipcRenderer.send("app-maximize"),
  isMaximized: () => ipcRenderer.invoke("is-maximized"),

  // Show Directory or File selector
  showDialog: (options: Electron.OpenDialogOptions) =>
    ipcRenderer.invoke("show-dialog", options),

  // Open external link in browser
  openExternal: (url: string) => ipcRenderer.invoke("open-external", url),

  // Get current OS
  getPlatform: () => ipcRenderer.invoke("get-platform"),

  getAppVersion: () => ipcRenderer.invoke("get-version"),

  // Get OS default language
  getLocale: () => ipcRenderer.invoke("get-locale"),

  setLocale: (locale: "ko" | "en") => ipcRenderer.invoke("set-locale", locale),

  // Get Application Stored Path
  getElectronStoredPath: () => ipcRenderer.invoke("get-electron-appdata-path"),

  // 업데이트 상태 수신
  onUpdateStatus: (callback: (status: any) => void) =>
    ipcRenderer.on("app-update-status", (_, value) => callback(value)),

  // 다운로드 진행률 수신
  onDownloadProgress: (callback: (progress: any) => void) =>
    ipcRenderer.on("app-update-download-progress", (_, value) =>
      callback(value),
    ),

  // 업데이트 설치 명령 전달
  quitAndInstall: () => ipcRenderer.send("quit-and-install"),

  onOpenHome: (callback: () => void) => {
    const subscription = () => callback();
    ipcRenderer.on("bitmap-home", subscription);
    return () => {
      ipcRenderer.removeListener("bitmap-home", subscription);
    };
  },
  onOpenGames: (callback: () => void) => {
    const subscription = () => callback();
    ipcRenderer.on("bitmap-games", subscription);
    return () => {
      ipcRenderer.removeListener("bitmap-games", subscription);
    };
  },

  onOpenDownloads: (callback: () => void) => {
    const subscription = () => callback();
    ipcRenderer.on("bitmap-downloads", subscription);
    return () => {
      ipcRenderer.removeListener("bitmap-downloads", subscription);
    };
  },
  onOpenLibrary: (callback: () => void) => {
    const subscription = () => callback();
    ipcRenderer.on("bitmap-library", subscription);
    return () => {
      ipcRenderer.removeListener("bitmap-library", subscription);
    };
  },

  onLogout: (callback: () => void) => {
    const subscription = () => callback();
    ipcRenderer.on("bitmap-id-logout", subscription);
    return () => {
      ipcRenderer.removeListener("bitmap-id-logout", subscription);
    };
  },
  onOpenAccountSettings: (callback: () => void) => {
    const subscription = () => callback();
    ipcRenderer.on("bitmap-account-settings", subscription);
    return () => {
      ipcRenderer.removeListener("bitmap-account-settings", subscription);
    };
  },
  onOpenPublisherDashboard: (callback: () => void) => {
    const subscription = () => callback();
    ipcRenderer.on("bitmap-publisher-dashboard", subscription);
    return () => {
      ipcRenderer.removeListener("bitmap-publisher-dashboard", subscription);
    };
  },
  onLogin: (callback: () => void) => {
    const subscription = () => callback();
    ipcRenderer.on("bitmap-id-login", subscription);
    return () => {
      ipcRenderer.removeListener("bitmap-id-login", subscription);
    };
  },
  onSignup: (callback: () => void) => {
    const subscription = () => callback();
    ipcRenderer.on("bitmap-id-signup", subscription);
    return () => {
      ipcRenderer.removeListener("bitmap-id-signup", subscription);
    };
  },

  onOpenAbout: (callback: () => void) => {
    const subscription = () => callback();
    ipcRenderer.on("bitmap-about", subscription);
    return () => {
      ipcRenderer.removeListener("bitmap-about", subscription);
    };
  },
  onOpenSettings: (callback: () => void) => {
    const subscription = () => callback();
    ipcRenderer.on("bitmap-settings", subscription);
    return () => {
      ipcRenderer.removeListener("bitmap-settings", subscription);
    };
  },
};

const bitmapApi = {
  // Axios
  axiosGet: <T>(
    identifier: string,
    uriSubstring: string,
    token?: string,
  ): Promise<T> =>
    ipcRenderer.invoke("axios-get", identifier, uriSubstring, token),

  onAxiosGetProgress: (
    identifier: string,
    callback: (progress: number) => void,
  ) => {
    const subscription = (_event: IpcRendererEvent, progress: number) =>
      callback(progress);
    ipcRenderer.on(`axios-get-progress-${identifier}`, subscription);
    return () => {
      ipcRenderer.removeListener(
        `axios-get-progress-${identifier}`,
        subscription,
      );
    };
  },

  axiosPost: <T>(
    identifier: string,
    uriSubstring: string,
    body: object,
    token?: string,
    contentType?: string,
  ): Promise<T> =>
    ipcRenderer.invoke(
      "axios-post",
      identifier,
      uriSubstring,
      body,
      token,
      contentType,
    ),

  onAxiosPostProgress: (
    identifier: string,
    callback: (progress: number) => void,
  ) => {
    const subscription = (_event: IpcRendererEvent, progress: number) =>
      callback(progress);
    ipcRenderer.on(`axios-post-progress-${identifier}`, subscription);
    return () => {
      ipcRenderer.removeListener(
        `axios-post-progress-${identifier}`,
        subscription,
      );
    };
  },

  axiosPut: <T>(
    identifier: string,
    uriSubstring: string,
    body: object,
    token?: string,
    contentType?: string,
  ): Promise<T> =>
    ipcRenderer.invoke(
      "axios-put",
      identifier,
      uriSubstring,
      body,
      token,
      contentType,
    ),

  onAxiosPutProgress: (
    identifier: string,
    callback: (progress: number) => void,
  ) => {
    const subscription = (_event: IpcRendererEvent, progress: number) =>
      callback(progress);
    ipcRenderer.on(`axios-put-progress-${identifier}`, subscription);
    return () => {
      ipcRenderer.removeListener(
        `axios-put-progress-${identifier}`,
        subscription,
      );
    };
  },

  axiosDelete: <T>(
    uriSubstring: string,
    body: object,
    token?: string,
    contentType?: string,
  ): Promise<T> =>
    ipcRenderer.invoke("axios-delete", uriSubstring, body, token, contentType),

  setToken: (token: string) => ipcRenderer.invoke("set-token", token),
  getToken: () => ipcRenderer.invoke("get-token"),

  setScreenMode: (screenMode: "light" | "system" | "dark") =>
    ipcRenderer.invoke("set-screen-mode", screenMode),
  getScreenMode: () => ipcRenderer.invoke("get-screen-mode"),

  // Download file
  downloadFile: (url: string, savePath: string) =>
    ipcRenderer.invoke("download-file", { url, savePath }),

  // Pull Game via desync
  pullGame: (gameId: number, destPath: string, bUseCache: boolean) =>
    ipcRenderer.invoke("pull-game", gameId, destPath, bUseCache),

  onGameInstallProgress: (
    gameId: number,
    callback: (progress: { percent: number; eta: string }) => void,
  ) => {
    const channel = `game-install-progress-${gameId}`;
    const subscription = (
      _event: IpcRendererEvent,
      progress: {
        percent: number;
        eta: string;
        speed: number;
      },
    ) => callback(progress);
    ipcRenderer.on(channel, subscription);
    return () => {
      ipcRenderer.removeListener(channel, subscription);
    };
  },

  onGameInstallComplete: (
    gameId: number,
    callback: (success: boolean) => void,
  ) => {
    const channel = `game-install-complete-${gameId}`;
    const subscription = (_event: IpcRendererEvent, success: boolean) =>
      callback(success);
    ipcRenderer.on(channel, subscription);
    return () => {
      ipcRenderer.removeListener(channel, subscription);
    };
  },

  // Get download progress
  onDownloadProgress: (callback: (progress: number) => void) =>
    ipcRenderer.on("download-progress", (_, progress) => callback(progress)),

  // Get download average speed
  onDownloadAvgSpeed: (callback: (progress: number) => void) =>
    ipcRenderer.on("download-speed-avg", (_, progress) => callback(progress)),

  // Get download average speed
  onDownloadRealtimeSpeed: (callback: (progress: number) => void) =>
    ipcRenderer.on("download-speed-realtime", (_, progress) =>
      callback(progress),
    ),

  // Cancel Download
  cancelDownload: (url: string) => ipcRenderer.invoke("download-cancel", url),

  // Pause Download
  pauseDownload: (url: string) => ipcRenderer.invoke("download-pause", url),

  // Resume Download
  resumeDownload: (url: string) => ipcRenderer.invoke("download-resume", url),

  // Extract *.zip file
  extractZip: (filePath: string) => ipcRenderer.invoke("extract-zip", filePath),

  // Create Shortcut
  createShortcut: (installationPath: string, title: string) =>
    ipcRenderer.invoke("create-shortcut", installationPath, title),

  removeShortcut: (title: string) =>
    ipcRenderer.invoke("remove-shortcut", title),

  // Get extraction progress
  onExtractProgress: (callback: (progress: number) => void) =>
    ipcRenderer.on("extract-progress", (_, progress) => callback(progress)),

  // Open file
  runCommand: (command: string) => ipcRenderer.invoke("run-command", command),

  // Run Game
  runGame: (gameId: number, gamePath: string) =>
    ipcRenderer.invoke("run-game", gameId, gamePath),

  onGameClosed: (
    gameId: number,
    callback: (durationInMinutes: number) => void,
  ) => {
    const channel = `game-closed-${gameId}`;
    const subscription = (_event: IpcRendererEvent, duration: number) =>
      callback(duration);
    ipcRenderer.on(channel, subscription);
    return () => {
      ipcRenderer.removeListener(channel, subscription);
    };
  },

  stopGame: (gameId: number) => ipcRenderer.invoke("stop-game", gameId),

  onGameTerminated: (
    gameId: number,
    callback: (durationInMinutes: number) => void,
  ) => bitmapApi.onGameClosed(gameId, callback),

  // Get desync cache size
  getDesyncCacheSize: () => ipcRenderer.invoke("get-desync-cache-size"),

  // Delete desync caches
  removeDesyncCache: () => ipcRenderer.invoke("remove-desync-cache"),

  // Remove file
  removeFile: (targetPath: string) =>
    ipcRenderer.invoke("remove-file", targetPath),

  // electron-store:insert
  setGameInstallInfo: (value: GameInstallInfo) =>
    ipcRenderer.invoke("game-install-info-insert", value),

  // electron-store:get
  getGameInstallInfoAll: () => ipcRenderer.invoke("game-install-info-get-all"),
  getGameInstallInfoByIndex: (gameIdIndex: number) =>
    ipcRenderer.invoke("game-install-info-get-by-index", gameIdIndex),

  // electron-store:delete
  deleteGameInstallInfo: (gameIdIndex: number) =>
    ipcRenderer.invoke("game-install-info-delete", gameIdIndex),

  // electron-store:update
  updateGameInstallInfo: (
    gameIdIndex: number,
    gameInstallInfo: GameInstallInfo,
  ) =>
    ipcRenderer.invoke(
      "game-install-info-update",
      gameIdIndex,
      gameInstallInfo,
    ),

  updateSettings: (newSettings: Settings) =>
    ipcRenderer.invoke("settings-update", newSettings),

  getSettings: () => ipcRenderer.invoke("settings-get"),

  // Check is the given game path valid
  checkPathValid: (dirPath: string) =>
    ipcRenderer.invoke("check-executable-or-app", dirPath),

  // Get Default Game Installation Path
  getDefaultGameInstallationPath: () =>
    ipcRenderer.invoke("get-default-game-installation-path"),

  // Get Default Game Installation Path
  setDefaultGameInstallationPath: (newPath: string) =>
    ipcRenderer.invoke("set-default-game-installation-path", newPath),
};

contextBridge.exposeInMainWorld("ipc", handler);
contextBridge.exposeInMainWorld("deeplink", deeplink);
contextBridge.exposeInMainWorld("electronTools", electronTools);
contextBridge.exposeInMainWorld("bitmapApi", bitmapApi);

export type IpcHandler = typeof handler;

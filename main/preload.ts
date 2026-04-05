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
};

const bitmapApi = {
  // Axios
  axiosPost: <T>(
    uriSubstring: string,
    body: object,
    token?: string,
    contentType?: string,
  ): Promise<T> =>
    ipcRenderer.invoke("axios-post", uriSubstring, body, token, contentType),

  onAxiosPostProgress: (callback: (progress: number) => void) => {
    const subscription = (_event: IpcRendererEvent, progress: number) =>
      callback(progress);
    ipcRenderer.on("axios-post-progress", subscription);
    return () => {
      ipcRenderer.removeListener("axios-post-progress", subscription);
    };
  },

  axiosGet: <T>(uriSubstring: string, token?: string): Promise<T> =>
    ipcRenderer.invoke("axios-get", uriSubstring, token),

  onAxiosGetProgress: (callback: (progress: number) => void) => {
    const subscription = (_event: IpcRendererEvent, progress: number) =>
      callback(progress);
    ipcRenderer.on("axios-get-progress", subscription);
    return () => {
      ipcRenderer.removeListener("axios-get-progress", subscription);
    };
  },

  setToken: (token: string) => ipcRenderer.invoke("set-token", token),
  getToken: () => ipcRenderer.invoke("get-token"),

  setScreenMode: (screenMode: "light" | "system" | "dark") =>
    ipcRenderer.invoke("set-screen-mode", screenMode),
  getScreenMode: () => ipcRenderer.invoke("get-screen-mode"),

  // Download file
  downloadFile: (url: string, savePath: string) =>
    ipcRenderer.invoke("download-file", { url, savePath }),

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
  cancelDownload: () => ipcRenderer.invoke("download-cancel"),

  // Extract *.zip file
  extractZip: (filePath: string) => ipcRenderer.invoke("extract-zip", filePath),

  // Create Shortcut
  createShortcut: (installationPath: string, title: string) =>
    ipcRenderer.invoke("create-shortcut", installationPath, title),

  // Get extraction progress
  onExtractProgress: (callback: (progress: number) => void) =>
    ipcRenderer.on("extract-progress", (_, progress) => callback(progress)),

  // Open file
  runCommand: (command: string) => ipcRenderer.invoke("run-command", command),

  // Remove file
  removeFile: (targetPath: string) =>
    ipcRenderer.invoke("remove-file", targetPath),

  // electron-store:insert
  setGameInstallInfo: (value: GameInstallInfo) =>
    ipcRenderer.invoke("game-install-info-insert", value),

  // electron-store:get
  getGameInstallInfoAll: () =>
    ipcRenderer.invoke("game-install-info-get-all"),
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

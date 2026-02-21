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
  onLauncherUrl: (callback) => {
    ipcRenderer.on("launcher-url", (_event, url: string) => {
      callback(url);
    });
  },
};

const electronTools = {
  onFullscreenChange: (callback) => {
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
};

const bitmapApi = {
  // Axios
  axiosPost: <T>(
    uriSubstring: string,
    body: object,
    token: string,
  ): Promise<T> => ipcRenderer.invoke("axios-post", uriSubstring, body, token),

  axiosGet: <T>(uriSubstring: string, token?: string): Promise<T> =>
    ipcRenderer.invoke("axios-get", uriSubstring, token),

  // Bypass CORS
  fetchData: (url: string) => ipcRenderer.invoke("fetch-data", url),

  // Download file
  downloadFile: (url: string, savePath: string) =>
    ipcRenderer.invoke("download-file", { url, savePath }),

  // Get download progress
  onDownloadProgress: (callback: (progress: number) => void) =>
    ipcRenderer.on("download-progress", (_, progress) => callback(progress)),

  // Extract *.zip file
  extractZip: (filePath: string) => ipcRenderer.invoke("extract-zip", filePath),

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

  // Auth
  login: (username: string, password: string) =>
    ipcRenderer.invoke("login", username, password),
  register: (username: string, email: string, password: string) =>
    ipcRenderer.invoke("register", username, email, password),
  logout: () => ipcRenderer.invoke("logout"),
  getCookies: (cookieName: string) =>
    ipcRenderer.invoke("get-cookies", cookieName),
};

contextBridge.exposeInMainWorld("ipc", handler);
contextBridge.exposeInMainWorld("deeplink", deeplink);
contextBridge.exposeInMainWorld("electronTools", electronTools);
contextBridge.exposeInMainWorld("bitmapApi", bitmapApi);

export type IpcHandler = typeof handler;

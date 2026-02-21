import Electron = require("electron");
import { ipcRenderer, IpcRendererEvent } from "electron";
import { Platform } from "electron-builder";

/**
 * Should match main/preload.ts for typescript support in renderer
 */
export interface Handler {
  send: (channel: string, value: unknown) => void;
  on: (channel: string, callback: (...args: unknown[]) => void) => function;
}

export interface deepLink {
  setWindowIsReady: (isReady: boolean) => void;
  onLauncherUrl: (callback) => void;
}

export interface tools {
  onFullscreenChange: (callback: (fullscreenState: boolean) => void) => void;
  removeFullscreenListener: () => void;

  closeApp: () => void;
  minimizeApp: () => void;
  maximizeApp: () => void;
  isMaximized: () => Promise<boolean>;

  // Show Directory or File selector
  showDialog: (options: Electron.OpenDialogOptions) => Promise<string>;

  // Opens external link
  openExternal: (url: string) => void;

  getPlatform: () => string;

  getLocale: () => "ko" | "en";

  setLocale: (locale: "ko" | "en") => void;

  getElectronStoredPath: () => Promise<string>;
}

export interface bitmapApi {
  // Axios
  axiosPost: <T>(
    uriSubstring: string,
    body: object,
    token?: string,
    contentType?: string,
  ) => Promise<T>;
  onAxiosPostProgress: (callback: (progress: number) => void) => () => void;
  axiosGet: <T>(uriSubstring: string, token?: string) => Promise<T>;
  onAxiosGetProgress: (callback: (progress: number) => void) => () => void;

  // Token Handler
  setToken: (token: string) => void;
  getToken: () => string;
  setScreenMode: (screenMode: string) => void;
  getScreenMode: () => string;

  // Get JSON data with bypassing CORS
  fetchData: (url: string) => Promise<any>;

  downloadFile: (url: string | null, savePath: string) => string;
  onDownloadProgress: (callback: (progress: number) => void) => number;
  extractZip: (filePath: string) => string;
  onExtractProgress: (callback: (progress: number) => void) => number;

  runCommand: (command: string) => Promise<string>;

  removeFile: (targetPath: string) => Promise<boolean>;

  setGameInstallInfo: (value: GameInstallInfo) => Promise<any>;
  getGameInstallInfoByIndex: (gameIdIndex: number) => Promise<any>;
  deleteGameInstallInfo: (gameIdIndex: number) => Promise<any>;
  updateGameInstallInfo: (
    gameIdIndex: number,
    gameInstallInfo: GameInstallInfo,
  ) => Promise<any>;

  updateSettings: (newSettings: Settings) => Promise<any>;
  getSettings: () => Promise<any>;

  checkPathValid: (dirPath: string) => Promise<boolean>;

  login: (username: string, password: string) => Promise<any>;
  register: (
    username: string,
    email: string,
    password: string,
  ) => Promise<boolean>;
  logout: () => Promise<any>;
  getCookies: (cookieName: string) => Promise<string>;
}

declare global {
  interface Window {
    handler: Handler;
    deeplink: deepLink;
    electronTools: tools;
    bitmapApi: bitmapApi;
    i18n: {
      t: (key: string) => Promise<string>;
      changeLanguage: (lng: string) => Promise<void>;
    };
  }
}

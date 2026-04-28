import { GameInstallInfo } from "@/lib/types";
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

  getPlatform: () => Promise<string>;

  getLocale: () => "ko" | "en";

  setLocale: (locale: "ko" | "en") => void;

  getElectronStoredPath: () => Promise<string>;

  onUpdateStatus: (cb: (status: UpdateStatus) => void) => void;
  onDownloadProgress: (cb: (progress: UpdateProgress) => void) => void;
  quitAndInstall: () => void;
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
  getToken: () => Promise<string>;
  setScreenMode: (screenMode: "light" | "system" | "dark") => void;
  getScreenMode: () => "light" | "system" | "dark";

  downloadFile: (url: string | null, savePath: string) => Promise<string>;
  onDownloadProgress: (callback: (progress: number) => void) => number;
  onDownloadAvgSpeed: (callback: (progress: number) => void) => number;
  onDownloadRealtimeSpeed: (callback: (progress: number) => void) => number;
  cancelDownload: (url: string) => void;
  pauseDownload: (url: string) => void;
  resumeDownload: (url: string) => void;
  // Extract *.zip file
  extractZip: (filePath: string) => string;
  // Create Shortcut
  createShortcut: (
    installationPath: string,
    title: string,
  ) => Promise<{ success: boolean; path: string }>;
  removeShortcut: (title: string) => Promise<void>;

  onExtractProgress: (callback: (progress: number) => void) => number;

  runCommand: (command: string) => Promise<string>;

  removeFile: (targetPath: string) => Promise<boolean>;

  setGameInstallInfo: (value: GameInstallInfo) => Promise<any>;
  getGameInstallInfoAll: () => Promise<GameInstallInfo[]>;
  getGameInstallInfoByIndex: (gameIdIndex: number) => Promise<GameInstallInfo>;
  deleteGameInstallInfo: (gameIdIndex: number) => Promise<any>;
  updateGameInstallInfo: (
    gameIdIndex: number,
    gameInstallInfo: GameInstallInfo,
  ) => Promise<any>;

  updateSettings: (newSettings: Settings) => Promise<any>;
  getSettings: () => Promise<any>;

  checkPathValid: (dirPath: string) => Promise<boolean>;

  getDefaultGameInstallationPath: () => Promise<string>;

  setDefaultGameInstallationPath: (newPath: string) => Promise<void>;
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

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
  getAppVersion: () => Promise<string>;

  getLocale: () => Promise<"ko" | "en">;

  setLocale: (locale: "ko" | "en") => Promise<void>;

  getElectronStoredPath: () => Promise<string>;

  onUpdateStatus: (cb: (status: UpdateStatus) => void) => void;
  onDownloadProgress: (cb: (progress: UpdateProgress) => void) => void;
  quitAndInstall: () => void;
}

export interface bitmapApi {
  // Axios
  axiosGet: <T>(
    identifier: string,
    uriSubstring: string,
    token?: string,
  ) => Promise<T>;
  onAxiosGetProgress: (
    identifier: string,
    callback: (progress: number) => void,
  ) => () => void;

  axiosPost: <T>(
    identifier: string,
    uriSubstring: string,
    body: object,
    token?: string,
    contentType?: string,
  ) => Promise<T>;
  onAxiosPostProgress: (
    identifier: string,
    callback: (progress: number) => void,
  ) => () => void;

  axiosPut: <T>(
    identifier: string,
    uriSubstring: string,
    body: object,
    token?: string,
    contentType?: string,
  ) => Promise<T>;
  onAxiosPutProgress: (
    identifier: string,
    callback: (progress: number) => void,
  ) => () => void;

  axiosDelete: <T>(
    uriSubstring: string,
    body: object,
    token?: string,
    contentType?: string,
  ) => Promise<T>;

  // Token Handler
  setToken: (token: string) => void;
  getToken: () => Promise<string>;
  setScreenMode: (screenMode: "light" | "system" | "dark") => void;
  getScreenMode: () => "light" | "system" | "dark";

  downloadFile: (url: string | null, savePath: string) => Promise<string>;

  pullGame: (
    gameId: number,
    destPath: string,
    bUseCache: boolean,
  ) => Promise<void>;
  onGameInstallProgress: (
    gameId: number,
    callback: (progress: {
      percent: number;
      eta: string;
      speed: number;
    }) => void,
  ) => () => void;
  onGameInstallComplete: (
    gameId: number,
    callback: (success: boolean) => void,
  ) => () => void;
  getDesyncCacheSize: () => Promise<number>;
  removeDesyncCache: () => Promise<boolean>;

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
  removeShortcut: (title: string) => Promise<boolean>;

  onExtractProgress: (callback: (progress: number) => void) => number;

  runCommand: (command: string) => Promise<string>;

  runGame: (
    gameId: number,
    gamePath: string,
  ) => Promise<{ success: boolean; error?: any }>;

  onGameClosed: (
    gameId: number,
    callback: (durationInMinutes: number) => void,
  ) => () => void;

  stopGame: (gameId: number) => Promise<{ success: boolean; error?: any }>;
  onGameTerminated: (
    gameId: number,
    callback: (durationInMinutes: number) => void,
  ) => () => void;

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

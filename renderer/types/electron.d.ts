import Electron = require("electron");
import {ipcRenderer, IpcRendererEvent} from "electron";

/**
 * Should match main/preload.ts for typescript support in renderer
 */
export interface Handler {
    sendMessage: (message: string) => void,

    onFullscreenChange: (callback: (fullscreenState: boolean) => void) => void,
    removeFullscreenListener: () => void,

    send: (channel: string, value: unknown) => void,
    on: (channel: string, callback: (...args: unknown[]) => void) => function,
    setWindowIsReady: (isReady: boolean) => void,
    onLauncherUrl: (callback) => void,
}

export interface deepLink {
    sendMessage: (message: string) => void,

    onFullscreenChange: (callback: (fullscreenState: boolean) => void) => void,
    removeFullscreenListener: () => void,

    send: (channel: string, value: unknown) => void,
    on: (channel: string, callback: (...args: unknown[]) => void) => function,
    setWindowIsReady: (isReady: boolean) => void,
    onLauncherUrl: (callback) => void,
}

export interface tools {
    // Show Directory or File selector
    showDialog: (options: Electron.OpenDialogOptions) => Promise<string>,

    // Bypass CORS
    fetchData: (url: string) => Promise<any>,

    openExternal: (url: string) => void
}

declare global {
    interface Window {
        handler: Handler,
        deeplink: deepLink,
        electronTools: tools,
        i18n: {
            t: (key: string) => Promise<string>;
            changeLanguage: (lng: string) => Promise<void>;
        };
    }
}

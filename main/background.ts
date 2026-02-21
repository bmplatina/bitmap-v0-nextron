// Default Imports
import path, { join } from "path";
import { app, BrowserWindow, dialog, ipcMain, session, shell } from "electron";
import serve from "electron-serve";
import * as helpers from "./helpers";
import i18next from "../next-i18next.config";

// Platform
const bIsProd = process.env.NODE_ENV === "production";
const platformName = process.platform;

// Window State
let windowIsReady: boolean = false;
let mainWindow: BrowserWindow = null;

// Deeplinks
const protocolScheme: string = "bitmap";

if (bIsProd) {
  serve({ directory: "app" });
} else {
  app.setPath("userData", `${app.getPath("userData")} (development)`);
}

const getMainWindowWhenReady = async () => {
  if (!windowIsReady) {
    await new Promise((resolve) => ipcMain.once("window-is-ready", resolve));
  }
  return mainWindow;
};

(async () => {
  const shouldContinue = checkLauncherUrl(getMainWindowWhenReady);
  if (!shouldContinue) return;

  await app.whenReady();

  ipcMain.once("window-is-ready", () => {
    windowIsReady = true;
  });

  mainWindow = helpers.createWindow("main", {
    title: "Bitmap",
    width: 1440,
    height: 900,
    minWidth: 1366,
    minHeight: 768,
    autoHideMenuBar: true,
    titleBarStyle: "hidden",
    trafficLightPosition: {
      x: 17,
      y: 16,
    },
    titleBarOverlay: {
      height: 48,
      color: "#00000000",
      symbolColor: "#FFFFFFFF",
    },
    frame: false, // platformName === 'darwin',
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      webviewTag: true,
      devTools: !bIsProd, // devTools: bIsDev,
    },
  });

  const locale = helpers.userStore.get("locale", i18next.i18n.defaultLocale);
  console.log("Using locale:", locale);

  // CORS 우회 설정
  session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    details.requestHeaders["Origin"] = "https://api.prodbybitmap.com";
    callback({ cancel: false, requestHeaders: details.requestHeaders });
  });

  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        "Access-Control-Allow-Origin": ["*"],
        "Access-Control-Allow-Headers": ["*"],
        "Access-Control-Allow-Methods": ["*"],
      },
    });
  });

  if (bIsProd) {
    await mainWindow.loadURL(`app://./${locale}`);
  } else {
    const port = process.argv[2];
    await mainWindow.loadURL(`http://localhost:${port}/${locale}`);
    mainWindow.webContents.openDevTools();
  }

  // 여기에 전체 화면 이벤트 리스너 추가
  mainWindow.on("enter-full-screen", () => {
    mainWindow.webContents.send("fullscreen-change", true);
  });

  mainWindow.on("leave-full-screen", () => {
    mainWindow.webContents.send("fullscreen-change", false);
  });
})();

app.on("window-all-closed", () => {
  app.quit();
});

function checkLauncherUrl(getMainWindow) {
  if (process.platform === "darwin") {
    app.on("open-url", async (_event, url) => {
      const mainWindow = await getMainWindow();
      mainWindow.webContents.send("launcher-url", url);
      mainWindow.isMinimized() && mainWindow.restore();
    });
  }

  if (process.platform === "win32") {
    const gotTheLock = app.requestSingleInstanceLock();
    if (!gotTheLock) {
      app.quit();
      return false;
    }

    // app.setAsDefaultProtocolClient('your-custom-protocol-scheme')
    app.setAsDefaultProtocolClient(protocolScheme);

    app.on("second-instance", async (_event, args) => {
      const mainWindow = await getMainWindow();

      const url = args.find((arg) =>
        // arg.startsWith(`${'your-custom-protocol-scheme'}://`)
        arg.startsWith(`${protocolScheme}://`),
      );
      url && mainWindow.webContents.send("launcher-url", url);

      mainWindow.isMinimized() && mainWindow.restore();
      mainWindow.focus();
    });

    const url = process.argv.find((arg) =>
      arg.startsWith(`${protocolScheme}://`),
    );
    url &&
      getMainWindow().then((mainWindow) =>
        mainWindow.webContents.send("launcher-url", url),
      );
  }

  return true;
}

function getIsMac(): boolean {
  return platformName === "darwin";
}

const ipcImplement: helpers.ipcHandle = new helpers.ipcHandle(
  bIsProd,
  mainWindow,
  platformName,
);
ipcImplement.initializeIpc();

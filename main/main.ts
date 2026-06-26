// Default Imports
import path, { join } from "path";
import {
  app,
  BrowserWindow,
  Menu,
  ipcMain,
  protocol,
  session,
  shell,
  nativeTheme,
} from "electron";
import serve from "electron-serve";
import * as helpers from "./helpers";

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
}

// 기본 프로토콜이 http와 유사하게 동작하도록 등록
protocol.registerSchemesAsPrivileged([
  {
    scheme: "app",
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      corsEnabled: true, // CORS 허용
      allowServiceWorkers: true,
    },
  },
]);

const getMainWindowWhenReady = async () => {
  if (!windowIsReady) {
    await new Promise((resolve) => ipcMain.once("window-is-ready", resolve));
  }
  return mainWindow;
};

(async () => {
  const shouldContinue = checkLauncherUrl(getMainWindowWhenReady);
  if (!shouldContinue) return;

  if (!bIsProd) {
    app.setPath("userData", `${app.getPath("userData")} (development)`);
  }

  await app.whenReady();

  // 윈도우에서 defaultGamePath가 비어있는 경우(초기 실행) 설정
  if (platformName === "win32") {
    const currentDefaultPath = helpers.userStore.get("defaultGamePath");
    if (!currentDefaultPath) {
      helpers.userStore.set("defaultGamePath", app.getPath("userData"));
    }
  }

  // 유튜브 152-4 오류 해결을 위해 User-Agent에서 Electron 문자열 제거
  const defaultUserAgent = session.defaultSession.getUserAgent();
  session.defaultSession.setUserAgent(
    platformName === "darwin"
      ? "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.4 Safari/605.1.15"
      : "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36",
    "",
    //defaultUserAgent.replace(/Electron\/[^\s]+\s/g, ""),
  );

  ipcMain.once("window-is-ready", () => {
    windowIsReady = true;
  });

  const savedScreenMode: helpers.types.screenMode =
    (helpers.userStore.get("screenMode") as helpers.types.screenMode) ||
    "system";
  nativeTheme.themeSource = savedScreenMode;

  const isDarkMode =
    savedScreenMode === "dark" ||
    (savedScreenMode === "system" && nativeTheme.shouldUseDarkColors);
  const initialSymbolColor = isDarkMode ? "#FFFFFFFF" : "#000000FF";
  const initialOverlayColor = isDarkMode ? "#00000000" : "#FFFFFF00";

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
      color: initialOverlayColor,
      symbolColor: initialSymbolColor,
    },
    frame: false, // platformName === 'darwin',
    webPreferences: {
      preload: path.join(import.meta.dirname, "preload.js"),
      webviewTag: true,
      devTools: true, // !bIsProd, // devTools: bIsDev,
    },
  });

  const bIsFirstRun = helpers.userStore.get("isFirstRun", true);

  if (bIsFirstRun) {
    const localeRegExp: RegExp = /[-_].*$/;
    const systemLocale = app.getSystemLocale().replace(localeRegExp, "");
    helpers.userStore.set("locale", systemLocale);
    helpers.userStore.set("isFirstRun", false);
  }

  const locale = helpers.userStore.get("locale", "en");

  // iframe 내부에서 열리는 외부 링크 (유튜브 제목 등)를 기본 브라우저로 리디렉션
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("http://") || url.startsWith("https://")) {
      shell.openExternal(url);
    }
    return { action: "deny" };
  });

  mainWindow.webContents.on("will-navigate", (event, url) => {
    // 내부 탐색(app:// 또는 localhost)이 아닐 경우 기본 브라우저에서 열기
    if (
      url.startsWith("http") &&
      !url.includes("localhost") &&
      !url.includes("youtube-nocookie.com/embed") &&
      !url.includes("youtube.com/embed")
    ) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });

  // CORS 및 유튜브 우회 설정
  session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    try {
      const url = new URL(details.url);
      const host = url.hostname;
      const isYouTube =
        host.includes("youtube.com") ||
        host.includes("youtube-nocookie.com") ||
        host.includes("googleapis.com") ||
        host.includes("googlevideo.com") ||
        host.includes("ytimg.com");
      const isBitmapApi = host === "api.prodbybitmap.com";

      if (isYouTube) {
        details.requestHeaders["Referer"] = "https://www.youtube-nocookie.com/";
        details.requestHeaders["Origin"] = "https://www.youtube-nocookie.com";
      } else if (isBitmapApi && !details.requestHeaders["Origin"]) {
        details.requestHeaders["Origin"] = "https://api.prodbybitmap.com";
      }
    } catch (e) {}
    callback({ cancel: false, requestHeaders: details.requestHeaders });
  });

  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    let responseHeaders = details.responseHeaders || {};
    try {
      const url = new URL(details.url);
      const host = url.hostname;
      const isYouTube =
        host.includes("youtube.com") ||
        host.includes("youtube-nocookie.com") ||
        host.includes("googleapis.com") ||
        host.includes("googlevideo.com") ||
        host.includes("ytimg.com");
      const isBitmapApi = host === "api.prodbybitmap.com";

      if (isYouTube) {
        delete responseHeaders["x-frame-options"];
        delete responseHeaders["X-Frame-Options"];
        delete responseHeaders["content-security-policy"];
      } else if (isBitmapApi) {
        responseHeaders = {
          ...responseHeaders,
          "Access-Control-Allow-Origin": ["*"],
          "Access-Control-Allow-Headers": ["*"],
          "Access-Control-Allow-Methods": ["*"],
        };
      }
    } catch (e) {}

    callback({ responseHeaders });
  });

  if (bIsProd) {
    await mainWindow.loadURL(`app://./${locale}`);
  } else {
    const port = process.argv[2];
    await mainWindow.loadURL(`http://localhost:${port}/${locale}`);
    mainWindow.webContents.openDevTools();
  }

  // 창이 렌더링 준비를 마쳤을 때 업데이트 확인 시작
  mainWindow.once("ready-to-show", () => {
    helpers.log.info("앱이 실행되었습니다. 업데이트를 확인합니다.");
    if (app.isPackaged) {
      helpers.updater.checkForUpdates();
    }
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  // 여기에 전체 화면 이벤트 리스너 추가
  mainWindow.on("enter-full-screen", () => {
    mainWindow.webContents.send("fullscreen-change", true);
  });

  mainWindow.on("leave-full-screen", () => {
    mainWindow.webContents.send("fullscreen-change", false);
  });

  const ipcImplement: helpers.ipcHandle = new helpers.ipcHandle(
    bIsProd,
    platformName,
  );

  ipcImplement.initializeIpc();

  helpers.setMenu(mainWindow);

  console.log(
    "helpers.log file location:",
    helpers.log.transports.file.getFile().path,
  );
})();

app.on("window-all-closed", () => {
  app.quit();
});

function checkLauncherUrl(getMainWindow) {
  // 프로토콜 등록 (개발 환경 대응)
  if (!app.isPackaged) {
    app.setAsDefaultProtocolClient(protocolScheme, process.execPath, [
      path.resolve(process.argv[1]),
    ]);
  } else {
    app.setAsDefaultProtocolClient(protocolScheme);
  }

  if (process.platform === "darwin") {
    app.on("open-url", async (event, url) => {
      event.preventDefault();
      const mainWindow = await getMainWindow();
      mainWindow.webContents.send("launcher-url", url);
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    });
  }

  if (process.platform === "win32") {
    const gotTheLock = app.requestSingleInstanceLock();
    if (!gotTheLock) {
      app.quit();
      return false;
    }

    app.on("second-instance", async (_event, args) => {
      const mainWindow = await getMainWindow();

      const url = args.find((arg) => arg.startsWith(`${protocolScheme}://`));
      if (url) {
        mainWindow.webContents.send("launcher-url", url);
      }

      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    });

    const url = process.argv.find((arg) =>
      arg.startsWith(`${protocolScheme}://`),
    );
    if (url) {
      getMainWindow().then((mainWindow) =>
        mainWindow.webContents.send("launcher-url", url),
      );
    }
  }

  return true;
}

function getIsMac(): boolean {
  return platformName === "darwin";
}

// 업데이트 확인 중
helpers.updater.onCheckingForUpdates(() => {
  helpers.log.info("업데이트 확인 중...");
  mainWindow?.webContents.send("app-update-status", {
    status: "checking",
    message: "업데이트를 확인 중입니다.",
  });
});

// 새로운 업데이트가 있을 때 (UpdateInfo 타입 적용)
helpers.updater.onUpdateAvailable((updateInfo) => {
  helpers.log.info(`업데이트가 가능합니다. 새 버전: ${updateInfo.version}`);
  mainWindow?.webContents.send("app-update-status", {
    status: "available",
    message: `새 버전 ${updateInfo.version}을 다운로드합니다.`,
  });
});

// 현재 최신 버전일 때 (UpdateInfo 타입 적용)
helpers.updater.onUpdateNotAvailable((updateInfo) => {
  helpers.log.info(`현재 최신 버전(${updateInfo.version})입니다.`);
  mainWindow?.webContents.send("app-update-status", {
    status: "not-available",
    message: `현재 최신 버전(${updateInfo.version})입니다.`,
  });
});

// 업데이트 다운로드 중 오류 발생 시
helpers.updater.onError((error) => {
  helpers.log.error("업데이트 오류 발생:", error.message);
  mainWindow?.webContents.send("app-update-status", {
    status: "error",
    message: `업데이트 중 오류 발생: ${error.message}`,
  });
});

// 다운로드 진행 상태 (ProgressInfo 타입 적용)
helpers.updater.onDownloadProgress((progressObj) => {
  const speed = (progressObj.bytesPerSecond / 1024 / 1024).toFixed(2); // MB/s로 변환
  const percent = progressObj.percent.toFixed(2);
  const transferred = (progressObj.transferred / 1024 / 1024).toFixed(2);
  const total = (progressObj.total / 1024 / 1024).toFixed(2);

  helpers.log.info(
    `다운로드 속도: ${speed} MB/s - 진행률: ${percent}% (${transferred}MB / ${total}MB)`,
  );

  mainWindow?.webContents.send("app-update-download-progress", {
    percent: progressObj.percent,
    transferred: progressObj.transferred,
    total: progressObj.total,
    bytesPerSecond: progressObj.bytesPerSecond,
  });
});

// 다운로드가 완료되었을 때 (UpdateInfo 타입 적용)
helpers.updater.onUpdateDownloaded((updateInfo) => {
  helpers.log.info(
    `업데이트 다운로드 완료. 다운로드된 버전: ${updateInfo.version}`,
  );

  mainWindow?.webContents.send("app-update-status", {
    status: "downloaded",
    message: "업데이트 다운로드 완료. 재시작 시 적용됩니다.",
  });

  // 사용자가 하던 작업을 저장할 수 있도록 바로 종료하지 않고,
  // 렌더러 프로세스에 알려서 사용자에게 팝업을 띄우는 것이 좋습니다.
  // 아래 코드는 주석 처리해 두고, 필요시 활성화합니다.

  // helpers.updater.quitAndInstall();
});

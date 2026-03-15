// Default Imports
import path, { join } from "path";
import {
  app,
  BrowserWindow,
  dialog,
  ipcMain,
  protocol,
  session,
  shell,
} from "electron";
import serve from "electron-serve";
import * as helpers from "./helpers";
import i18next from "../next-i18next.config";
import { autoUpdater, UpdateInfo, ProgressInfo } from "electron-updater";
import log from "electron-log";

// Platform
const bIsProd = process.env.NODE_ENV === "production";
const platformName = process.platform;

// Window State
let windowIsReady: boolean = false;
let mainWindow: BrowserWindow = null;

// Deeplinks
const protocolScheme: string = "bitmap";

// 로거 설정 (업데이트 상태를 파일로 기록)
autoUpdater.logger = log;
(autoUpdater.logger as typeof log).transports.file.level = "info";
autoUpdater.autoDownload = true; // 자동 다운로드 명시적 설정
autoUpdater.autoInstallOnAppQuit = true; // 앱 종료 시 자동 설치
autoUpdater.allowPrerelease = true; // 알파/베타 버전 업데이트 허용 (현재 버전이 -alpha이므로 필수)

if (bIsProd) {
  serve({ directory: "app" });
} else {
  app.setPath("userData", `${app.getPath("userData")} (development)`);
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

  await app.whenReady();

  // 유튜브 152-4 오류 해결을 위해 User-Agent에서 Electron 문자열 제거
  const defaultUserAgent = session.defaultSession.getUserAgent();
  session.defaultSession.setUserAgent(
    defaultUserAgent.replace(/Electron\/[^\s]+\s/g, ""),
  );

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

  // iframe 내부에서 열리는 외부 링크 (유튜브 제목 등)를 기본 브라우저로 리디렉션
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("http://") || url.startsWith("https://")) {
      shell.openExternal(url);
    }
    return { action: "deny" };
  });

  mainWindow.webContents.on("will-navigate", (event, url) => {
    // 내부 탐색(app:// 또는 localhost)이 아닐 경우 기본 브라우저에서 열기
    if (url.startsWith("http") && !url.includes("localhost") && !url.includes("youtube-nocookie.com/embed")) {
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

      if (isYouTube) {
        details.requestHeaders["Referer"] = "https://www.youtube-nocookie.com/";
        details.requestHeaders["Origin"] = "https://www.youtube-nocookie.com";
      } else {
        if (!details.requestHeaders["Origin"]) {
          details.requestHeaders["Origin"] = "https://api.prodbybitmap.com";
        }
      }
    } catch (e) {
      details.requestHeaders["Origin"] = "https://api.prodbybitmap.com";
    }
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

      if (isYouTube) {
        delete responseHeaders["x-frame-options"];
        delete responseHeaders["X-Frame-Options"];
        delete responseHeaders["content-security-policy"];
      } else {
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
    log.info("앱이 실행되었습니다. 업데이트를 확인합니다.");
    if (app.isPackaged) {
      autoUpdater.checkForUpdatesAndNotify();
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
autoUpdater.on("checking-for-update", () => {
  log.info("업데이트 확인 중...");
  mainWindow?.webContents.send("app-update-status", {
    status: "checking",
    message: "업데이트를 확인 중입니다.",
  });
});

// 새로운 업데이트가 있을 때 (UpdateInfo 타입 적용)
autoUpdater.on("update-available", (info: UpdateInfo) => {
  log.info(`업데이트가 가능합니다. 새 버전: ${info.version}`);
  mainWindow?.webContents.send("app-update-status", {
    status: "available",
    message: `새 버전 ${info.version}을 다운로드합니다.`,
  });
});

// 현재 최신 버전일 때 (UpdateInfo 타입 적용)
autoUpdater.on("update-not-available", (info: UpdateInfo) => {
  log.info(`현재 최신 버전(${info.version})입니다.`);
  mainWindow?.webContents.send("app-update-status", {
    status: "not-available",
    message: `현재 최신 버전(${info.version})입니다.`,
  });
});

// 업데이트 다운로드 중 오류 발생 시
autoUpdater.on("error", (err: Error) => {
  log.error("업데이트 오류 발생:", err.message);
  mainWindow?.webContents.send("app-update-status", {
    status: "error",
    message: `업데이트 중 오류 발생: ${err.message}`,
  });
});

// 다운로드 진행 상태 (ProgressInfo 타입 적용)
autoUpdater.on("download-progress", (progressObj: ProgressInfo) => {
  const speed = (progressObj.bytesPerSecond / 1024 / 1024).toFixed(2); // MB/s로 변환
  const percent = progressObj.percent.toFixed(2);
  const transferred = (progressObj.transferred / 1024 / 1024).toFixed(2);
  const total = (progressObj.total / 1024 / 1024).toFixed(2);

  log.info(
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
autoUpdater.on("update-downloaded", (info: UpdateInfo) => {
  log.info(`업데이트 다운로드 완료. 다운로드된 버전: ${info.version}`);

  mainWindow?.webContents.send("app-update-status", {
    status: "downloaded",
    message: "업데이트 다운로드 완료. 재시작 시 적용됩니다.",
  });

  // 사용자가 하던 작업을 저장할 수 있도록 바로 종료하지 않고,
  // 렌더러 프로세스에 알려서 사용자에게 팝업을 띄우는 것이 좋습니다.
  // 아래 코드는 주석 처리해 두고, 필요시 활성화합니다.

  // autoUpdater.quitAndInstall();
});

const ipcImplement: helpers.ipcHandle = new helpers.ipcHandle(
  bIsProd,
  mainWindow,
  platformName,
);

ipcImplement.initializeIpc();

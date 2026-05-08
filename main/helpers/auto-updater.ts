import electronUpdater from "electron-updater";
import type { AppUpdater, UpdateInfo, ProgressInfo } from "electron-updater";
import log from "./logger";

function getAutoUpdater(): AppUpdater {
  // Access via default import property due to CommonJS interop of 'electron-updater'.
  return (electronUpdater as { autoUpdater: AppUpdater }).autoUpdater;
}

class ElectronUpdater {
  private static instance: ElectronUpdater;

  private readonly autoUpdater: AppUpdater;

  private constructor() {
    this.autoUpdater = getAutoUpdater();
  }

  public static getInstance(): ElectronUpdater {
    if (!ElectronUpdater.instance) {
      ElectronUpdater.instance = new ElectronUpdater();
    }
    return ElectronUpdater.instance;
  }

  public checkForUpdates() {
    log.transports.file.level = "info";
    this.autoUpdater.logger = log;

    this.autoUpdater.autoDownload = true; // 자동 다운로드 명시적 설정
    this.autoUpdater.autoInstallOnAppQuit = true; // 앱 종료 시 자동 설치
    this.autoUpdater.allowPrerelease = true; // 알파/베타 버전 업데이트 허용 (현재 버전이 -alpha이므로 필수)
    this.autoUpdater.checkForUpdatesAndNotify();
  }

  public quitAndInstall() {
    this.autoUpdater.quitAndInstall();
  }

  public onCheckingForUpdates(listener: () => void) {
    this.autoUpdater.on("checking-for-update", listener);
  }

  public onUpdateAvailable(listener: (info: UpdateInfo) => void) {
    this.autoUpdater.on("update-available", listener);
  }

  public onUpdateNotAvailable(listener: (info: UpdateInfo) => void) {
    this.autoUpdater.on("update-not-available", listener);
  }

  public onError(listener: (err: Error) => void) {
    this.autoUpdater.on("error", listener);
  }

  public onDownloadProgress(listener: (progressObj: ProgressInfo) => void) {
    this.autoUpdater.on("download-progress", listener);
  }

  public onUpdateDownloaded(listener: (info: UpdateInfo) => void) {
    this.autoUpdater.on("update-downloaded", listener);
  }
}

export default ElectronUpdater.getInstance();

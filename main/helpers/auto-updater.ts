import electronUpdater from "electron-updater";
import type { AppUpdater, UpdateInfo, ProgressInfo } from "electron-updater";
import log from "./logger";

function getAutoUpdater(): AppUpdater {
  // Access via default import property due to CommonJS interop of 'electron-updater'.
  return (electronUpdater as { autoUpdater: AppUpdater }).autoUpdater;
}

const autoUpdater: AppUpdater = getAutoUpdater();

class ElectronUpdater {
  public checkForUpdates() {
    log.transports.file.level = "info";
    autoUpdater.logger = log;

    autoUpdater.autoDownload = true; // 자동 다운로드 명시적 설정
    autoUpdater.autoInstallOnAppQuit = true; // 앱 종료 시 자동 설치
    autoUpdater.allowPrerelease = true; // 알파/베타 버전 업데이트 허용 (현재 버전이 -alpha이므로 필수)
    autoUpdater.checkForUpdatesAndNotify();
  }
}

export { autoUpdater, ElectronUpdater, UpdateInfo, ProgressInfo };

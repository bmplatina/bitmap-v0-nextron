import { makeAutoObservable } from 'mobx';

interface Game {
  gameId: number
  gameTitle: string
  gameLatestRevision: number
  gamePlatformWindows: number
  gamePlatformMac: number
  gamePlatformMobile: number
  gameEngine: string
  gameGenre: string
  gameDeveloper: string
  gamePublisher: string
  isEarlyAccess: number
  isReleased: number
  gameReleasedDate: string
  gameWebsite: string
  gameVideoURL: string
  gameDownloadMacURL: string | null
  gameDownloadWinURL: string | null
  gameImageURL: string
  gameBinaryName: string
  gameHeadline: string
  gameDescription: string
}

interface GameInstallInfo extends Game {
  gameInstallationPath: string;
  gameInstalledVersion: number;
  gameInstallState: EInstallState;
}

interface Metadata {
  title?: string
  description?: string
}

interface Settings {
  id: number,
  lang: string,
  screenMode: string,
}

enum EInstallState {
  NotInstalled,
  Downloading,
  Extracting,
  Installed,
  InstallError
}

class GameInstallManager {
  constructor() {
    makeAutoObservable(this);
  }

  private bIsMac: boolean;

  // Installation Infos
  private defaultInstallationPath: string | null = '';
  private installationPath: string | null = '';
  private installState: EInstallState = EInstallState.NotInstalled;
  private downloadProgress: number = 0;
  private extractProgress: number = 0;
  private currentVersion: number = 0;
  private bIsUpdatable: boolean = false;

  // Interface Game
  private game: Game | null = null;
  private gameId: number = 0;
  private gameTitle: string = '';
  private gameLatestRevision: number = 0;
  private gamePlatformWindows: number= 0;
  private gamePlatformMac: number = 0;
  private gamePlatformMobile: number = 0;
  private gameEngine: string = '';
  private gameGenre: string = '';
  private gameDeveloper: string = '';
  private gamePublisher: string = '';
  private isEarlyAccess: number = 0;
  private isReleased: number = 0;
  private gameReleasedDate: string = '';
  private gameWebsite: string = '';
  private gameVideoURL: string = '';
  private gameDownloadMacURL: string | null = '';
  private gameDownloadWinURL: string | null = '';
  private gameImageURL: string = '';
  private gameBinaryName: string = '';
  private gameHeadline: string = '';
  private gameDescription: string = '';

  set setGameInfo(newGame: Game | null) {
    if (newGame === null) {
      console.warn('Attempting to set game info with null value');
      return;
    }

    this.gameId = newGame.gameId;
    this.gameTitle = newGame.gameTitle;
    this.gameLatestRevision = newGame.gameLatestRevision;
    this.gamePlatformWindows = newGame.gamePlatformWindows;
    this.gamePlatformMac = newGame.gamePlatformMac;
    this.gamePlatformMobile = newGame.gamePlatformMobile;
    this.gameEngine = newGame.gameEngine;
    this.gameGenre = newGame.gameGenre;
    this.gameDeveloper = newGame.gameDeveloper;
    this.gamePublisher = newGame.gamePublisher;
    this.isEarlyAccess = newGame.isEarlyAccess;
    this.isReleased = newGame.isReleased;
    this.gameReleasedDate = newGame.gameReleasedDate;
    this.gameWebsite = newGame.gameWebsite;
    this.gameVideoURL = newGame.gameVideoURL;
    this.gameDownloadMacURL = newGame.gameDownloadMacURL;
    this.gameDownloadWinURL = newGame.gameDownloadWinURL;
    this.gameImageURL = newGame.gameImageURL;
    this.gameBinaryName = newGame.gameBinaryName;
    this.gameHeadline = newGame.gameHeadline;
    this.gameDescription = newGame.gameDescription;

    this.game = newGame;
  }

  get getGameInfo(): Game {
    if (!this.game) {
      this.game = {
        gameId: this.gameId,
        gameTitle: this.gameTitle,
        gameLatestRevision: this.gameLatestRevision,
        gamePlatformWindows: this.gamePlatformWindows,
        gamePlatformMac: this.gamePlatformMac,
        gamePlatformMobile: this.gamePlatformMobile,
        gameEngine: this.gameEngine,
        gameGenre: this.gameGenre,
        gameDeveloper: this.gameDeveloper,
        gamePublisher: this.gamePublisher,
        isEarlyAccess: this.isEarlyAccess,
        isReleased: this.isReleased,
        gameReleasedDate: this.gameReleasedDate,
        gameWebsite: this.gameWebsite,
        gameVideoURL: this.gameVideoURL,
        gameDownloadMacURL: this.gameDownloadMacURL,
        gameDownloadWinURL: this.gameDownloadWinURL,
        gameImageURL: this.gameImageURL,
        gameBinaryName: this.gameBinaryName,
        gameHeadline: this.gameHeadline,
        gameDescription: this.gameDescription,
      };
    }

    return this.game;
  }

  get getIsMac(): boolean {
    return this.bIsMac;
  }

  set setIsMac(newIsMac: boolean) {
    this.bIsMac = newIsMac;
    console.log(`setIsMac: ${this.bIsMac}`);
  }

  get getDefaultInstallationPath(): string | null {
    return this.defaultInstallationPath;
  }

  set setDefaultInstallationPath(newDefaultInstallationPath: string | null) {
    this.defaultInstallationPath = newDefaultInstallationPath;
  }

  get getInstallationPath(): string | null {
    return this.installationPath;
  }

  set setInstallationPath(newInstallationPath: string | null) {
    this.installationPath = newInstallationPath;
  }

  get getInstallState(): EInstallState {
    return this.installState;
  }

  set setInstallState(newInstallState: EInstallState) {
    this.installState = newInstallState;
  }

  get getDownloadProgress(): number {
    return this.downloadProgress;
  }

  set setDownloadProgress(newDownloadProgress: number) {
    this.downloadProgress = newDownloadProgress;
  }

  get getExtractProgress(): number {
    return this.extractProgress;
  }

  set setExtractProgress(newExtractProgress: number) {
    this.extractProgress = newExtractProgress;
  }

  get getCurrentVersion(): number {
    return this.currentVersion;
  }

  set setCurrentVersion(newCurrentVersion: number) {
    this.currentVersion = newCurrentVersion;
  }

  get getIsUpdatable(): boolean {
    return this.bIsUpdatable;
  }

  set setIsUpdatable(newIsUpdatable: boolean) {
    this.bIsUpdatable = newIsUpdatable;
  }

  /**
   * Download and Install Game. Do not call this function directly.
   * @param url gameDownloadPlatformUrl
   * @param savePath InstallationPath
   */
  async downloadAndInstall(url: string | null, savePath: string) {
    if(url == null) return;

    const savePathLocal: string | null = this.bIsMac
        ? `${savePath}/${url.split('/')[url.split('/').length - 1]}`
        : `${savePath}\\${url.split('/')[url.split('/').length - 1]}`;
    console.log(`URL: ${url}, SavePath: ${savePathLocal}`);

    try {
      // 다운로드 진행률 수신
      window.bitmapApi.onDownloadProgress((progress) => {
        this.installState = EInstallState.Downloading;
        this.downloadProgress = progress;
        console.log(`다운로드 중: ${this.downloadProgress}, EInstallState.Downloading: ${this.installState === EInstallState.Downloading}`);
      });

      // 다운로드 요청
      const filePath = await window.bitmapApi.downloadFile(url, savePathLocal);
      console.log(`다운로드 완료: ${filePath}, EInstallState.Downloading: ${this.installState === EInstallState.Downloading}`);

      // 압축 해제 진행률 수신
      window.bitmapApi.onExtractProgress((progress) => {
        this.installState = EInstallState.Extracting;
        this.extractProgress = progress;
        console.log(`압축 해제 중: ${this.downloadProgress}, EInstallState.Extracting: ${this.installState === EInstallState.Extracting}`);
      });

      // 압축 해제 요청
      const extractedPath = await window.bitmapApi.extractZip(filePath);
      console.log(`압축 해제 완료: ${extractedPath}, EInstallState.Extracting: ${this.installState === EInstallState.Extracting}`);

      this.installState = EInstallState.Installed; // 작업 완료
      this.currentVersion = this.getGameInfo.gameLatestRevision;
      this.bIsUpdatable = false;
      await this.pushInstallState();
      console.log(`설치 완료: EInstallState.Installed: ${this.installState === EInstallState.Installed}`);
    }
    catch (error) {
      this.installState = EInstallState.InstallError;
      console.error('오류 발생:', error);
    }
  }

  /**
   * Insert or Update InstallState: GameInstallInfo to NeDB
   */
  async pushInstallState() {
    try {
      const getResultLocal: Promise<GameInstallInfo> = window.bitmapApi.getGameInstallInfoByIndex(this.getGameInfo.gameId);
      getResultLocal.then((resolvedData: GameInstallInfo) => {
        console.log("pushInstallState::resolvedData", resolvedData);
        let InstallInfo: GameInstallInfo = {
          ...this.getGameInfo,
          gameInstallationPath: this.installationPath,
          gameInstallState: this.installState,
          gameInstalledVersion: this.currentVersion,
        };

        const bUpdateExising: boolean = !!resolvedData;
        console.log("pushInstallState::bUpdateExisting", bUpdateExising);
        // If resolvedData valid, Update from the existing table, otherwise insert a new table
        if(bUpdateExising) {
          window.bitmapApi.updateGameInstallInfo(this.getGameInfo.gameId, InstallInfo);
        }
        else {
          window.bitmapApi.setGameInstallInfo(InstallInfo);
        }
      });
    } catch (error) {
      console.log(error);
    }
  }

  // NeDB Installation Info saver
  async pullInstallState() {
    try {
      // Declare default installation path
      const getDefaultInstallPath = window.electronTools.getElectronStoredPath();
      getDefaultInstallPath.then((appPath) => {
        console.log("getDefaultInstallPath: ", appPath);
        let DefaultInstallationPathLocal = this.bIsMac
            ? `/Users/Shared/Bitmap Production/${this.game.gameBinaryName}`
            : `${appPath}\\BitmapApps\\${this.game.gameBinaryName}`;

        this.defaultInstallationPath = DefaultInstallationPathLocal;
      });

      const getResultLocal = window.bitmapApi.getGameInstallInfoByIndex(this.game.gameId);
      getResultLocal.then((resolvedData: GameInstallInfo) => {
        console.log("pullInstallState::resolvedData", resolvedData);
        // If getting from store succeed, allocate it to property
        if(!!resolvedData) {
          console.log("pullInstallState: If getting from store succeed, allocate it to property", resolvedData);
          this.installState = resolvedData.gameInstallState;
          this.installationPath = resolvedData.gameInstallationPath;
          this.currentVersion = resolvedData.gameInstalledVersion;
          if(this.game.gameLatestRevision > this.currentVersion) {
            this.bIsUpdatable = true;
          }
        }
        // Otherwise, initialize property
        else {
          console.log('pullInstallState: Otherwise, initialize property');
          this.installationPath = '';
          this.installState = EInstallState.NotInstalled;
          this.currentVersion = 0;
        }

        // Check is installation path valid
        if(this.installationPath) {
          const literalInstallationPath = this.bIsMac
              ? `${this.installationPath}/${this.game.gameBinaryName}`
              : `${this.installationPath}\\${this.game.gameBinaryName}`;

          window.bitmapApi.checkPathValid(literalInstallationPath).then((bIsValid: boolean) => {
            console.log(`pullInstallState::checkPathValid: ${bIsValid} from game ${this.game.gameTitle}`);
            this.installState = bIsValid ? EInstallState.Installed : EInstallState.NotInstalled;
          });
        }
        else this.installState = EInstallState.NotInstalled;

        // Sync installation state
        this.pushInstallState();
      });
    } catch (error) {
      console.log(error);
    }
  }
}

export { EInstallState, GameInstallManager };
export type { Game, GameInstallInfo, Metadata, Settings };
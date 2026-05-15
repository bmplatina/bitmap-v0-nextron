import { bitmapApi, tools } from "@/types/electron";
import {
  EInstallState,
  GameInstallInfo,
  GameWithSize,
  RatingDetails,
  stringLocalized,
} from "./types";
import { makeAutoObservable, runInAction } from "mobx";
import { getGamePlaytime, setGamePlaytime, updateGamePlaytime } from "./games";

class GameInstallManager {
  constructor(isPlatformMac: boolean) {
    makeAutoObservable(this);
    this.bIsMac = isPlatformMac;
  }

  private bIsMac: boolean = true;
  private bShowInDownloadDrawer = false;

  // Installation Infos
  private defaultInstallationPath: string | null = "";
  private installationPath: string | null = "";
  private binaryAbsPath: string = "";
  private installState: EInstallState = EInstallState.NotInstalled;
  private downloadProgress: number = 0;
  private downloadSpeedRealtime: number = 0;
  private downloadEta: string = "";
  private extractProgress: number = 0;
  private currentVersion: number = 0;
  private bIsUpdatable: boolean = false;
  private playtime: number = 0;

  // Interface Game
  private game: GameWithSize = {
    gameId: 0,
    isApproved: false,
    uid: "",
    gameTitle: "",
    gameLatestRevision: 0,
    gamePlatformWindows: false,
    gamePlatformMac: false,
    gameEngine: "",
    gameGenre: { ko: "", en: "" },
    gameDeveloper: "",
    gamePublisher: "",
    isEarlyAccess: false,
    isReleased: false,
    gameReleasedDate: "",
    gameWebsite: "",
    gameVideoURL: "",
    gameDownloadMacURL: null,
    requirementsMac: null,
    gameDownloadWinURL: null,
    requirementsWindows: null,
    gameImageURL: [],
    gameBinaryName: "",
    gameHeadline: { ko: "", en: "" },
    gameDescription: { ko: "", en: "" },
    size: [0, 0],
    ageRating: 0,
    customEula: "",
    ratingContentDescriptors: [],
  };

  private gameId: number = 0;
  private isApproved: boolean = false;
  private uid: string = "";
  private gameTitle: string = "";
  private gameLatestRevision: number = 0;
  private gamePlatformWindows: boolean = false;
  private gamePlatformMac: boolean = false;
  private gameEngine: string = "";
  private gameGenre: stringLocalized = { ko: "", en: "" };
  private gameDeveloper: string = "";
  private gamePublisher: string = "";
  private isEarlyAccess: boolean = false;
  private isReleased: boolean = false;
  private gameReleasedDate: string = "";
  private gameWebsite: string = "";
  private gameVideoURL: string = "";
  private gameDownloadMacURL: string | null = "";
  private requirementsMac: string | null = "";
  private gameDownloadWinURL: string | null = "";
  private requirementsWindows: string | null = "";
  private gameImageURL: string[] = [""];
  private gameBinaryName: string = "";
  private gameHeadline: stringLocalized = { ko: "", en: "" };
  private gameDescription: stringLocalized = { ko: "", en: "" };
  private gameSize: number[] = [0, 0];
  private ageRating: number = 0;
  private customEula: string = "";
  private ratingContentDescriptors: RatingDetails[] = [];

  set setShowInDownloadDrawer(bNewVisibility: boolean) {
    this.bShowInDownloadDrawer = bNewVisibility;
  }

  get getShowInDownloadDrawer(): boolean {
    return this.bShowInDownloadDrawer;
  }

  set setGameInfo(newGame: GameWithSize | null) {
    if (newGame === null) {
      console.warn("Attempting to set game info with null value");
      return;
    }

    this.gameId = newGame.gameId;

    this.gameTitle = newGame.gameTitle;
    this.gameLatestRevision = newGame.gameLatestRevision;
    this.gamePlatformWindows = newGame.gamePlatformWindows;
    this.gamePlatformMac = newGame.gamePlatformMac;
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
    this.requirementsMac = newGame.requirementsMac;
    this.gameDownloadWinURL = newGame.gameDownloadWinURL;
    this.requirementsWindows = newGame.requirementsWindows;
    this.gameImageURL = newGame.gameImageURL;
    this.gameBinaryName = newGame.gameBinaryName;
    this.gameHeadline = newGame.gameHeadline;
    this.gameDescription = newGame.gameDescription;
    this.gameSize = newGame.size;
    this.ageRating = newGame.ageRating;
    this.customEula = newGame.customEula;
    this.ratingContentDescriptors = newGame.ratingContentDescriptors;

    this.game = newGame;
  }

  get getGameInfo(): GameWithSize {
    if (!this.game) {
      this.game = {
        gameId: this.gameId,
        isApproved: this.isApproved,
        uid: this.uid,
        gameTitle: this.gameTitle,
        gameLatestRevision: this.gameLatestRevision,
        gamePlatformWindows: this.gamePlatformWindows,
        gamePlatformMac: this.gamePlatformMac,
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
        requirementsMac: this.requirementsMac,
        gameDownloadWinURL: this.gameDownloadWinURL,
        requirementsWindows: this.requirementsWindows,
        gameImageURL: this.gameImageURL,
        gameBinaryName: this.gameBinaryName,
        gameHeadline: this.gameHeadline,
        gameDescription: this.gameDescription,
        size: this.gameSize,
        ageRating: this.ageRating,
        customEula: this.customEula,
        ratingContentDescriptors: this.ratingContentDescriptors,
      };
    }

    return this.game;
  }

  get getIsDownloadingOrInstallingState(): boolean {
    return (
      this.installState === EInstallState.Downloading ||
      this.installState === EInstallState.Extracting
    );
  }

  get getIsMac(): boolean {
    return this.bIsMac;
  }

  set setIsMac(newIsMac: boolean) {
    this.bIsMac = newIsMac;
    console.log(`setIsMac: ${this.bIsMac}`);
  }

  get getGameTitle(): string {
    return this.gameTitle;
  }

  get getGameImageURL(): string[] {
    return this.gameImageURL;
  }

  get getPlatformWin(): boolean {
    return this.game.gamePlatformWindows;
  }

  get getPlatformMac(): boolean {
    return this.game.gamePlatformMac;
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

  get getBinaryAbsoluatePath(): string {
    return this.binaryAbsPath;
  }

  set setInstallationPath(newInstallationPath: string | null) {
    this.installationPath = this.bIsMac
      ? `${newInstallationPath}/${this.gameBinaryName}/`
      : `${newInstallationPath}\\${this.gameBinaryName}\\`;
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

  get getDownloadSpeedRealtime(): number {
    return this.downloadSpeedRealtime;
  }

  get getDownloadEta(): string {
    return this.downloadEta;
  }

  get getExtractProgress(): number {
    return this.extractProgress;
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

  get getCustomEula(): string {
    return this.customEula;
  }

  get getPlaytime(): number {
    return this.playtime;
  }

  set setPlaytime(newPlaytime: number) {
    this.playtime = newPlaytime;
  }

  pauseDownload(context: bitmapApi) {
    if (this.installState === EInstallState.Downloading) {
      const url = this.bIsMac
        ? this.gameDownloadMacURL
        : this.gameDownloadWinURL;
      if (url) {
        context.pauseDownload(url);
        this.installState = EInstallState.Paused;
      }
    }
  }

  resumeDownload(context: bitmapApi) {
    if (this.installState === EInstallState.Paused) {
      const url = this.bIsMac
        ? this.gameDownloadMacURL
        : this.gameDownloadWinURL;
      if (url) {
        context.resumeDownload(url);
        this.installState = EInstallState.Downloading;
      }
    }
  }

  cancelDownload(context: bitmapApi) {
    if (
      this.installState === EInstallState.Downloading ||
      this.installState === EInstallState.Paused
    ) {
      const url = this.bIsMac
        ? this.gameDownloadMacURL
        : this.gameDownloadWinURL;
      if (url) {
        context.cancelDownload(url);
        const savePathLocal: string | null = this.bIsMac
          ? `${this.installationPath}/${url?.split("/")[url?.split("/").length - 1]}`
          : `${this.installationPath}\\${url?.split("/")[url?.split("/").length - 1]}`;
        context.removeFile(savePathLocal);
        this.installState = EInstallState.NotInstalled;
        this.downloadProgress = 0;
        this.downloadSpeedRealtime = 0;
      }
    }
  }

  async createShortcut(context: bitmapApi) {
    await context.createShortcut(this.binaryAbsPath, this.gameTitle);
  }

  formatTime(timeStr: string, type: "ko" | "digital"): string {
    const regex = /(\d+)m(\d+)s/;
    const match = timeStr.match(regex);

    if (!match) return "00:00"; // 혹은 에러 처리

    const [_, m, s] = match;

    if (type === "ko") {
      return `${m}분 ${s}초`;
    }

    // 한 자리 숫자일 경우 앞에 0을 붙여 00:00 포맷 유지
    return `${m.padStart(2, "0")}:${s.padStart(2, "0")}`;
  }

  /**
   * Download and Install Game. Do not call this function directly.
   * @param bCreateShortcut boolean to create a shortcut upon install
   */
  async downloadAndInstall(
    context: bitmapApi,
    bCreateShortcut: boolean,
  ): Promise<string> {
    // macOS: <installRoot>/<gameName>.app, Windows: <installRoot> (files are extracted directly here)
    const installRootPath = (this.installationPath ?? "").replace(
      /[\\/]+$/,
      "",
    );
    const destPath = this.bIsMac
      ? `${installRootPath}/${this.gameBinaryName}.app`
      : installRootPath;

    return new Promise<string>((resolve, reject) => {
      runInAction(() => {
        this.installState = EInstallState.Downloading;
      });

      const unsubscribeProgress = context.onGameInstallProgress(
        this.gameId,
        (progress) => {
          runInAction(() => {
            this.downloadProgress = progress.percent;
            this.downloadSpeedRealtime = progress.speed;
            this.downloadEta = this.formatTime(progress.eta, "digital");
          });
          console.log(
            `다운로드 중: ${this.downloadProgress}% 속도: ${this.downloadSpeedRealtime}, ETA: ${this.downloadEta}`,
          );
        },
      );

      const unsubscribeComplete = context.onGameInstallComplete(
        this.gameId,
        async (success) => {
          unsubscribeProgress();
          unsubscribeComplete();

          if (success) {
            runInAction(() => {
              this.installState = EInstallState.Installed; // 작업 완료
              this.currentVersion = this.getGameInfo.gameLatestRevision;
              this.bIsUpdatable = false;
            });
            await this.pushInstallState(context);
            console.log(`설치 완료!`);

            runInAction(() => {
              this.binaryAbsPath = this.bIsMac
                ? destPath
                : `${destPath}\\${this.gameBinaryName}.exe`;
            });

            if (bCreateShortcut) {
              this.createShortcut(context);
            }
            resolve("success");
          } else {
            runInAction(() => {
              this.installState = EInstallState.InstallError;
            });
            console.error("오류 발생: 다운로드 실패");
            resolve("failed");
          }
        },
      );

      context.pullGame(this.gameId, destPath, this.bIsMac).catch((err) => {
        unsubscribeProgress();
        unsubscribeComplete();
        runInAction(() => {
          this.installState = EInstallState.InstallError;
        });
        console.error("오류 발생:", err);
        const errorMessage =
          err instanceof Error ? err.message : String(err ?? "failed");
        resolve(errorMessage);
      });
    });
  }

  /**
   * Insert or Update InstallState: GameInstallInfo to NeDB
   */
  async pushInstallState(context: bitmapApi) {
    try {
      const getResultLocal: Promise<GameInstallInfo> =
        context.getGameInstallInfoByIndex(this.getGameInfo.gameId);
      getResultLocal.then((resolvedData: GameInstallInfo) => {
        console.log("pushInstallState::resolvedData", resolvedData);
        let InstallInfo: GameInstallInfo = {
          ...this.getGameInfo,
          gameInstallationPath: this.installationPath ?? "",
          gameInstallState: this.installState,
          gameInstalledVersion: this.currentVersion,
        };

        const bUpdateExising: boolean = !!resolvedData;
        console.log("pushInstallState::bUpdateExisting", bUpdateExising);
        // If resolvedData valid, Update from the existing table, otherwise insert a new table
        if (bUpdateExising) {
          context.updateGameInstallInfo(
            this.getGameInfo.gameId,
            JSON.parse(JSON.stringify(InstallInfo)),
          );
        } else {
          context.setGameInstallInfo(JSON.parse(JSON.stringify(InstallInfo)));
        }
      });
    } catch (error) {
      console.log(error);
    }
  }

  // NeDB Installation Info saver
  async pullInstallState(ElectronTools: tools, BitmapAPI: bitmapApi) {
    if (this.getIsDownloadingOrInstallingState) {
      console.log(
        "Already downloading/installing, skipping pullInstallState to preserve state.",
      );
      return;
    }

    try {
      // Declare default installation path
      const defaultPath =
        (await BitmapAPI.getDefaultGameInstallationPath()) ||
        (await ElectronTools.getElectronStoredPath());

      console.log("getDefaultInstallPath: ", defaultPath);
      let DefaultInstallationPathLocal = this.bIsMac
        ? `${defaultPath}/${this.game.gameBinaryName}`
        : `${defaultPath}\\BitmapApps\\${this.game.gameBinaryName}`;

      runInAction(() => {
        this.defaultInstallationPath = DefaultInstallationPathLocal;
      });

      const getResultLocal = await BitmapAPI.getGameInstallInfoByIndex(
        this.game.gameId,
      );

      console.log("pullInstallState::resolvedData", getResultLocal);
      // If getting from store succeed, allocate it to property
      runInAction(() => {
        if (!!getResultLocal) {
          console.log(
            "pullInstallState: If getting from store succeed, allocate it to property",
            getResultLocal,
          );
          this.installState = getResultLocal.gameInstallState;
          this.installationPath = getResultLocal.gameInstallationPath;
          this.currentVersion = getResultLocal.gameInstalledVersion;
          if (this.game.gameLatestRevision > this.currentVersion) {
            this.bIsUpdatable = true;
          }
        }
        // Otherwise, initialize property
        else {
          console.log("pullInstallState: Otherwise, initialize property");
          this.installationPath = this.defaultInstallationPath;
          this.installState = EInstallState.NotInstalled;
          this.currentVersion = 0;
        }
      });

      // Check is installation path valid
      if (this.installationPath) {
        const literalInstallationPath = this.bIsMac
          ? `${this.installationPath}/${this.game.gameBinaryName}`
          : `${this.installationPath}\\${this.game.gameBinaryName}`;

        BitmapAPI.checkPathValid(literalInstallationPath).then(
          (bIsValid: boolean) => {
            runInAction(() => {
              console.log(
                `pullInstallState::checkPathValid: ${bIsValid} from game ${this.game.gameTitle}`,
              );
              this.installState = bIsValid
                ? EInstallState.Installed
                : EInstallState.NotInstalled;
            });
          },
        );
      } else {
        runInAction(() => {
          this.installState = EInstallState.NotInstalled;
        });
      }

      // Sync installation state
      this.pushInstallState(BitmapAPI);
    } catch (error) {
      console.log(error);
    }
  }

  async openApp(context: bitmapApi) {
    const token = await context.getToken();
    try {
      const playtime = await getGamePlaytime(context, token, this.gameId);

      if (!playtime) {
        await setGamePlaytime(context, token, this.gameId, 0);
      } else {
        this.playtime = playtime.playtime;
      }
    } catch (error: any) {
      console.log("플레이타임 조회 오류:", error);
    }

    try {
      if (!this.binaryAbsPath) {
        runInAction(() => {
          this.binaryAbsPath = this.bIsMac
            ? `${this.installationPath}/${this.game.gameBinaryName}.app`
            : `${this.installationPath}\\${this.game.gameBinaryName}.exe`;
        });
      }
      const unsubscribeGameClosed = context.onGameClosed(
        this.gameId,
        async (durationInMinutes: number) => {
          runInAction(() => {
            this.playtime += durationInMinutes;
          });
          unsubscribeGameClosed();
          await updateGamePlaytime(context, token, this.gameId, this.playtime);
        },
      );
      const result = await context.runGame(this.gameId, this.binaryAbsPath);
      if (!result.success) {
        unsubscribeGameClosed();
      }
      console.log("명령 실행 성공:", result.success);
    } catch (error: any) {
      console.error("명령 실행 중 오류:", error?.error);
    }
  }

  async removeApp(context: bitmapApi) {
    if (this.installationPath) {
      console.log(this.installationPath);
      await context.removeShortcut(this.gameTitle);
      if (await context.removeFile(this.installationPath)) {
        runInAction(() => {
          this.installState = EInstallState.NotInstalled;
          this.installationPath = this.defaultInstallationPath;
        });
        await context.deleteGameInstallInfo(this.gameId);
        await this.pushInstallState(context);
      }
    }
  }
}

class GameDownloadQueueMgr {
  private static instance: GameDownloadQueueMgr;
  private queue: QueueTask[] = [];
  private currentTask: QueueTask | null = null;
  private bIsProcessing = false;
  private taskByGameId = new Map<number, QueueTask>();

  private constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  public static getInstance(): GameDownloadQueueMgr {
    if (!GameDownloadQueueMgr.instance) {
      GameDownloadQueueMgr.instance = new GameDownloadQueueMgr();
    }
    return GameDownloadQueueMgr.instance;
  }

  /**
   * FIFO 큐에 설치 작업을 추가한다.
   * 동일 gameId가 이미 실행 중이거나 대기 중이면 기존 Promise를 반환한다.
   */
  enqueue(
    manager: GameInstallManager,
    context: bitmapApi,
    bCreateShortcut: boolean,
  ): Promise<string> {
    const gameId = manager.getGameInfo.gameId;
    const existingTask = this.taskByGameId.get(gameId);
    if (existingTask) {
      return existingTask.promise;
    }

    let resolvePromise: (value: string) => void = () => {};
    const promise = new Promise<string>((resolve) => {
      resolvePromise = resolve;
    });

    const task: QueueTask = {
      gameId,
      manager,
      context,
      bCreateShortcut,
      promise,
      resolve: resolvePromise,
    };

    this.taskByGameId.set(gameId, task);
    this.queue.push(task);
    this.processNext();

    return promise;
  }

  /**
   * 대기열(아직 실행 전)에서 특정 게임을 제거한다.
   */
  removeFromQueue(gameId: number): boolean {
    const queuedIndex = this.queue.findIndex((task) => task.gameId === gameId);
    if (queuedIndex < 0) {
      return false;
    }

    const [removedTask] = this.queue.splice(queuedIndex, 1);
    this.taskByGameId.delete(gameId);
    removedTask.resolve("cancelled");
    return true;
  }

  /**
   * 실행 중인 작업을 제외한 대기열을 비운다.
   */
  clearQueue(): void {
    for (const task of this.queue) {
      task.resolve("cancelled");
      this.taskByGameId.delete(task.gameId);
    }
    this.queue = [];
  }

  get getQueueLength(): number {
    return this.queue.length;
  }

  get getIsProcessing(): boolean {
    return this.bIsProcessing;
  }

  get getCurrentGameId(): number | null {
    return this.currentTask?.gameId ?? null;
  }

  getQueuedGameIds(): number[] {
    return this.queue.map((task) => task.gameId);
  }

  getQueuePosition(gameId: number): number | null {
    if (this.currentTask?.gameId === gameId) {
      return 0;
    }
    const queueIndex = this.queue.findIndex((task) => task.gameId === gameId);
    if (queueIndex < 0) {
      return null;
    }
    return queueIndex + 1;
  }

  isQueuedOrRunning(gameId: number): boolean {
    return this.currentTask?.gameId === gameId || this.taskByGameId.has(gameId);
  }

  private processNext(): void {
    if (this.bIsProcessing) {
      return;
    }

    const nextTask = this.queue.shift();
    if (!nextTask) {
      return;
    }

    this.bIsProcessing = true;
    this.currentTask = nextTask;

    void nextTask.manager
      .downloadAndInstall(nextTask.context, nextTask.bCreateShortcut)
      .then((result) => {
        nextTask.resolve(result);
      })
      .catch((error) => {
        const errorMessage =
          error instanceof Error ? error.message : String(error ?? "failed");
        nextTask.resolve(errorMessage);
      })
      .finally(() => {
        this.taskByGameId.delete(nextTask.gameId);
        this.currentTask = null;
        this.bIsProcessing = false;
        this.processNext();
      });
  }
}

interface QueueTask {
  gameId: number;
  manager: GameInstallManager;
  context: bitmapApi;
  bCreateShortcut: boolean;
  promise: Promise<string>;
  resolve: (value: string) => void;
}

const GameDownloadQueueManager = GameDownloadQueueMgr.getInstance();

export { GameInstallManager, GameDownloadQueueManager };

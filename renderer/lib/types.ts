import { bitmapApi, tools } from "@/types/electron";
import { makeAutoObservable } from "mobx";

interface stringLocalized {
  en: string;
  ko: string;
}

interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  isAdmin: boolean;
  isDeveloper: boolean;
  isTeammate: boolean;
  avatarUri: string;
  createdAt: string;
  google_id: string;
  uid: string;
  verification_code: number;
  code_expires_at: string;
  isEmailVerified: boolean;
}

interface UserQueriedByUid extends Pick<
  User,
  "username" | "email" | "avatarUri" | "id"
> {}

interface UserProfile extends Omit<
  User,
  "password" | "verification_code" | "code_expires_at"
> {}

type RatingDetails =
  | "crime"
  | "drugs"
  | "gamble"
  | "horror"
  | "sex"
  | "swear"
  | "violence";

interface Game {
  gameId: number;
  isApproved: boolean;
  uid: string;
  gameTitle: string;
  gameLatestRevision: number;
  gamePlatformWindows: boolean;
  gamePlatformMac: boolean;
  gameEngine: string;
  gameGenre: stringLocalized;
  gameDeveloper: string;
  gamePublisher: string;
  isEarlyAccess: boolean;
  isReleased: boolean;
  gameReleasedDate: string;
  gameWebsite: string;
  gameVideoURL: string;
  gameDownloadMacURL: string | null;
  requirementsMac: string | null;
  gameDownloadWinURL: string | null;
  requirementsWindows: string | null;
  gameImageURL: string[];
  gameBinaryName: string;
  gameHeadline: stringLocalized;
  gameDescription: stringLocalized;
  ageRating: number;
  ratingContentDescriptors: RatingDetails[];
  customEula: string;
}

interface GameWithSize extends Game {
  size: number[];
}

interface GameList extends Pick<
  Game,
  | "gameId"
  | "gameTitle"
  | "gameImageURL"
  | "gameDeveloper"
  | "gamePublisher"
  | "gameGenre"
  | "gameReleasedDate"
  | "isApproved"
  | "isEarlyAccess"
> {}

interface GameInstallInfo extends GameWithSize {
  gameInstallationPath: string;
  gameInstalledVersion: number;
  gameInstallState: EInstallState;
}

interface Metadata {
  title?: string;
  description?: string;
}

interface Settings {
  id: number;
  lang: string;
  screenMode: string;
}

enum EInstallState {
  NotInstalled,
  Downloading,
  Extracting,
  Installed,
  InstallError,
}

/**
 * 게임 평점 및 리뷰 데이터의 기본 구조
 */
interface GameRating {
  id: number;
  gameId: number;
  uid: string; // DB의 uid (UUID)
  rating: number; // 1~5 또는 1~10 (tinyint 대응)
  title: string;
  content: string; // DB의 body/text 대응
  createdAt: string; // ISO 8601 날짜 문자열
  updatedAt: string;
}

interface GameRatingRequest extends Omit<
  GameRating,
  "id" | "createdAt" | "updatedAt"
> {
  // 클라이언트에서 보낼 때는 이 데이터들만 포함됩니다.
}

/**
 * 로그인 성공 시 서버로부터 받는 응답 데이터 타입
 */
interface AuthResponse {
  token: string;
}

interface AuthResponseInternal {
  success: boolean;
  token: string;
}

interface SignupResponse {
  uid: string;
  username: string;
}

/**
 * API 요청 실패 시 서버로부터 받는 에러 응답 타입
 * (서버 구현에 따라 달라질 수 있습니다)
 */
interface ErrorResponse {
  message: string;
}

interface YouTubeQuery {
  success: boolean;
  totalCount: number;
  videoIds: string[];
}

interface Carousel {
  id: number;
  image: string;
  title: stringLocalized;
  description: stringLocalized;
  href: string | null;
  button: stringLocalized;
}

interface searchParamsPropsSSR {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

interface MembershipApplies {
  id: number;
  locale: string; // varchar(2)
  uid: string; // varchar(36) - 사용자 고유 식별자
  name: string; // varchar(20)
  alias: string; // varchar(20)
  age: number; // int
  introduction: string; // text
  motivation: string; // text
  affiliate: string; // text
  field: Array<string>; // json [number]
  prodTools: string; // text (기존 prodToold에서 변경)
  portfolio: string; // text
  youtubeHandle: string; // text
  avatarUri: string; // text
  position: string; // varchar(30)
  isApproved: boolean; // tinyint(1) (0 또는 1)
}

interface MembershipApplyRequest extends Omit<
  MembershipApplies,
  "id" | "isApproved"
> {}

interface MembershipLeaves {
  id: number;
  locale: string; // varchar(2)
  uid: string; // varchar(36) - 사용자 고유 식별자
  leaveReason: string; // text
  satisfaction: string;
}

interface MembershipLeaveRequest extends Omit<MembershipLeaves, "id"> {}

// 알림 유형을 안전하게 관리하기 위한 Union Type
type NotificationType = "GAME_UPDATE" | "SYSTEM" | "PURCHASE" | string;

interface Notification {
  id: number; // BIGINT -> number (2^53-1 이상은 string으로 처리하기도 함)
  uid: string; // 수신 대상 사용자 ID
  type: NotificationType; // 알림 유형 (문자열 리터럴로 상세 정의 추천)
  title: string; // 알림 제목
  content: string; // 알림 상세 내용
  redirectionUri?: string; // 클릭 시 이동 경로 (NULL 허용이므로 옵셔널)
  isRead: boolean; // 읽음 여부
  readAt: string | null; // 읽은 시간 (ISO string 또는 null)
  createdAt: string; // 생성 시간
}

interface DocumentArchives {
  id: number;
  title: string;
  content: string;
  lastUpdatedAt: string;
}

interface Project {
  id: number;
  category: "dev" | "video";
  title: string;
  description: string;
  tags: string[];
  link: string;
  preview: string;
}

interface Portfolio {
  uid: string; // varchar(36)
  position: string; // varchar(36)
  headline: string; // text
  stack: string; // text
  skills: string[]; // json (배열 형태일 경우)
  portfolioIntroduction: string; // text
  project: Project[]; // json (객체 배열 형태일 경우)
  portfolioPdfUri: string; // text
}

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
  private installState: EInstallState = EInstallState.NotInstalled;
  private downloadProgress: number = 0;
  private downloadSpeedAvg: number = 0;
  private downloadSpeedRealtime: number = 0;
  private extractProgress: number = 0;
  private currentVersion: number = 0;
  private bIsUpdatable: boolean = false;

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

  get getDownloadSpeedAvg(): number {
    return this.downloadSpeedAvg;
  }

  get getDownloadSpeedRealtime(): number {
    return this.downloadSpeedRealtime;
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

  /**
   * Download and Install Game. Do not call this function directly.
   * @param url gameDownloadPlatformUrl
   * @param savePath InstallationPath
   */
  async downloadAndInstall(
    context: bitmapApi,
    bCreateShortcut: boolean,
  ): Promise<string> {
    const url = this.bIsMac ? this.gameDownloadMacURL : this.gameDownloadWinURL;

    const savePathLocal: string | null = this.bIsMac
      ? `${this.installationPath}/${url?.split("/")[url?.split("/").length - 1]}`
      : `${this.installationPath}\\${url?.split("/")[url?.split("/").length - 1]}`;
    console.log(`URL: ${url}, SavePath: ${savePathLocal}`);

    let archivePath: string = "";

    try {
      this.installState = EInstallState.Downloading;
      // 다운로드 진행률 수신
      context.onDownloadProgress((progress) => {
        this.downloadProgress = progress;
        console.log(
          `다운로드 중: ${this.downloadProgress}, EInstallState.Downloading: ${this.installState === EInstallState.Downloading}`,
        );
      });

      context.onDownloadAvgSpeed((progress) => {
        this.downloadSpeedAvg = progress;
      });

      context.onDownloadRealtimeSpeed((progress) => {
        this.downloadSpeedRealtime = progress;
      });
      // 다운로드 요청
      archivePath = await context.downloadFile(url, savePathLocal);

      console.log(
        `다운로드 완료: ${archivePath}, EInstallState.Downloading: ${this.installState === EInstallState.Downloading}`,
      );
    } catch (error) {
      this.installState = EInstallState.InstallError;
      console.error("오류 발생:", error);
      return error as string;
    }

    try {
      this.installState = EInstallState.Extracting;

      // 압축 해제 진행률 수신
      context.onExtractProgress((progress) => {
        this.extractProgress = progress;
        console.log(
          `압축 해제 중: ${this.extractProgress}, EInstallState.Extracting: ${this.installState === EInstallState.Extracting}`,
        );
      });

      // 압축 해제 요청
      const extractedPath = await context.extractZip(archivePath);
      console.log(
        `압축 해제 완료: ${extractedPath}, EInstallState: ${this.installState}`,
      );

      this.installState = EInstallState.Installed; // 작업 완료
      this.currentVersion = this.getGameInfo.gameLatestRevision;
      this.bIsUpdatable = false;
      await this.pushInstallState(context);
      console.log(
        `설치 완료: EInstallState.Installed: ${this.installState === EInstallState.Installed}`,
      );
      if (bCreateShortcut) {
        await context.createShortcut(
          `${extractedPath}/${this.gameBinaryName}.${this.bIsMac ? "app" : "exe"}`,
          this.gameTitle,
        );
      }
    } catch (error: any) {
      this.installState = EInstallState.InstallError;
      console.error("오류 발생:", error);
      return error as string;
    }

    return "success";
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

      this.defaultInstallationPath = DefaultInstallationPathLocal;

      const getResultLocal = await BitmapAPI.getGameInstallInfoByIndex(
        this.game.gameId,
      );

      console.log("pullInstallState::resolvedData", getResultLocal);
      // If getting from store succeed, allocate it to property
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

      // Check is installation path valid
      if (this.installationPath) {
        const literalInstallationPath = this.bIsMac
          ? `${this.installationPath}/${this.game.gameBinaryName}`
          : `${this.installationPath}\\${this.game.gameBinaryName}`;

        BitmapAPI.checkPathValid(literalInstallationPath).then(
          (bIsValid: boolean) => {
            console.log(
              `pullInstallState::checkPathValid: ${bIsValid} from game ${this.game.gameTitle}`,
            );
            this.installState = bIsValid
              ? EInstallState.Installed
              : EInstallState.NotInstalled;
          },
        );
      } else this.installState = EInstallState.NotInstalled;

      // Sync installation state
      this.pushInstallState(BitmapAPI);
    } catch (error) {
      console.log(error);
    }
  }

  async openApp(context: bitmapApi) {
    let openCommand: string = "";

    if (this.bIsMac) {
      openCommand = `open "${this.installationPath}/${this.game.gameBinaryName}.app"`;
    } else {
      if (this.installationPath) {
        if (this.installationPath.charAt(0) === "C") {
          openCommand = `"${this.installationPath}\\${this.game.gameBinaryName}.exe"`;
        } else {
          openCommand = `${this.installationPath.charAt(0)}: ; "${this.installationPath}\\${this.game.gameBinaryName}.exe"`;
        }
      }
    }

    try {
      const result: string = await context.runCommand(openCommand);
      console.log("명령 실행 성공:", result);
    } catch (error) {
      console.error("명령 실행 중 오류:", error as string);
    }
  }

  async removeApp(context: bitmapApi) {
    if (this.installationPath) {
      console.log(this.installationPath);
      if (await context.removeFile(this.installationPath)) {
        this.installState = EInstallState.NotInstalled;
        this.installationPath = this.defaultInstallationPath;
        context.deleteGameInstallInfo(this.gameId);
        context.removeShortcut(this.gameTitle);
        await this.pushInstallState(context);
      }
    }
  }
}

interface UpdateProgress {
  percent: number;
  transferred: number;
  total: number;
  bytesPerSecond: number;
}

type UpdateStatusType =
  | "idle"
  | "checking"
  | "available"
  | "not-available"
  | "downloading"
  | "downloaded"
  | "error";

interface UpdateStatus {
  message: string;
  status: UpdateStatusType;
}

export { EInstallState, GameInstallManager };

export type {
  Game,
  GameList,
  GameWithSize,
  GameInstallInfo,
  Metadata,
  Settings,
  stringLocalized,
  GameRating,
  GameRatingRequest,
  AuthResponse,
  AuthResponseInternal,
  SignupResponse,
  ErrorResponse,
  YouTubeQuery,
  Carousel,
  searchParamsPropsSSR,
  MembershipApplies,
  MembershipApplyRequest,
  MembershipLeaves,
  MembershipLeaveRequest,
  Notification,
  UserQueriedByUid,
  UserProfile,
  DocumentArchives,
  Portfolio,
  Project,
  RatingDetails,
  UpdateProgress,
  UpdateStatusType,
  UpdateStatus,
};

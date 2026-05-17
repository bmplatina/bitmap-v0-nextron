import { bitmapApi, tools } from "@/types/electron";

import { getGamePlaytime, setGamePlaytime, updateGamePlaytime } from "./games";

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
  gameLatestRevision: string;
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
  gameInstalledVersion: string;
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
  Paused,
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

interface GitHubRelease {
  id: number;
  url: string;
  html_url: string;
  tag_name: string;
  target_commitish: string;
  name: string;
  body: string; // 마크다운 형식의 릴리스 노트
  draft: boolean;
  prerelease: boolean;
  created_at: string; // ISO 8601 날짜
  published_at: string;
  author: GitHubUser;
  assets: GitHubAsset[];
  tarball_url: string;
  zipball_url: string;
}

interface GitHubAsset {
  id: number;
  name: string; // 파일명 (예: Bitmap.Setup.0.1.1-a.exe)
  label: string | null;
  uploader: GitHubUser;
  content_type: string;
  state: "uploaded" | string;
  size: number; // 바이트 단위
  download_count: number;
  created_at: string;
  updated_at: string;
  browser_download_url: string; // 실제 다운로드 링크
}

interface GitHubUser {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
  type: string;
}

interface Playtime {
  id: number;
  uid: string;
  gameId: number;
  playtime: number;
}

export { EInstallState };

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
  GitHubRelease,
  Playtime,
};

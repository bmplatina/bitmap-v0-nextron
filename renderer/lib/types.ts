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

export { EInstallState };
export type { Game, GameInstallInfo, Metadata, Settings };

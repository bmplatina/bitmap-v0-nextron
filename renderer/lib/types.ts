export interface Game {
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

export interface Metadata {
  title?: string
  description?: string
}

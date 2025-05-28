import type { Game } from "../lib/types"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import Image from "next/image"
import { Calendar, User, Tag, Globe, Monitor, Apple } from "lucide-react"
import dayjs from "dayjs"

interface GamePreviewProps {
  game: Game
}

export default function GamePreview({ game }: GamePreviewProps) {
  // 출시일 포맷팅 - day.js 사용
  const formatDate = (dateString: string) => {
    if (!dateString) return "미정"
    return dayjs(dateString).format("YYYY/MM/DD")
  }

  return (
      <div className="w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 왼쪽 컬럼 - 이미지 */}
          <div className="lg:col-span-1">
            <div className="relative aspect-[1/1.414] w-full rounded-lg overflow-hidden">
              <Image
                  src={game.gameImageURL || "/placeholder.svg?height=600&width=424"}
                  alt={game.gameTitle}
                  fill
                  className="object-cover"
              />
            </div>

            <div className="mt-6 space-y-4">
              {game.gameWebsite && (
                  <Button variant="outline" className="w-full" asChild>
                    <a href={game.gameWebsite} target="_blank" rel="noopener noreferrer">
                      <Globe className="mr-2 h-4 w-4" />
                      웹사이트 방문
                    </a>
                  </Button>
              )}

              {game.gameDownloadWinURL && (
                  <Button className="w-full">
                    <Monitor className="mr-2 h-4 w-4" />
                    Windows 다운로드
                  </Button>
              )}

              {game.gameDownloadMacURL && (
                  <Button className="w-full" variant="secondary">
                    <Apple className="mr-2 h-4 w-4" />
                    Mac 다운로드
                  </Button>
              )}
            </div>
          </div>

          {/* 오른쪽 컬럼 - 상세 정보 */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <h1 className="text-3xl font-bold">{game.gameTitle}</h1>
              {game.isEarlyAccess === 1 && <Badge className="bg-amber-500">얼리 액세스</Badge>}
            </div>

            <h2 className="text-xl text-muted-foreground mb-6">{game.gameHeadline}</h2>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-muted-foreground" />
                <span>
                개발사: <strong>{game.gameDeveloper}</strong>
              </span>
              </div>

              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-muted-foreground" />
                <span>
                퍼블리셔: <strong>{game.gamePublisher}</strong>
              </span>
              </div>

              <div className="flex items-center gap-2">
                <Tag className="h-5 w-5 text-muted-foreground" />
                <span>
                장르: <strong>{game.gameGenre}</strong>
              </span>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <span>
                출시일: <strong>{formatDate(game.gameReleasedDate)}</strong>
              </span>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4">게임 소개</h3>
              <div className="prose prose-invert max-w-none">
                <p className="whitespace-pre-wrap">{game.gameDescription}</p>
              </div>
            </div>

            {game.gameVideoURL && (
                <div>
                  <h3 className="text-xl font-semibold mb-4">트레일러</h3>
                  <div className="relative aspect-video w-full rounded-lg overflow-hidden">
                    <iframe src={game.gameVideoURL} className="absolute inset-0 w-full h-full" allowFullScreen></iframe>
                  </div>
                </div>
            )}
          </div>
        </div>
      </div>
  )
}

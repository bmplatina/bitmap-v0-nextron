import type { Game } from "../lib/types"
import { Card, CardContent, CardFooter } from "./ui/card"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import Image from "next/image"
import Link from "next/link"
import { Calendar, User, Tag } from "lucide-react"
import dayjs from "dayjs"

interface GameCardProps {
  game: Game
  linkPrefix?: string // 링크 프리픽스 (기본값: "/games")
}

export default function GameCard({ game, linkPrefix = "/games" }: GameCardProps) {
  // 출시일 포맷팅 - day.js 사용
  const formatDate = (dateString: string) => {
    if (!dateString) return "미정"
    return dayjs(dateString).format("YYYY/MM/DD")
  }

  return (
      <Card className="overflow-hidden flex flex-col h-full transition-all hover:shadow-lg">
        <Link href={`${linkPrefix}/${game.gameId}`} className="block">
          <div className="relative aspect-[1/1.414] w-full cursor-pointer hover:opacity-90 transition-opacity">
            <Image
                src={game.gameImageURL || "/placeholder.svg?height=400&width=283"}
                alt={game.gameTitle}
                fill
                className="object-cover"
                priority
            />
            {game.isEarlyAccess === 1 && <Badge className="absolute top-2 right-2 bg-amber-500">얼리 액세스</Badge>}
            {linkPrefix === "/pending-games" && (
                <Badge className="absolute top-2 left-2 bg-orange-500">승인 대기중</Badge>
            )}
          </div>
        </Link>

        <CardContent className="flex-1 p-4">
          <h3 className="text-xl font-bold mb-2 line-clamp-1">{game.gameTitle}</h3>

          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>{game.gameDeveloper}</span>
            </div>

            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              <span>{game.gameGenre}</span>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(game.gameReleasedDate)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
  )
}

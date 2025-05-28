import { Suspense } from "react"
import axios from "axios"
import type { Game, Metadata } from "../../../lib/types"
import { Button } from "../../../components/ui/button"
import { Badge } from "../../../components/ui/badge"
import Image from "next/image"
import { Calendar, User, Tag, Globe, Monitor, Apple, Clock } from "lucide-react"
import dayjs from "dayjs"

// API에서 특정 대기 중인 게임 데이터를 가져오는 함수
async function getPendingGame(id: string): Promise<Game | null> {
  try {
    const response = await axios.get<Game[]>("https://api.prodbybitmap.com/api/games-pending", {
      timeout: 10000,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })

    const game = response.data.find((g) => g.gameId.toString() === id)
    return game || null
  } catch (error) {
    console.error("대기 중인 게임 데이터를 가져오는 중 오류 발생:", error)
    return null
  }
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const game = await getPendingGame(params.id)

  if (!game) {
    return {
      title: "Bitmap Store: 게임을 찾을 수 없습니다",
    }
  }

  return {
    title: `Bitmap Store: ${game.gameTitle} (승인 대기중)`,
  }
}

export default async function PendingGameDetailPage({ params }: { params: { id: string } }) {
  const game = await getPendingGame(params.id)

  if (!game) {
    return (
        <div className="flex items-center justify-center h-full w-full">
          <div className="text-center">
            <p className="text-xl mb-2">게임을 찾을 수 없습니다</p>
            <p className="text-sm text-muted-foreground">
              요청하신 게임이 존재하지 않거나 데이터를 불러오는 중 문제가 발생했습니다.
            </p>
          </div>
        </div>
    )
  }

  // 출시일 포맷팅 - day.js 사용
  const formatDate = (dateString: string) => {
    if (!dateString) return "미정"
    return dayjs(dateString).format("YYYY/MM/DD")
  }

  return (
      <div className="container mx-auto p-6 w-full">
        {/* 승인 대기 상태 알림 */}
        <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
            <Clock className="h-5 w-5" />
            <span className="font-medium">이 게임은 현재 승인 대기 중입니다.</span>
          </div>
          <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
            관리자 검토 후 정식 게임 라이브러리에 추가됩니다.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 왼쪽 컬럼 - 이미지 */}
          <div className="lg:col-span-1">
            <Suspense fallback={<div className="aspect-[1/1.414] w-full rounded-lg bg-muted"></div>}>
              <div className="relative aspect-[1/1.414] w-full rounded-lg overflow-hidden">
                <Image
                    src={game.gameImageURL || "/placeholder.svg?height=600&width=424"}
                    alt={game.gameTitle}
                    fill
                    className="object-cover"
                    priority
                />
              </div>
            </Suspense>

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
                  <Button className="w-full" disabled>
                    <Monitor className="mr-2 h-4 w-4" />
                    Windows 다운로드 (승인 후 이용 가능)
                  </Button>
              )}

              {game.gameDownloadMacURL && (
                  <Button className="w-full" variant="secondary" disabled>
                    <Apple className="mr-2 h-4 w-4" />
                    Mac 다운로드 (승인 후 이용 가능)
                  </Button>
              )}
            </div>
          </div>

          {/* 오른쪽 컬럼 - 상세 정보 */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <h1 className="text-3xl font-bold">{game.gameTitle}</h1>
              <Badge className="bg-amber-500">승인 대기중</Badge>
              {game.isEarlyAccess === 1 && <Badge className="bg-blue-500">얼리 액세스</Badge>}
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
                <p>{game.gameDescription}</p>
              </div>
            </div>

            {game.gameVideoURL && (
                <div>
                  <h3 className="text-xl font-semibold mb-4">트레일러</h3>
                  <Suspense fallback={<div className="aspect-video w-full rounded-lg bg-muted"></div>}>
                    <div className="relative aspect-video w-full rounded-lg overflow-hidden">
                      <iframe src={game.gameVideoURL} className="absolute inset-0 w-full h-full" allowFullScreen></iframe>
                    </div>
                  </Suspense>
                </div>
            )}
          </div>
        </div>
      </div>
  )
}

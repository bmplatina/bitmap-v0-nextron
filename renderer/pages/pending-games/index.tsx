import { Suspense } from "react"
import axios from "axios"
import type { Game } from "../../lib/types"
import GameCard from "../../components/game-card"

// API에서 대기 중인 게임 데이터를 가져오는 함수 - 서버 컴포넌트에서만 호출
async function getPendingGames(): Promise<Game[]> {
    try {
        const response = await axios.get<Game[]>("https://api.prodbybitmap.com/api/games-pending", {
            timeout: 10000, // 10초 타임아웃
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
        })

        return response.data
    } catch (error) {
        console.error("대기 중인 게임 데이터를 가져오는 중 오류 발생:", error)

        // API 오류 시 빈 배열 반환
        return []
    }
}

export default async function PendingGamesPage() {
    // 서버 컴포넌트에서 직접 데이터 가져오기
    const games = await getPendingGames()

    return (
        <div className="p-6 w-full">
            <h1 className="text-3xl font-bold mb-6">대기 중인 게임</h1>
            <p className="text-muted-foreground mb-6">승인 대기 중인 게임들을 확인할 수 있습니다.</p>

            {games.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-xl text-muted-foreground">현재 승인 대기 중인 게임이 없습니다.</p>
                    <p className="text-sm text-muted-foreground mt-2">
                        게임 데이터를 불러오는 중 문제가 발생했거나 대기 중인 게임이 없습니다.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {games.map((game) => (
                        <Suspense key={game.gameId} fallback={<GameCardSkeleton />}>
                            <PendingGameCard game={game} />
                        </Suspense>
                    ))}
                </div>
            )}
        </div>
    )
}

// 대기 중인 게임용 카드 컴포넌트 (pending-games/[id]로 링크)
function PendingGameCard({ game }: { game: Game }) {
    return <GameCard game={game} linkPrefix="/pending-games" />
}

// 로딩 중 표시할 스켈레톤 UI
function GameCardSkeleton() {
    return (
        <div className="overflow-hidden flex flex-col h-full rounded-lg border bg-card text-card-foreground shadow animate-pulse">
            <div className="relative aspect-[1/1.414] w-full bg-muted"></div>
            <div className="p-4 flex-1">
                <div className="h-6 bg-muted rounded w-3/4 mb-4"></div>
                <div className="space-y-3">
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                    <div className="h-4 bg-muted rounded w-2/3"></div>
                    <div className="h-4 bg-muted rounded w-1/3"></div>
                </div>
            </div>
        </div>
    )
}

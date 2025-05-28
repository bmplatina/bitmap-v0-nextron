"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter } from "next/router"
import axios from "axios"
import type { Game } from "../../../lib/types"
import { Button } from "../../../components/ui/button"
import { Badge } from "../../../components/ui/badge"
import Image from "next/image"
import { Calendar, User, Tag, Globe, Monitor, Apple, Clock } from "lucide-react"
import dayjs from "dayjs"
import Head from 'next/head'

export default function PendingGameDetailPage() {
    const router = useRouter()
    const { id } = router.query
    const [game, setGame] = useState<Game | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        async function fetchGame() {
            if (!id) return

            try {
                const response = await axios.get<Game[]>("https://api.prodbybitmap.com/api/games-pending", {
                    timeout: 10000,
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                    },
                })

                const foundGame = response.data.find((g) => g.gameId.toString() === id)
                setGame(foundGame || null)
            } catch (error) {
                console.error("대기 중인 게임 데이터를 가져오는 중 오류 발생:", error)
                setGame(null)
            } finally {
                setIsLoading(false)
            }
        }

        fetchGame()
    }, [id])

    const formatDate = (dateString: string) => {
        if (!dateString) return "미정"
        return dayjs(dateString).format("YYYY/MM/DD")
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full w-full">
                <div className="text-center">
                    <p className="text-xl mb-2">로딩 중...</p>
                </div>
            </div>
        )
    }

    if (!game) {
        return (
            <>
                <Head>
                    <title>Bitmap Store: 게임을 찾을 수 없습니다</title>
                </Head>
                <div className="flex items-center justify-center h-full w-full">
                    <div className="text-center">
                        <p className="text-xl mb-2">게임을 찾을 수 없습니다</p>
                        <p className="text-sm text-muted-foreground">
                            요청하신 게임이 존재하지 않거나 데이터를 불러오는 중 문제가 발생했습니다.
                        </p>
                    </div>
                </div>
            </>
        )
    }

    return (
        <>
            <Head>
                <title>{`Bitmap Store: ${game.gameTitle} (승인 대기중)`}</title>
            </Head>
            {/* 나머지 JSX 코드는 동일 */}
            <div className="container mx-auto p-6 w-full">
                {/* 기존 코드와 동일 */}
            </div>
        </>
    )
}
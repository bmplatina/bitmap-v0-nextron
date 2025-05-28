"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import { Button } from "../../../components/ui/button"
import { Monitor, ExternalLink } from "lucide-react"
import BitmapAbout from "../../../components/bitmap-about"

// 정적 경로 생성을 위한 getStaticPaths 추가
export async function getStaticPaths() {
    return {
        paths: [], // 동적으로 처리할 것이므로 빈 배열
        fallback: 'blocking' // SSR처럼 동작하도록 설정
    }
}

// 정적 props를 위한 getStaticProps 추가
export async function getStaticProps({ params }) {
    return {
        props: {
            id: params?.id || null
        }
    }
}

export default function RedirectAppPage() {
    const router = useRouter()
    const { id } = router.query
    const [isRedirecting, setIsRedirecting] = useState(true)
    const appUrl = `bitmap://games/${id}`

    useEffect(() => {
        if (!id) return // id가 없으면 리다이렉트하지 않음

        const timer = setTimeout(() => {
            window.location.href = appUrl
            setIsRedirecting(false)
        }, 1000)

        return () => clearTimeout(timer)
    }, [id, appUrl])

    if (!id) {
        return (
            <div className="p-6 w-full">
                <h1 className="text-3xl font-bold mb-6">잘못된 접근</h1>
                <p className="text-muted-foreground mb-6">
                    올바른 게임 ID를 입력해주세요.
                </p>
                <Button className="w-full" variant="outline" asChild>
                    <Link href="/">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        홈으로 돌아가기
                    </Link>
                </Button>
            </div>
        )
    }

    return (
        <div className="p-6 w-full">
            <h1 className="text-3xl font-bold mb-6">Bitmap App으로 이동</h1>
            
            {isRedirecting ? (
                <p className="text-muted-foreground mb-6">
                    Bitmap App으로 이동하는 중입니다...
                </p>
            ) : (
                <p className="text-muted-foreground mb-6">
                    자동으로 이동하지 않는다면 아래 버튼을 클릭해주세요.
                </p>
            )}

            <div className="space-y-4">
                <Button className="w-full" variant="default" asChild>
                    <Link href={appUrl}>
                        <Monitor className="mr-2 h-4 w-4" />
                        Bitmap App에서 열기
                    </Link>
                </Button>

                <Button className="w-full" variant="outline" asChild>
                    <Link href={`/games/${id}`}>
                        <ExternalLink className="mr-2 h-4 w-4" />
                        웹에서 게임 정보 보기
                    </Link>
                </Button>
            </div>

            <div className="mt-8">
                <BitmapAbout />
            </div>
        </div>
    )
}
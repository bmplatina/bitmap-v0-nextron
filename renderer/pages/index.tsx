import { Button } from "../components/ui/button"
import Link from "next/link"

export default function Home() {
    return (
        <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <h1 className="text-4xl font-bold mb-6">Bitmap에 오신 것을 환영합니다</h1>
            <p className="text-xl mb-8 max-w-2xl">
                인디 개발자부터 대형 퍼블리셔까지, 최신 게임을 발견하고 다운로드하여 플레이하세요.
            </p>
            <Button asChild size="lg">
                <Link href="/games">게임 둘러보기</Link>
            </Button>
        </div>
    )
}

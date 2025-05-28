"use client"

import type React from "react"
import { useState } from "react"
import { Search, Menu, X } from "lucide-react"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import Link from "next/link"
import Image from "next/image"
import { MobileSidebar } from "./mobile-sidebar"

export default function TopBar() {
    // Electron 및 MacOS 환경 감지 변수 (실제 감지 코드는 구현하지 않음)
    const bIsMacOS: boolean = false // 예시 값, 실제로는 MacOS 감지 로직 필요

    // 검색어 상태 관리
    const [searchQuery, setSearchQuery] = useState("")
    // 모바일 사이드바 상태 관리
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

    // 검색 핸들러
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        console.log("검색어:", searchQuery)
        // 여기에 검색 로직 구현
    }

    // 모바일 사이드바 토글
    const toggleMobileSidebar = () => {
        setIsMobileSidebarOpen(!isMobileSidebarOpen)
    }

    // 모바일 사이드바 닫기
    const closeMobileSidebar = () => {
        setIsMobileSidebarOpen(false)
    }

    const electronDragCss: React.CSSProperties & { WebkitAppRegion?: string } = {
        WebkitAppRegion: "drag",
    };

    return (
        <>
            <div
                className="h-12 bg-background border-b flex items-center px-4 w-full relative z-50"
                style={electronDragCss}
            >
                {/* 모바일 메뉴 버튼 */}
                <div className="md:hidden mr-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={toggleMobileSidebar}
                        style={electronDragCss}
                    >
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">메뉴 열기</span>
                    </Button>
                </div>

                {/* 로고 이미지 */}
                <Link
                    href="/"
                    className="flex items-center"
                    style={{
                        ...electronDragCss,
                        marginLeft: bIsMacOS ? "75px" : "0",
                    }}
                >
                    <Image
                        src="/images/bitmap_bmp.png"
                        alt="Bitmap"
                        width={120}
                        height={32}
                        className="h-8 w-auto cursor-pointer hover:opacity-80 transition-opacity"
                        priority
                    />
                </Link>

                {/* 검색 폼 */}
                <form onSubmit={handleSearch} className="flex-1 max-w-md mx-auto">
                    <div className="relative" style={electronDragCss}>
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="게임 검색..."
                            className="pl-9 h-9 w-full bg-muted"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </form>

                {/* 오른쪽 여백 */}
                <div className="w-[100px]"></div>
            </div>

            {/* 모바일 사이드바 오버레이 */}
            {isMobileSidebarOpen && (
                <div className="fixed inset-0 z-40 md:hidden">
                    {/* 배경 오버레이 */}
                    <div className="fixed inset-0 bg-black/50" onClick={closeMobileSidebar} />

                    {/* 사이드바 */}
                    <div className="fixed left-0 top-0 h-full w-64 bg-background border-r shadow-lg transform transition-transform duration-300 ease-in-out">
                        {/* 사이드바 헤더 */}
                        <div className="flex items-center justify-between p-4 border-b">
                            <h2 className="text-lg font-semibold">메뉴</h2>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={closeMobileSidebar}>
                                <X className="h-5 w-5" />
                                <span className="sr-only">메뉴 닫기</span>
                            </Button>
                        </div>

                        {/* 사이드바 콘텐츠 */}
                        <MobileSidebar onItemClick={closeMobileSidebar} />
                    </div>
                </div>
            )}
        </>
    )
}

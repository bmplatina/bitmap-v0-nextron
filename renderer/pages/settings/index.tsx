"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Label } from "../../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Separator } from "../../components/ui/separator"
import { Monitor, Moon, Sun } from "lucide-react"

export default function SettingsPage() {
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    // 클라이언트 사이드에서만 테마 관련 UI를 렌더링
    useEffect(() => {
        setMounted(true)
    }, [])

    // 테마 옵션 정의
    const themeOptions = [
        {
            value: "light",
            label: "라이트 모드",
            description: "밝은 테마를 사용합니다",
            icon: <Sun className="h-4 w-4" />,
        },
        {
            value: "dark",
            label: "다크 모드",
            description: "어두운 테마를 사용합니다",
            icon: <Moon className="h-4 w-4" />,
        },
        {
            value: "system",
            label: "시스템 설정",
            description: "시스템의 테마 설정을 따릅니다",
            icon: <Monitor className="h-4 w-4" />,
        },
    ]

    // 현재 테마 정보 가져오기
    const getCurrentThemeInfo = () => {
        return themeOptions.find((option) => option.value === theme) || themeOptions[2]
    }

    if (!mounted) {
        return (
            <div className="container mx-auto p-6">
                <h1 className="text-3xl font-bold mb-6">설정</h1>
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>테마 설정</CardTitle>
                            <CardDescription>애플리케이션의 외관을 설정합니다.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <Label htmlFor="theme-select">테마 선택</Label>
                                <div className="h-10 bg-muted rounded-md animate-pulse" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">설정</h1>

            <div className="space-y-6">
                {/* 테마 설정 */}
                <Card>
                    <CardHeader>
                        <CardTitle>테마 설정</CardTitle>
                        <CardDescription>애플리케이션의 외관을 설정합니다.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="theme-select">테마 선택</Label>
                                <Select value={theme} onValueChange={setTheme}>
                                    <SelectTrigger id="theme-select" className="w-full">
                                        <SelectValue placeholder="테마를 선택하세요">
                                            <div className="flex items-center gap-2">
                                                {getCurrentThemeInfo().icon}
                                                <span>{getCurrentThemeInfo().label}</span>
                                            </div>
                                        </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {themeOptions.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                <div className="flex items-center gap-2">
                                                    {option.icon}
                                                    <div className="flex flex-col">
                                                        <span>{option.label}</span>
                                                        <span className="text-xs text-muted-foreground">{option.description}</span>
                                                    </div>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* 현재 테마 정보 표시 */}
                            <div className="p-4 bg-muted rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    {getCurrentThemeInfo().icon}
                                    <span className="font-medium">현재 테마: {getCurrentThemeInfo().label}</span>
                                </div>
                                <p className="text-sm text-muted-foreground">{getCurrentThemeInfo().description}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Separator />

                {/* 추가 설정 섹션 (향후 확장용) */}
                <Card>
                    <CardHeader>
                        <CardTitle>일반 설정</CardTitle>
                        <CardDescription>애플리케이션의 일반적인 설정을 관리합니다.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">추가 설정 옵션이 여기에 표시됩니다.</p>
                    </CardContent>
                </Card>

                <Separator />

                {/* 계정 설정 섹션 (향후 확장용) */}
                <Card>
                    <CardHeader>
                        <CardTitle>계정 설정</CardTitle>
                        <CardDescription>사용자 계정과 관련된 설정을 관리합니다.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">계정 관련 설정이 여기에 표시됩니다.</p>
                    </CardContent>
                </Card>

                <Separator />

                {/* 알림 설정 섹션 (향후 확장용) */}
                <Card>
                    <CardHeader>
                        <CardTitle>알림 설정</CardTitle>
                        <CardDescription>알림 및 메시지 설정을 관리합니다.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">알림 설정이 여기에 표시됩니다.</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

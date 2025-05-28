"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Checkbox } from "../../components/ui/checkbox"
import { Button } from "../../components/ui/button"
import { Separator } from "../../components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog"
import { Calendar } from "../../components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "../../components/ui/popover"
import { CalendarIcon, Edit, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import { cn } from "../../lib/utils"
import type { Game } from "../../lib/types"
import GamePreview from "../../components/game-preview"
import MarkdownEditor from "../../components/markdown-editor"
import { toast } from "../../hooks/use-toast"

export default function RegisterGamePage() {
  const router = useRouter()

  // 게임 정보 상태
  const [gameId, setGameId] = useState(0)
  const [gameTitle, setGameTitle] = useState("")
  const [gameLatestRevision, setGameLatestRevision] = useState(1)
  const [gamePlatformWindows, setGamePlatformWindows] = useState(false)
  const [gamePlatformMac, setGamePlatformMac] = useState(false)
  const [gamePlatformMobile, setGamePlatformMobile] = useState(false)
  const [gameEngine, setGameEngine] = useState("")
  const [gameGenre, setGameGenre] = useState("")
  const [gameDeveloper, setGameDeveloper] = useState("")
  const [gamePublisher, setGamePublisher] = useState("")
  const [isEarlyAccess, setIsEarlyAccess] = useState(false)
  const [isReleased, setIsReleased] = useState(false)
  const [gameReleasedDate, setGameReleasedDate] = useState<Date>()
  const [gameWebsite, setGameWebsite] = useState("")
  const [gameVideoURL, setGameVideoURL] = useState("")
  const [gameDownloadMacURL, setGameDownloadMacURL] = useState("")
  const [gameDownloadWinURL, setGameDownloadWinURL] = useState("")
  const [gameImageURL, setGameImageURL] = useState("")
  const [gameBinaryName, setGameBinaryName] = useState("")
  const [gameHeadline, setGameHeadline] = useState("")
  const [gameDescription, setGameDescription] = useState("")

  // 로딩 상태
  const [isLoadingGameId, setIsLoadingGameId] = useState(true)

  // 모달 상태
  const [isDescriptionModalOpen, setIsDescriptionModalOpen] = useState(false)
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false)
  const [tempDescription, setTempDescription] = useState("")

  // 제출 상태
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 게임 ID 자동 생성 - API에서 기존 게임 수를 가져와서 계산
  useEffect(() => {
    async function fetchGames() {
      try {
        setIsLoadingGameId(true)

        const [responseGames, responseGamesPending] = await Promise.all([
          axios.get<Game[]>("https://api.prodbybitmap.com/api/games", {
            timeout: 10000,
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
          }),
          axios.get<Game[]>("https://api.prodbybitmap.com/api/games-pending", {
            timeout: 10000,
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
          }),
        ])

        const fetchedGames: Game[] = responseGames.data
        const fetchedGamesPending: Game[] = responseGamesPending.data

        // 기존 게임 수 + 대기 중인 게임 수 + 1 (새로운 게임)
        const newGameId = fetchedGames.length + fetchedGamesPending.length
        setGameId(newGameId)

        console.log(
            `게임 ID 생성: 기존 게임 ${fetchedGames.length}개 + 대기 중인 게임 ${fetchedGamesPending.length}개 = ${newGameId}`,
        )
      } catch (error) {
        console.error("게임 데이터를 가져오는 중 오류가 발생했습니다:", error)

        // API 오류 시 현재 시간을 기반으로 임시 ID 생성
        const fallbackId = Date.now()
        setGameId(fallbackId)

        toast({
          title: "경고",
          description: "게임 ID 생성 중 오류가 발생했습니다. 임시 ID가 할당되었습니다.",
          variant: "destructive",
        })
      } finally {
        setIsLoadingGameId(false)
      }
    }

    fetchGames()
  }, [])

  // 날짜 포맷팅 함수 (MySQL 형식)
  const formatDateToMySQL = (date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  // 미리보기용 게임 객체 생성
  const createPreviewGame = (): Game => {
    return {
      gameId,
      gameTitle,
      gameLatestRevision,
      gamePlatformWindows: gamePlatformWindows ? 1 : 0,
      gamePlatformMac: gamePlatformMac ? 1 : 0,
      gamePlatformMobile: gamePlatformMobile ? 1 : 0,
      gameEngine,
      gameGenre,
      gameDeveloper,
      gamePublisher,
      isEarlyAccess: isEarlyAccess ? 1 : 0,
      isReleased: isReleased ? 1 : 0,
      gameReleasedDate: gameReleasedDate ? formatDateToMySQL(gameReleasedDate) : "",
      gameWebsite,
      gameVideoURL,
      gameDownloadMacURL: gameDownloadMacURL || null,
      gameDownloadWinURL: gameDownloadWinURL || null,
      gameImageURL,
      gameBinaryName,
      gameHeadline,
      gameDescription,
    }
  }

  // 게임 제출 함수
  const handleSubmit = async (): Promise<void> => {
    try {
      setIsSubmitting(true)

      // 필수 필드 검증
      if (!gameTitle.trim()) {
        toast({
          title: "오류",
          description: "게임 제목을 입력해주세요.",
          variant: "destructive",
        })
        return
      }

      if (!gameDeveloper.trim()) {
        toast({
          title: "오류",
          description: "개발자 이름을 입력해주세요.",
          variant: "destructive",
        })
        return
      }

      if (!gameGenre.trim()) {
        toast({
          title: "오류",
          description: "게임 장르를 입력해주세요.",
          variant: "destructive",
        })
        return
      }

      // API 전송용 게임 데이터 생성
      const postGame: Game = {
        gameId,
        gameTitle,
        gameLatestRevision,
        gamePlatformWindows: gamePlatformWindows ? 1 : 0,
        gamePlatformMac: gamePlatformMac ? 1 : 0,
        gamePlatformMobile: gamePlatformMobile ? 1 : 0,
        gameEngine,
        gameGenre,
        gameDeveloper,
        gamePublisher,
        isEarlyAccess: isEarlyAccess ? 1 : 0,
        isReleased: isReleased ? 1 : 0,
        gameReleasedDate: gameReleasedDate ? formatDateToMySQL(gameReleasedDate) : "",
        gameWebsite,
        gameVideoURL,
        gameDownloadMacURL: gameDownloadMacURL || null,
        gameDownloadWinURL: gameDownloadWinURL || null,
        gameImageURL,
        gameBinaryName,
        gameHeadline,
        gameDescription,
      }

      console.log("Submitting game data:", postGame)

      // API 호출
      const response = await axios.post<Game>("https://api.prodbybitmap.com/api/games/push", postGame, {
        timeout: 30000, // 30초 타임아웃
        headers: {
          "Content-Type": "application/json",
        },
      })

      console.log("Submit succeed:", response.data)

      // 성공 알림
      toast({
        title: "성공",
        description: "게임이 성공적으로 등록되었습니다! 승인 대기 상태로 전환됩니다.",
      })

      // 미리보기 모달 닫기
      setIsPreviewModalOpen(false)

      // 대기 중인 게임 페이지로 이동
      router.push("/pending-games")
    } catch (error) {
      console.error("Error submitting:", error)

      // 에러 알림
      toast({
        title: "오류",
        description: "게임 등록 중 오류가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // 마크다운 편집 모달 열기
  const openDescriptionModal = () => {
    setTempDescription(gameDescription)
    setIsDescriptionModalOpen(true)
  }

  // 마크다운 편집 저장
  const saveDescription = () => {
    setGameDescription(tempDescription)
    setIsDescriptionModalOpen(false)
  }

  // 마크다운 편집 취소
  const cancelDescription = () => {
    setTempDescription(gameDescription)
    setIsDescriptionModalOpen(false)
  }

  // 간단한 마크다운 렌더링 함수
  const renderMarkdown = (text: string) => {
    if (!text) return "게임 설명이 여기에 표시됩니다..."

    return text
        .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
        .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold mt-6 mb-3">$1</h2>')
        .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-8 mb-4">$1</h1>')
        .replace(/\*\*(.*)\*\*/gim, '<strong class="font-bold">$1</strong>')
        .replace(/\*(.*)\*/gim, '<em class="italic">$1</em>')
        .replace(/`([^`]+)`/gim, '<code class="bg-muted px-1 py-0.5 rounded text-sm">$1</code>')
        .replace(/\n\n/gim, '</p><p class="mb-4">')
        .replace(/\n/gim, "<br>")
        .replace(/^(.*)$/gim, '<p class="mb-4">$1</p>')
  }

  return (
      <div className="container mx-auto p-6 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">새 게임 등록</h1>

        <div className="space-y-6">
          {/* 게임 ID */}
          <Card>
            <CardHeader>
              <CardTitle>게임 ID</CardTitle>
              <CardDescription>자동으로 생성되는 고유 게임 식별자입니다.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingGameId ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-muted-foreground">게임 ID 생성 중...</span>
                  </div>
              ) : (
                  <Input value={gameId} disabled />
              )}
            </CardContent>
          </Card>

          <Separator />

          {/* 게임 제목 */}
          <Card>
            <CardHeader>
              <CardTitle>게임 제목 *</CardTitle>
              <CardDescription>게임의 공식 제목을 입력하세요.</CardDescription>
            </CardHeader>
            <CardContent>
              <Input value={gameTitle} onChange={(e) => setGameTitle(e.target.value)} placeholder="게임 제목" required />
            </CardContent>
          </Card>

          <Separator />

          {/* 최신 리비전 */}
          <Card>
            <CardHeader>
              <CardTitle>최신 리비전</CardTitle>
              <CardDescription>게임의 현재 버전 번호를 입력하세요.</CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                  type="number"
                  value={gameLatestRevision}
                  onChange={(e) => setGameLatestRevision(Number(e.target.value))}
                  placeholder="1"
                  min="1"
              />
            </CardContent>
          </Card>

          <Separator />

          {/* 플랫폼 지원 */}
          <Card>
            <CardHeader>
              <CardTitle>지원 플랫폼</CardTitle>
              <CardDescription>게임이 지원하는 플랫폼을 선택하세요.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                    id="windows"
                    checked={gamePlatformWindows}
                    onCheckedChange={(checked) => setGamePlatformWindows(checked as boolean)}
                />
                <Label htmlFor="windows">Windows</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                    id="mac"
                    checked={gamePlatformMac}
                    onCheckedChange={(checked) => setGamePlatformMac(checked as boolean)}
                />
                <Label htmlFor="mac">macOS</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                    id="mobile"
                    checked={gamePlatformMobile}
                    onCheckedChange={(checked) => setGamePlatformMobile(checked as boolean)}
                />
                <Label htmlFor="mobile">모바일</Label>
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* 게임 엔진 */}
          <Card>
            <CardHeader>
              <CardTitle>게임 엔진</CardTitle>
              <CardDescription>게임 개발에 사용된 엔진을 입력하세요.</CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                  value={gameEngine}
                  onChange={(e) => setGameEngine(e.target.value)}
                  placeholder="Unity, Unreal Engine 등"
              />
            </CardContent>
          </Card>

          <Separator />

          {/* 장르 */}
          <Card>
            <CardHeader>
              <CardTitle>장르 *</CardTitle>
              <CardDescription>게임의 주요 장르를 입력하세요.</CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                  value={gameGenre}
                  onChange={(e) => setGameGenre(e.target.value)}
                  placeholder="액션, RPG, 퍼즐 등"
                  required
              />
            </CardContent>
          </Card>

          <Separator />

          {/* 개발자 */}
          <Card>
            <CardHeader>
              <CardTitle>개발자 *</CardTitle>
              <CardDescription>게임을 개발한 개발자 또는 스튜디오 이름을 입력하세요.</CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                  value={gameDeveloper}
                  onChange={(e) => setGameDeveloper(e.target.value)}
                  placeholder="개발자 이름"
                  required
              />
            </CardContent>
          </Card>

          <Separator />

          {/* 퍼블리셔 */}
          <Card>
            <CardHeader>
              <CardTitle>퍼블리셔</CardTitle>
              <CardDescription>게임을 배급하는 퍼블리셔 이름을 입력하세요.</CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                  value={gamePublisher}
                  onChange={(e) => setGamePublisher(e.target.value)}
                  placeholder="퍼블리셔 이름"
              />
            </CardContent>
          </Card>

          <Separator />

          {/* 얼리 액세스 */}
          <Card>
            <CardHeader>
              <CardTitle>얼리 액세스</CardTitle>
              <CardDescription>이 게임이 얼리 액세스 상태인지 선택하세요.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Checkbox
                    id="earlyAccess"
                    checked={isEarlyAccess}
                    onCheckedChange={(checked) => setIsEarlyAccess(checked as boolean)}
                />
                <Label htmlFor="earlyAccess">얼리 액세스</Label>
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* 출시 여부 */}
          <Card>
            <CardHeader>
              <CardTitle>출시 여부</CardTitle>
              <CardDescription>게임이 정식 출시되었는지 선택하세요.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Checkbox
                    id="released"
                    checked={isReleased}
                    onCheckedChange={(checked) => setIsReleased(checked as boolean)}
                />
                <Label htmlFor="released">정식 출시됨</Label>
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* 출시일 */}
          <Card>
            <CardHeader>
              <CardTitle>출시일</CardTitle>
              <CardDescription>게임의 출시일을 선택하세요.</CardDescription>
            </CardHeader>
            <CardContent>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                      variant="outline"
                      className={cn(
                          "w-full justify-start text-left font-normal",
                          !gameReleasedDate && "text-muted-foreground",
                      )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {gameReleasedDate ? format(gameReleasedDate, "PPP", { locale: ko }) : "날짜를 선택하세요"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={gameReleasedDate} onSelect={setGameReleasedDate} initialFocus />
                </PopoverContent>
              </Popover>
            </CardContent>
          </Card>

          <Separator />

          {/* 웹사이트 */}
          <Card>
            <CardHeader>
              <CardTitle>웹사이트</CardTitle>
              <CardDescription>게임의 공식 웹사이트 URL을 입력하세요.</CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                  value={gameWebsite}
                  onChange={(e) => setGameWebsite(e.target.value)}
                  placeholder="https://example.com"
                  type="url"
              />
            </CardContent>
          </Card>

          <Separator />

          {/* 비디오 URL */}
          <Card>
            <CardHeader>
              <CardTitle>트레일러 비디오 URL</CardTitle>
              <CardDescription>게임 트레일러 비디오의 URL을 입력하세요. (YouTube 임베드 URL 권장)</CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                  value={gameVideoURL}
                  onChange={(e) => setGameVideoURL(e.target.value)}
                  placeholder="https://www.youtube.com/embed/..."
                  type="url"
              />
            </CardContent>
          </Card>

          <Separator />

          {/* 다운로드 URL */}
          <Card>
            <CardHeader>
              <CardTitle>다운로드 URL</CardTitle>
              <CardDescription>선택한 플랫폼에 따라 다운로드 링크를 입력하세요.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {gamePlatformMac && (
                  <div>
                    <Label htmlFor="macDownload">Mac 다운로드 URL</Label>
                    <Input
                        id="macDownload"
                        value={gameDownloadMacURL}
                        onChange={(e) => setGameDownloadMacURL(e.target.value)}
                        placeholder="https://example.com/download/mac"
                        type="url"
                    />
                  </div>
              )}
              {gamePlatformWindows && (
                  <div>
                    <Label htmlFor="winDownload">Windows 다운로드 URL</Label>
                    <Input
                        id="winDownload"
                        value={gameDownloadWinURL}
                        onChange={(e) => setGameDownloadWinURL(e.target.value)}
                        placeholder="https://example.com/download/windows"
                        type="url"
                    />
                  </div>
              )}
            </CardContent>
          </Card>

          <Separator />

          {/* 이미지 URL */}
          <Card>
            <CardHeader>
              <CardTitle>게임 이미지 URL</CardTitle>
              <CardDescription>게임의 대표 이미지 URL을 입력하세요. (1:1.414 비율 권장)</CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                  value={gameImageURL}
                  onChange={(e) => setGameImageURL(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  type="url"
              />
            </CardContent>
          </Card>

          <Separator />

          {/* 바이너리 이름 */}
          <Card>
            <CardHeader>
              <CardTitle>실행 파일 이름</CardTitle>
              <CardDescription>게임의 실행 파일 이름을 입력하세요.</CardDescription>
            </CardHeader>
            <CardContent>
              <Input value={gameBinaryName} onChange={(e) => setGameBinaryName(e.target.value)} placeholder="Game.exe" />
            </CardContent>
          </Card>

          <Separator />

          {/* 게임 헤드라인 */}
          <Card>
            <CardHeader>
              <CardTitle>게임 헤드라인</CardTitle>
              <CardDescription>게임을 한 줄로 설명하는 짧은 헤드라인을 입력하세요.</CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                  value={gameHeadline}
                  onChange={(e) => setGameHeadline(e.target.value)}
                  placeholder="게임의 핵심을 한 줄로 표현하세요"
              />
            </CardContent>
          </Card>

          <Separator />

          {/* 게임 설명 */}
          <Card>
            <CardHeader>
              <CardTitle>게임 설명</CardTitle>
              <CardDescription>게임에 대한 자세한 설명을 마크다운 문법으로 작성하세요.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="min-h-[100px] p-3 border rounded-md bg-muted">
                <div
                    className="text-sm prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(gameDescription) }}
                />
              </div>
              <Dialog open={isDescriptionModalOpen} onOpenChange={setIsDescriptionModalOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" onClick={openDescriptionModal}>
                    <Edit className="mr-2 h-4 w-4" />
                    설명 편집
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-6xl max-h-[80vh]">
                  <DialogHeader>
                    <DialogTitle>게임 설명 편집</DialogTitle>
                    <DialogDescription>마크다운 문법을 사용하여 게임에 대한 자세한 설명을 작성하세요.</DialogDescription>
                  </DialogHeader>
                  <MarkdownEditor
                      value={tempDescription}
                      onChange={setTempDescription}
                      onSave={saveDescription}
                      onCancel={cancelDescription}
                  />
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          <Separator />

          {/* 제출 버튼 */}
          <div className="flex justify-center pt-6">
            <Dialog open={isPreviewModalOpen} onOpenChange={setIsPreviewModalOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="px-8">
                  게임 등록 신청
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>게임 등록 미리보기</DialogTitle>
                  <DialogDescription>
                    등록하기 전에 게임 정보를 확인하세요. 등록 후에는 수정이 어려울 수 있습니다.
                  </DialogDescription>
                </DialogHeader>
                <GamePreview game={createPreviewGame()} />
                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={() => setIsPreviewModalOpen(false)} disabled={isSubmitting}>
                    취소
                  </Button>
                  <Button onClick={handleSubmit} disabled={isSubmitting}>
                    {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          등록 중...
                        </>
                    ) : (
                        "등록 신청"
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
  )
}

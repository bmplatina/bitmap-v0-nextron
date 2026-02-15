"use client"

import { MouseEvent, Suspense, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { EInstallState, Game, GameInstallManager } from "../../../lib/types";
import Image from "next/image";
import { Calendar, Delete, Globe, Play, Tag, User } from "lucide-react";
import Head from 'next/head';
import dayjs from "dayjs";
import {useDispatch, useSelector} from 'react-redux';
import type {RootState} from '../../../lib/store';

import {Button} from "../../../components/ui/button";
import {Badge} from "../../../components/ui/badge";
import {Input} from "../../../components/ui/input";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "../../../components/ui/dialog";
import {Progress} from "../../../components/ui/progress";
import {observer} from "mobx-react";
import {addManager} from "../../../lib/slices/dl-slice";

const GameDetailPage = observer(() => {
    const router = useRouter();
    const { id } = router.query;
    const [isLoading, setIsLoading] = useState(true);

    const dispatch = useDispatch();
    const bIsMac: boolean = useSelector((state: RootState) => state.platform.bIsMac);
    const [bIsCompatible, setIsCompatible] = useState(false);

    function pushNewManager() {
        dispatch(addManager(gameInstallManager));
    }

    const [gameInstallManager, setGameInstallManager] = useState<GameInstallManager>(() => new GameInstallManager());

    // Open-Remove Application
    /**
     * onClink={openExternal} 이 설정되어 있으면 클라이언트의 기본 브라우저로 href를 새 탭에서 호출한다
     * @param event href 자동 감지
     */
    function openExternal(event: MouseEvent<HTMLAnchorElement>) {
        event.preventDefault();
        const url = (event.currentTarget as HTMLAnchorElement).href;

        // TypeScript 안전성 확보
        if (window.electronTools && typeof window.electronTools.openExternal === 'function') {
            window.electronTools.openExternal(url);
        } else {
            console.warn('Electron external link function not available');
        }
    }

    /**
     * Released Ago
     */
    function releasedAgo(): number {
        const today = dayjs();
        const releasedDateFormat = dayjs(gameInstallManager.getGameInfo.gameReleasedDate);
        return today.diff(releasedDateFormat, "years");
    }

    /**
     * Download and Install Game. Call this function directly in your React component.
     */
    const handleDownloadAndInstall = (event: MouseEvent<HTMLButtonElement>) => {
        event.preventDefault(); // 필요한 경우
        const downloadUri = bIsMac ? gameInstallManager.getGameInfo.gameDownloadMacURL : gameInstallManager.getGameInfo.gameDownloadWinURL;
        gameInstallManager.downloadAndInstall(downloadUri, gameInstallManager.getInstallationPath).catch((error) => {
            console.error("Download and Install Error:", error);
        });
        pushNewManager();
    }

    /**
     * Check Platform compatibility
     */
    function GetIsPlatformCompatible(): boolean {
        if(gameInstallManager)
        {
            if(bIsMac) {
                console.log(`GameInstallManager::PlatformMac: ${gameInstallManager.getPlatformMac}`);
                return gameInstallManager.getPlatformMac;
            }

            console.log(`GameInstallManager::PlatformWin: ${gameInstallManager.getPlatformWin}`);
            return gameInstallManager.getPlatformWin;
        }
        else {
            console.error("GameInstallManager: 클래스가 Invalid임", gameInstallManager);
            return false;
        }
    }

    /**
     * Select the installation directory
     */
    async function selectDirectory() {
        const options = {
            title: 'Select Installation Directory',
            properties: ['openDirectory'], // 폴더 선택 가능
        };

        try {
            const path = await (window as any).electronTools.showDialog(options);
            if (path) {
                gameInstallManager.setInstallationPath = bIsMac
                    ? `${path}/${gameInstallManager.getGameInfo.gameBinaryName}/`
                    : `${path}\\${gameInstallManager.getGameInfo.gameBinaryName}\\`; // 선택한 경로 저장
            }
        } catch (error) {
            console.error('파일 선택 중 오류 발생:', error);
        }
    }

    /**
     * Format Date
     * @param dateString ISO Date
     */
    const formatDate = (dateString: string) => {
        if (!dateString) return "TBD";
        return dayjs(dateString).format("YYYY/MM/DD");
    }

    useEffect(() => {
        /**
         * axios를 Electron 메인 프로세스에서 호출하여 CORS 정책을 우회하며 API를 호출한다
         * @param uri GET할 API 주소
         */
        const getGamesFromServer = async (uri: string): Promise<Game[]> => {
            const { bitmapApi } = window as any;
            return await bitmapApi.fetchData(uri);
        }

        getGamesFromServer("https://api.prodbybitmap.com/api/games")
            .then((result: Game[]) => {
                const foundGame = result.find((g) => g.gameId.toString() === id);
                console.log("Found Game: ", foundGame);
                gameInstallManager.setGameInfo = foundGame || null;

                setIsLoading(false);
            })
            .catch((error) => {
                console.error("Error:", error);
                gameInstallManager.setGameInfo = null;
                setIsLoading(false);  // 에러 발생시에도 로딩 상태 업데이트
            });
    }, [id]);

    useEffect(() => {
        if(gameInstallManager.getGameInfo && gameInstallManager) gameInstallManager.pullInstallState();
    }, [gameInstallManager.getGameInfo]);

    useEffect(() => {
        // gameInstallManager.setIsMac = bIsMac;
        console.log("Is Mac: ", gameInstallManager.getIsMac);
        setIsCompatible(GetIsPlatformCompatible());
        console.log(`Game Compatibility: ${bIsCompatible ? "Yes" : "No"}`);
    }, [bIsMac]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full w-full">
                <div className="text-center">
                    <p className="text-xl mb-2">로딩 중...</p>
                    <p className="text-sm text-muted-foreground">
                        게임 정보를 불러오고 있습니다...
                    </p>
                </div>
            </div>
        )
    }

    if (!gameInstallManager.getGameInfo) {
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
                        <Button
                            className="mt-4"
                            variant="outline"
                            onClick={() => router.push('/')}
                        >
                            홈으로 돌아가기
                        </Button>
                    </div>
                </div>
            </>
        )
    }

    return (
        <div>
            <Head>
                <title>{`Bitmap Store: ${gameInstallManager.getGameInfo.gameTitle}`}</title>
                <meta name="description" content={gameInstallManager.getGameInfo.gameHeadline || gameInstallManager.getGameInfo.gameDescription} />
            </Head>
            <div className="container mx-auto p-6 w-full">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* 왼쪽 컬럼 - 이미지 */}
                    <div className="lg:col-span-1">
                        <Suspense fallback={<div className="aspect-[1/1.414] w-full rounded-lg bg-muted"></div>}>
                            <div className="relative aspect-[1/1.414] w-full rounded-lg overflow-hidden">
                                <Image
                                    src={gameInstallManager.getGameInfo.gameImageURL || "/placeholder.svg?height=600&width=424"}
                                    alt={gameInstallManager.getGameInfo.gameTitle}
                                    fill
                                    className="object-cover"
                                    priority
                                />
                            </div>
                        </Suspense>

                        <div className="mt-6 space-y-4">
                            {gameInstallManager.getGameInfo.gameWebsite && (
                                <Button variant="outline" className="w-full" asChild>
                                    <a href={gameInstallManager.getGameInfo.gameWebsite} onClick={openExternal} rel="noopener noreferrer">
                                        <Globe className="mr-2 h-4 w-4" />
                                        웹사이트 방문
                                    </a>
                                </Button>
                            )}

                            {/* When is installed */}
                            {gameInstallManager.getInstallState === EInstallState.Installed && (
                                <div>
                                    <Button className="w-full" asChild onClick={gameInstallManager.openApp}>
                                        <Play className="mr-2 h-4 w-4" />
                                        실행
                                    </Button>

                                    <Button className="w-full" asChild onClick={gameInstallManager.removeApp}>
                                        <Delete className="mr-2 h-4 w-4" />
                                        제거
                                    </Button>
                                </div>
                            )}

                            {/* Install View */}
                            {bIsCompatible && (
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button className="w-full" asChild>
                                            <div>
                                                <Image
                                                    src={`/images/${bIsMac ? "platformMac.png" : "platformWindows11.png"}`}
                                                    alt="다운로드"
                                                    className="mr-2 h-4 w-4"
                                                    width={18}
                                                    height={18}
                                                />
                                                다운로드
                                            </div>
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>{gameInstallManager.getGameInfo.gameTitle}</DialogTitle>
                                            <DialogDescription>
                                                {gameInstallManager.getGameInfo.gameTitle}을(를) 설치합니다.
                                            </DialogDescription>
                                        </DialogHeader>

                                        <Input
                                            readOnly
                                            onClick={selectDirectory}
                                            placeholder="Path"
                                            value={gameInstallManager.getInstallationPath}
                                        />

                                        {gameInstallManager.getIsDownloadingOrInstallingState && (
                                            <div>
                                                {gameInstallManager.getInstallState === EInstallState.Downloading
                                                    ? `다운로드 중: ${Math.round(gameInstallManager.getDownloadProgress)}%`
                                                    : `디스크에 쓰는 중: ${gameInstallManager.getExtractProgress}`
                                                }
                                                <Progress value={gameInstallManager.getInstallState === EInstallState.Downloading
                                                    ? Math.round(gameInstallManager.getDownloadProgress)
                                                    : gameInstallManager.getExtractProgress} />
                                            </div>
                                        )}

                                        <DialogFooter>
                                            <DialogClose asChild>
                                                <Button variant="secondary">Cancel</Button>
                                            </DialogClose>
                                            <Button onClick={handleDownloadAndInstall}>Delete</Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            )}

                        </div>
                    </div>

                    {/* 오른쪽 컬럼 - 상세 정보 */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center gap-3 mb-4">
                            <h1 className="text-3xl font-bold">{gameInstallManager.getGameInfo.gameTitle}</h1>
                            {gameInstallManager.getGameInfo.isEarlyAccess === 1 && <Badge className="bg-blue-500">얼리 액세스</Badge>}
                        </div>

                        <h2 className="text-xl text-muted-foreground mb-6">{gameInstallManager.getGameInfo.gameHeadline}</h2>

                        {/* 게임 정보 그리드 */}
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="flex items-center gap-2">
                                <User className="h-5 w-5 text-muted-foreground" />
                                <span>개발: <strong>{gameInstallManager.getGameInfo.gameDeveloper}</strong></span>
                            </div>
                            <div className="flex items-center gap-2">
                                <User className="h-5 w-5 text-muted-foreground" />
                                <span>유통: <strong>{gameInstallManager.getGameInfo.gamePublisher}</strong></span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Tag className="h-5 w-5 text-muted-foreground" />
                                <span>장르: <strong>{gameInstallManager.getGameInfo.gameGenre}</strong></span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-muted-foreground" />
                                <span>출시: <strong>{formatDate(gameInstallManager.getGameInfo.gameReleasedDate)}</strong></span>
                            </div>
                        </div>

                        {/* 게임 소개 */}
                        <div className="mb-8">
                            <h3 className="text-xl font-semibold mb-4">게임 소개</h3>
                            <div className="prose prose-invert max-w-none">
                                <p>{gameInstallManager.getGameInfo.gameDescription}</p>
                            </div>
                        </div>

                        {/* 트레일러 */}
                        {gameInstallManager.getGameInfo.gameVideoURL && (
                            <div>
                                <h3 className="text-xl font-semibold mb-4">트레일러</h3>
                                <Suspense fallback={<div className="aspect-video w-full rounded-lg bg-muted"></div>}>
                                    <div className="relative aspect-video w-full rounded-lg overflow-hidden">
                                        <iframe
                                            src={`https://www.youtube.com/embed/${gameInstallManager.getGameInfo.gameVideoURL}?rel=0&modestbranding=1&playsinline=1`}
                                            className="absolute inset-0 w-full h-full"
                                            allowFullScreen
                                            referrerPolicy="origin"
                                        />
                                    </div>
                                </Suspense>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
})
export default GameDetailPage;
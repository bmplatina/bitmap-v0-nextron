"use client"

import {MouseEvent, Suspense, useEffect, useState} from "react";
import {useRouter} from "next/router";
import {EInstallState, Game, GameInstallInfo} from "../../../lib/types";
import Image from "next/image";
import {Calendar, Globe, Tag, User} from "lucide-react";
import dayjs from "dayjs";
import Head from 'next/head';

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
import { Progress } from "../../../components/ui/progress";


export default function GameDetailPage() {
    const router = useRouter();
    const { id } = router.query;
    const [game, setGame] = useState<Game | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [bIsMac, setIsMac] = useState(false);

    // Installation States
    const [InstallationPath, setInstallationPath] = useState<string>("");
    const [InstallState, setInstallState] = useState<EInstallState>(EInstallState.NotInstalled);
    const [DefaultInstallationPath, setDefaultInstallationPath] = useState<string>("");
    const [CurrentVersion, setCurrentVersion] = useState<number>(0);

    // Installation Progresses
    const [bIsUpdatable, setIsUpdatable] = useState(false);
    const [downloadProgress, setDownloadProgress] = useState(0);
    const [extractProgress, setExtractProgress] = useState(0);

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
        const releasedDateFormat = dayjs(game.gameReleasedDate);
        return today.diff(releasedDateFormat, "years");
    }

    async function openApp() {
        let openCommand: string = "";

        if (bIsMac) {
            openCommand = `open "${InstallationPath}/${game.gameBinaryName}.app"`;
        }
        else {
            if (InstallationPath.charAt(0) === "C") {
                openCommand = `"${InstallationPath}\\${game.gameBinaryName}.exe"`;
            } else {
                openCommand = `${InstallationPath.charAt(0)}: ; "${InstallationPath}\\${game.gameBinaryName}.exe"`;
            }
        }

        try {
            const result: string = await window.bitmapApi.runCommand(openCommand);
            console.log("명령 실행 성공:", result);
        } catch (error) {
            console.error("명령 실행 중 오류:", error as string);
        }
    }

    async function removeApp() {
        if(InstallationPath) {
            console.log(InstallationPath);
            if(await window.bitmapApi.removeFile(InstallationPath)) {
                setInstallState(EInstallState.NotInstalled);
                setInstallationPath(DefaultInstallationPath);
                await pushInstallState();
            }
        }
    }

    // NeDB Installation Info saver
    async function pullInstallState() {
        try {
            // Declare default installation path
            const getDefaultInstallPath = window.electronTools.getElectronStoredPath();
            getDefaultInstallPath.then((appPath) => {
                console.log("getDefaultInstallPath: ", appPath);
                let DefaultInstallationPathLocal = bIsMac
                    ? `/Users/Shared/Bitmap Production/${game.gameBinaryName}`
                    : `${appPath}\\BitmapApps\\${game.gameBinaryName}`;

                setDefaultInstallationPath(DefaultInstallationPathLocal)
            });

            const getResultLocal = window.bitmapApi.getGameInstallInfoByIndex(game.gameId);
            getResultLocal.then((resolvedData: GameInstallInfo) => {
                console.log("pullInstallState::resolvedData", resolvedData);
                // If getting from store succeed, allocate it to property
                if(!!resolvedData) {
                    console.log("pullInstallState: If getting from store succeed, allocate it to property", resolvedData);
                    setInstallState(resolvedData.gameInstallState);
                    setInstallationPath(resolvedData.gameInstallationPath);
                    setCurrentVersion(resolvedData.gameInstalledVersion);
                    if(game.gameLatestRevision > CurrentVersion) {
                        setIsUpdatable(true);
                    }
                }
                // Otherwise, initialize property
                else {
                    console.log('pullInstallState: Otherwise, initialize property');
                    setInstallationPath('');
                    setInstallState(EInstallState.NotInstalled);
                    setCurrentVersion(0);
                }

                // Check is installation path valid
                if(InstallationPath) {
                    const literalInstallationPath = bIsMac
                        ? `${InstallationPath}/${game.gameBinaryName}`
                        : `${InstallationPath}\\${game.gameBinaryName}`;

                    window.bitmapApi.checkPathValid(literalInstallationPath).then((bIsValid: boolean) => {
                        console.log(`pullInstallState::checkPathValid: ${bIsValid} from game ${game.gameTitle}`);
                        setInstallState(bIsValid ? EInstallState.Installed : EInstallState.NotInstalled);
                    });
                }
                else setInstallState(EInstallState.NotInstalled);

                // Sync installation state
                pushInstallState();
            });
        } catch (error) {
            console.log(error);
        }
    }

    /**
     * Insert or Update InstallState: GameInstallInfo to NeDB
     */
    async function pushInstallState() {
        try {
            const getResultLocal: Promise<GameInstallInfo> = window.bitmapApi.getGameInstallInfoByIndex(game.gameId);
            getResultLocal.then((resolvedData: GameInstallInfo) => {
                console.log("pushInstallState::resolvedData", resolvedData);
                let InstallInfo: GameInstallInfo = {
                    ...game,
                    gameInstallationPath: InstallationPath,
                    gameInstallState: InstallState,
                    gameInstalledVersion: CurrentVersion,
                };

                const bUpdateExising: boolean = !!resolvedData;
                console.log("pushInstallState::bUpdateExisting", bUpdateExising);
                // If resolvedData valid, Update from the existing table, otherwise insert a new table
                if(bUpdateExising) {
                    window.bitmapApi.updateGameInstallInfo(game.gameId, InstallInfo);
                }
                else {
                    window.bitmapApi.setGameInstallInfo(InstallInfo);
                }
            });
        } catch (error) {
            console.log(error);
        }
    }

    /**
     * Download and Install Game. Do not call this function directly.
     * @param url gameDownloadPlatformUrl
     * @param savePath InstallationPath
     */
    async function downloadAndInstall(url: string | null, savePath: string) {
        if(url == null) return;

        const savePathLocal: string | null = bIsMac
            ? `${savePath}/${url.split('/')[url.split('/').length - 1]}`
            : `${savePath}\\${url.split('/')[url.split('/').length - 1]}`;
        console.log(`URL: ${url}, SavePath: ${savePathLocal}`);

        try {
            // 다운로드 진행률 수신
            window.bitmapApi.onDownloadProgress((progress) => {
                setInstallState(EInstallState.Downloading);
                setDownloadProgress(progress);
                console.log(`다운로드 중: ${downloadProgress}, EInstallState.Downloading: ${InstallState === EInstallState.Downloading}`);
            });

            // 다운로드 요청
            const filePath = await window.bitmapApi.downloadFile(url, savePathLocal);
            console.log(`다운로드 완료: ${filePath}, EInstallState.Downloading: ${InstallState === EInstallState.Downloading}`);

            // 압축 해제 진행률 수신
            window.bitmapApi.onExtractProgress((progress) => {
                setInstallState(EInstallState.Extracting);
                setExtractProgress(progress);
                console.log(`압축 해제 중: ${downloadProgress}, EInstallState.Extracting: ${InstallState === EInstallState.Extracting}`);
            });

            // 압축 해제 요청
            const extractedPath = await window.bitmapApi.extractZip(filePath);
            console.log(`압축 해제 완료: ${extractedPath}, EInstallState.Extracting: ${InstallState === EInstallState.Extracting}`);

            setInstallState(EInstallState.Installed); // 작업 완료
            setCurrentVersion(game.gameLatestRevision);
            setIsUpdatable(false);
            pushInstallState();
            console.log(`설치 완료: EInstallState.Installed: ${InstallState === EInstallState.Installed}`);
        }
        catch (error) {
            setInstallState(EInstallState.InstallError);
            console.error('오류 발생:', error);
        }
    }

    /**
     * Download and Install Game. Call this function directly in your React component.
     */
    const handleDownloadAndInstall = (event: MouseEvent<HTMLButtonElement>) => {
        event.preventDefault(); // 필요한 경우
        const downloadUri = bIsMac ? game.gameDownloadMacURL : game.gameDownloadWinURL;
        downloadAndInstall(downloadUri, InstallationPath).catch((error) => {
            console.error("Download and Install Error:", error);
        });
    }


    /**
     * Check Platform compatibility
     */
    function GetIsPlatformCompatible(): boolean {
        if(bIsMac) return game.gamePlatformMac == 1;
        return game.gamePlatformWindows == 1;
    }

    /**
     * Get Installing State
     */
    function GetIsDownloadingOrWritingToDisk(): boolean {
        return InstallState === EInstallState.Downloading || InstallState === EInstallState.Extracting;
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
                const newInstallationPath: string = bIsMac
                    ? `${path}/${game.gameBinaryName}/`
                    : `${path}\\${game.gameBinaryName}\\`; // 선택한 경로 저장
                setInstallationPath(newInstallationPath);
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
                setGame(foundGame || null);

                setIsLoading(false);
            })
            .catch((error) => {
                console.error("Error:", error);
                setGame(null);
                setIsLoading(false);  // 에러 발생시에도 로딩 상태 업데이트
            });
    }, [id]);

    useEffect(() => {
        if(game) pullInstallState();
    }, [game]);

    useEffect(() => {
        async function checkPlatform(): Promise<string>
        {
            const { electronTools } = window as any;
            return electronTools.getPlatform();
        }

        checkPlatform().then((currentPlatform: string) => {
            console.log("Current Platform: ", currentPlatform);
            setIsMac(currentPlatform === 'darwin');
            console.log("Is Mac: ", bIsMac);
        });
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
        <>
            <Head>
                <title>{`Bitmap Store: ${game.gameTitle}`}</title>
                <meta name="description" content={game.gameHeadline || game.gameDescription} />
            </Head>
            <div className="container mx-auto p-6 w-full">
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
                                    <a href={game.gameWebsite} onClick={openExternal} rel="noopener noreferrer">
                                        <Globe className="mr-2 h-4 w-4" />
                                        웹사이트 방문
                                    </a>
                                </Button>
                            )}

                            {/* Install View */}
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
                                        <DialogTitle>{game.gameTitle}</DialogTitle>
                                        <DialogDescription>
                                            {game.gameTitle}을(를) 설치합니다.
                                        </DialogDescription>
                                    </DialogHeader>

                                    <Input
                                        readOnly
                                        onClick={selectDirectory}
                                        placeholder="Path"
                                        value={InstallationPath}
                                    />

                                    {GetIsDownloadingOrWritingToDisk() && (
                                        <div>
                                            {InstallState === EInstallState.Downloading
                                                ? `다운로드 중: ${Math.round(downloadProgress)}%`
                                                : `디스크에 쓰는 중: ${extractProgress}`
                                            }
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
                        </div>
                    </div>

                    {/* 오른쪽 컬럼 - 상세 정보 */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center gap-3 mb-4">
                            <h1 className="text-3xl font-bold">{game.gameTitle}</h1>
                            {game.isEarlyAccess === 1 && <Badge className="bg-blue-500">얼리 액세스</Badge>}
                        </div>

                        <h2 className="text-xl text-muted-foreground mb-6">{game.gameHeadline}</h2>

                        {/* 게임 정보 그리드 */}
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="flex items-center gap-2">
                                <User className="h-5 w-5 text-muted-foreground" />
                                <span>개발: <strong>{game.gameDeveloper}</strong></span>
                            </div>
                            <div className="flex items-center gap-2">
                                <User className="h-5 w-5 text-muted-foreground" />
                                <span>유통: <strong>{game.gamePublisher}</strong></span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Tag className="h-5 w-5 text-muted-foreground" />
                                <span>장르: <strong>{game.gameGenre}</strong></span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-muted-foreground" />
                                <span>출시: <strong>{formatDate(game.gameReleasedDate)}</strong></span>
                            </div>
                        </div>

                        {/* 게임 소개 */}
                        <div className="mb-8">
                            <h3 className="text-xl font-semibold mb-4">게임 소개</h3>
                            <div className="prose prose-invert max-w-none">
                                <p>{game.gameDescription}</p>
                            </div>
                        </div>

                        {/* 트레일러 */}
                        {game.gameVideoURL && (
                            <div>
                                <h3 className="text-xl font-semibold mb-4">트레일러</h3>
                                <Suspense fallback={<div className="aspect-video w-full rounded-lg bg-muted"></div>}>
                                    <div className="relative aspect-video w-full rounded-lg overflow-hidden">
                                        <iframe
                                            src={`https://www.youtube.com/embed/${game.gameVideoURL}?rel=0&modestbranding=1&playsinline=1`}
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
        </>
    )
}
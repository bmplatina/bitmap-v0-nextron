import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from './ui/card';
import {Button} from './ui/button';
import Image from "next/image";
import {Progress} from "./ui/progress";
import {EInstallState, GameInstallManager} from "../lib/types";
import {observer} from "mobx-react";
import {useSelector} from 'react-redux';
import type {RootState} from '../lib/store';

interface GameInstallationCardProps {
    index?: number;
    gameTitle?: string;
    gameImageURL?: string;
    gameDownloadProgress?: number;
    gameExtractProgress?: number;
    gameInstallationPath?: string;
    gameInstallState?: EInstallState;
}

const GameDetailPage = observer(({
    index = 0,
    gameTitle = "GAME_NAME",
    gameImageURL = "",
    gameDownloadProgress = 0,
    gameExtractProgress = 0,
    gameInstallationPath = '/Users/',
    gameInstallState = EInstallState.Downloading
}: GameInstallationCardProps) => {
    const managers = useSelector((state: RootState) => state.gameInstaller.managers);
    const gameMgr: GameInstallManager = managers[index];


    return (
        <Card className="flex items-center p-2">
            <Image
                src={gameImageURL || "/images/unknownImage.png"}
                alt=''
                width={100}
                height={141}
                className="aspect-[1/1.414] object-cover rounded-md ml-2"
            />
            <div className="flex-grow">
                <CardHeader>
                    <CardTitle>{gameTitle}</CardTitle>
                    <CardDescription>
                        {gameInstallState === EInstallState.Downloading && (`다운로드 중: ${Math.round(gameDownloadProgress)}%`)}
                        {gameInstallState === EInstallState.Extracting && (`디스크에 쓰는 중: ${gameExtractProgress}`)}
                        {gameInstallState === EInstallState.Installed && (`"${gameInstallationPath}" 에 설치됨`)}
                        </CardDescription>
                </CardHeader>
                <CardContent>
                    {gameInstallState !== EInstallState.Installed && (
                        <Progress 
                            value={gameInstallState === EInstallState.Downloading
                                ? Math.round(gameDownloadProgress)
                                : gameExtractProgress}
                        />
                    )}
                </CardContent>
                <CardFooter>
                    {gameMgr && gameInstallState === EInstallState.Installed && (
                        <div>
                            <Button
                                variant="default"
                                className="mr-2"
                                onClick={gameMgr.openApp}
                                disabled={!gameMgr}
                            >
                                Play
                            </Button>
                            <Button
                                variant="destructive"
                                className="mr-2"
                                onClick={gameMgr.removeApp}
                                disabled={!gameMgr}
                            >
                                Remove
                            </Button>
                            <Button variant="secondary" className="mr-2">
                                Dismiss
                            </Button>
                        </div>
                    )}
                </CardFooter>
            </div>
        </Card>
    );
});

export default GameDetailPage;
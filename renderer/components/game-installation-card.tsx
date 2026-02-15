import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from './ui/card';
import {Button} from './ui/button';
import Image from "next/image";
import {Progress} from "./ui/progress";
import {EInstallState, GameInstallManager} from "../lib/types";
import {observer} from "mobx-react";
import {useDispatch, useSelector} from 'react-redux';
import type {RootState} from '../lib/store';
import {removeManagerByIndex} from "../lib/slices/dl-slice";

interface GameInstallationCardProps {
    index?: number;
    gameTitle?: string;
    gameImageURL?: string;
    gameDownloadProgress?: number;
    gameExtractProgress?: number;
    gameInstallationPath?: string;
    gameInstallState?: EInstallState;
    testInstallState?: boolean;
}

const GameDetailPage = observer(({
    index = 0,
    gameTitle = "GAME_NAME",
    gameImageURL = "",
    gameDownloadProgress = 0,
    gameExtractProgress = 0,
    gameInstallationPath = '/Users/',
    gameInstallState = EInstallState.Downloading,
    testInstallState = false,
}: GameInstallationCardProps) => {
    const dispatch = useDispatch();
    const managers = useSelector((state: RootState) => state.gameInstaller.managers);
    const bIsMac = useSelector((state: RootState) => state.platform.bIsMac);

    const dismiss = () => {
        // if(managers[index]) dispatch(removeManagerByIndex(index));
        if(managers[index]) managers[index].setShowInDownloadDrawer = false;
    }

    const openApp = () => {
        if(managers[index]) {
            console.log(`Requesting to open ${gameTitle}`);
            managers[index].setIsMac = bIsMac;
            managers[index].openApp();
        }
        else {
            console.log(`Failed to open ${gameTitle}. Game install manager is not valid.`);
        }
    }

    const removeApp = () => {
        if(managers[index]) {
            console.log(`Requesting to remove ${gameTitle}`);
            managers[index].setIsMac = bIsMac;
            managers[index].removeApp();
            dismiss();
        }
        else {
            console.log(`Failed to remove ${gameTitle}. Game install manager is not valid.`);
        }
    }


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
                    {managers[index] && gameInstallState === EInstallState.Installed && (
                        <div>
                            <Button
                                variant="default"
                                className="mr-2"
                                onClick={openApp}
                                disabled={!managers[index]}
                            >
                                Play
                            </Button>
                            <Button
                                variant="destructive"
                                className="mr-2"
                                onClick={removeApp}
                                disabled={!managers[index]}
                            >
                                Remove
                            </Button>
                            <Button variant="secondary" className="mr-2" onClick={dismiss}>
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
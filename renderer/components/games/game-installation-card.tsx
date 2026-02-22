import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Progress } from "@/components/ui/progress";
import { EInstallState, GameInstallManager } from "@/lib/types";
import { useDispatch, useSelector } from "react-redux";
import { useGameInstallManager } from "@/lib/GameInstallManagerContext";

interface GameInstallationCardProps {
  gameId?: number;
  gameTitle?: string;
  gameImageURL?: string;
  gameDownloadProgress?: number;
  gameExtractProgress?: number;
  gameInstallationPath?: string;
  gameInstallState?: EInstallState;
  testInstallState?: boolean;
}

export default function GameInstallationCard({
  gameId = 0,
  gameTitle = "GAME_NAME",
  gameImageURL = "",
  gameDownloadProgress = 0,
  gameExtractProgress = 0,
  gameInstallationPath = "/Users/",
  gameInstallState = EInstallState.Downloading,
  testInstallState = false,
}: GameInstallationCardProps) {
  const { managers, bIsMac } = useGameInstallManager();

  const manager = managers.get(gameId);

  const dismiss = () => {
    // if(managers[index]) dispatch(removeManagerByIndex(index));
    
    if (manager) manager.setShowInDownloadDrawer = false;
  };

  const openApp = () => {
    
    if (manager) {
      console.log(`Requesting to open ${gameTitle}`);
      manager.setIsMac = bIsMac;
      manager.openApp(window.bitmapApi);
    } else {
      console.log(
        `Failed to open ${gameTitle}. Game install manager is not valid.`,
      );
    }
  };

  const removeApp = () => {
    if (manager) {
      console.log(`Requesting to remove ${gameTitle}`);
      manager.setIsMac = bIsMac;
      manager.removeApp(window.bitmapApi);
      dismiss();
    } else {
      console.log(
        `Failed to remove ${gameTitle}. Game install manager is not valid.`,
      );
    }
  };

  return (
    <Card className="flex items-center p-2">
      <Image
        src={gameImageURL || "/images/unknownImage.png"}
        alt=""
        width={100}
        height={141}
        className="aspect-[1/1.414] object-cover rounded-md ml-2"
      />
      <div className="flex-grow">
        <CardHeader>
          <CardTitle>{gameTitle}</CardTitle>
          <CardDescription>
            {gameInstallState === EInstallState.Downloading &&
              `다운로드 중: ${Math.round(gameDownloadProgress)}%`}
            {gameInstallState === EInstallState.Extracting &&
              `디스크에 쓰는 중: ${gameExtractProgress}`}
            {gameInstallState === EInstallState.Installed &&
              `"${gameInstallationPath}" 에 설치됨`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {gameInstallState !== EInstallState.Installed && (
            <Progress
              value={
                gameInstallState === EInstallState.Downloading
                  ? Math.round(gameDownloadProgress)
                  : gameExtractProgress
              }
            />
          )}
        </CardContent>
        <CardFooter>
          {manager && gameInstallState === EInstallState.Installed && (
            <div>
              <Button
                variant="default"
                className="mr-2"
                onClick={openApp}
                disabled={!manager}
              >
                Play
              </Button>
              <Button
                variant="destructive"
                className="mr-2"
                onClick={removeApp}
                disabled={!manager}
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
}

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
  manager: GameInstallManager;
}

export default function GameInstallationCard({
  manager,
}: GameInstallationCardProps) {
  const { bIsMac } = useGameInstallManager();
  const dismiss = () => {
    // if(managers[index]) dispatch(removeManagerByIndex(index));

    if (manager) manager.setShowInDownloadDrawer = false;
  };

  const openApp = () => {
    if (manager) {
      console.log(`Requesting to open ${manager.getGameTitle}`);
      manager.setIsMac = bIsMac;
      manager.openApp(window.bitmapApi);
    } else {
      console.log(`Failed to open. Game install manager is not valid.`);
    }
  };

  const removeApp = () => {
    if (manager) {
      console.log(`Requesting to remove ${manager.getGameTitle}`);
      manager.setIsMac = bIsMac;
      manager.removeApp(window.bitmapApi);
      dismiss();
    } else {
      console.log(`Failed to remove. Game install manager is not valid.`);
    }
  };

  return (
    <Card className="flex items-center p-2">
      <Image
        src={manager.getGameImageURL[0] || "/images/unknownImage.png"}
        alt=""
        width={100}
        height={141}
        className="aspect-[1/1.414] object-cover rounded-md ml-2"
      />
      <div className="flex-grow">
        <CardHeader>
          <CardTitle>{manager.getGameTitle}</CardTitle>
          <CardDescription>
            {manager.getInstallState === EInstallState.Downloading &&
              `다운로드 중: ${Math.round(manager.getDownloadProgress)}%`}
            {manager.getInstallState === EInstallState.Extracting &&
              `디스크에 쓰는 중: ${manager.getExtractProgress}`}
            {manager.getInstallState === EInstallState.Installed &&
              `"${manager.getInstallationPath}" 에 설치됨`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {manager.getInstallState !== EInstallState.Installed && (
            <Progress
              value={
                manager.getInstallState === EInstallState.Downloading
                  ? Math.round(manager.getDownloadProgress)
                  : manager.getExtractProgress
              }
            />
          )}
        </CardContent>
        <CardFooter>
          {manager && manager.getInstallState === EInstallState.Installed && (
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

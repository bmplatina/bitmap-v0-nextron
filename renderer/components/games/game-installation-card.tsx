import { useTranslation } from "next-i18next";
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
import { observer } from "mobx-react-lite";
import { useGameInstallManager } from "@/lib/GameInstallManagerContext";

interface GameInstallationCardProps {
  manager: GameInstallManager;
}

const GameInstallationCard = observer(function ({
  manager,
}: GameInstallationCardProps) {
  const { bIsMac, store } = useGameInstallManager();
  const { t } = useTranslation("GamesView");

  function dismiss() {
    if (manager) manager.setShowInDownloadDrawer = false;
  }

  function removeManager() {
    // if(managers[index]) dispatch(removeManagerByIndex(index));
    if (manager) store.remove(manager.getGameInfo.gameId);
  }

  function openApp() {
    if (manager) {
      console.log(`Requesting to open ${manager.getGameTitle}`);
      manager.setIsMac = bIsMac;
      manager.openApp(window.bitmapApi);
    } else {
      console.log(`Failed to open. Game install manager is not valid.`);
    }
  }

  function removeApp() {
    if (manager) {
      console.log(`Requesting to remove ${manager.getGameTitle}`);
      manager.setIsMac = bIsMac;
      manager.removeApp(window.bitmapApi);
      removeManager();
    } else {
      console.log(`Failed to remove. Game install manager is not valid.`);
    }
  }

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
              `${t("downloading")}: ${Math.round(manager.getDownloadProgress)}%`}
            {manager.getInstallState === EInstallState.Extracting &&
              `${t("writing-to-disk")}: ${manager.getExtractProgress}`}
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
                {t("play")}
              </Button>
              <Button
                variant="destructive"
                className="mr-2"
                onClick={removeApp}
                disabled={!manager}
              >
                {t("uninstall")}
              </Button>
              <Button variant="secondary" className="mr-2" onClick={dismiss}>
                {t("dismiss")}
              </Button>
            </div>
          )}
        </CardFooter>
      </div>
    </Card>
  );
});

export default GameInstallationCard;

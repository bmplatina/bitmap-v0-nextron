import { useEffect, useState } from "react";
import Image from "next/image";
import { useTranslation } from "next-i18next";
import { Delete, Globe, Play } from "lucide-react";
import { Button } from "../ui/button";
import { openExternal } from "@/lib/utils-client";
import { EInstallState, Game, GameInstallManager } from "@/lib/types";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Input } from "../ui/input";
import AppleLogo from "@/public/images/platforms/platformMac.png";
import Windows10Logo from "@/public/images/platforms/platformWindows10.png";
import { useGameInstallManager } from "@/lib/GameInstallManagerContext";
import { Flex } from "@radix-ui/themes";

interface GameInteractableButtonsProps {
  game: Game;
}

export default function GameInteractableButtons({
  game,
}: GameInteractableButtonsProps) {
  const {
    managers: existingInstallManagers,
    bIsMac,
    addManager,
  } = useGameInstallManager();
  const {
    t,
    i18n: { language: locale },
  } = useTranslation("GamesView");

  const [gameInstallManager, setGameInstallManager] =
    useState<GameInstallManager>(() => new GameInstallManager(bIsMac));
  const [bIsCompatible, setIsCompatible] = useState(false);
  const [installationPath, setInstallationPath] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [extractProgress, setExtractProgress] = useState<number>(0);
  const [installState, setInstallState] = useState<EInstallState>(
    EInstallState.NotInstalled,
  );

  function openExternalLink(e: React.MouseEvent<HTMLAnchorElement>) {
    openExternal(e, window.electronTools);
  }

  function pushNewManager() {
    addManager(gameInstallManager);
  }

  /**
   * Download and Install Game. Call this function directly in your React component.
   */
  async function handleDownloadAndInstall(
    event: React.MouseEvent<HTMLButtonElement>,
  ) {
    event.preventDefault(); // 필요한 경우
    try {
      await gameInstallManager.downloadAndInstall(
        window.bitmapApi,
        setDownloadProgress,
        setExtractProgress,
        setInstallState,
      );
    } catch (error: any) {
      console.error("Download and Install Error:", error);
    } finally {
      pushNewManager();
    }
  }

  /**
   * Check Platform compatibility
   */
  function GetIsPlatformCompatible(): boolean {
    if (gameInstallManager) {
      if (bIsMac) {
        console.log(
          `GameInstallManager::PlatformMac: ${gameInstallManager.getPlatformMac}`,
        );
        return gameInstallManager.getPlatformMac;
      }

      console.log(
        `GameInstallManager::PlatformWin: ${gameInstallManager.getPlatformWin}`,
      );
      return gameInstallManager.getPlatformWin;
    } else {
      console.error(
        "GameInstallManager: 클래스가 Invalid임",
        gameInstallManager,
      );
      return false;
    }
  }

  /**
   * Select the installation directory
   */
  async function selectDirectory() {
    const options: Electron.OpenDialogOptions = {
      title: "Select Installation Directory",
      properties: ["openDirectory"], // 폴더 선택 가능
    };

    try {
      const path = await window.electronTools.showDialog(options);
      console.log("Path selected:", path);
      if (path) {
        gameInstallManager.setInstallationPath(path, setInstallationPath);
      }
    } catch (error) {
      console.error("파일 선택 중 오류 발생:", error);
    }
  }

  useEffect(function () {
    gameInstallManager.setGameInfo = game;
  }, []);

  useEffect(() => {
    if (gameInstallManager)
      gameInstallManager.pullInstallState(
        window.electronTools,
        window.bitmapApi,
        setInstallationPath,
        setInstallState,
      );
  }, [gameInstallManager.getGameInfo]);

  useEffect(() => {
    // gameInstallManager.setIsMac = bIsMac;
    console.log("Is Mac: ", gameInstallManager.getIsMac);
    setIsCompatible(GetIsPlatformCompatible());
    console.log(`Game Compatibility: ${bIsCompatible ? "Yes" : "No"}`);
  }, [bIsMac]);

  useEffect(
    function () {
      const existingManager = existingInstallManagers.get(game.gameId);

      if (existingManager) {
        setGameInstallManager(existingManager);
      }
    },
    [existingInstallManagers, game.gameId],
  );

  return (
    <div className="mt-6 space-y-4">
      <Flex direction="column" gap="2">
        {game.gameWebsite && (
          <Button variant="outline" className="w-full" asChild>
            <a
              onClick={openExternalLink}
              href={game.gameWebsite}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Flex gap="1">
                <Globe className="mr-2 h-4 w-4" />
                {t("official-website")}
              </Flex>
            </a>
          </Button>
        )}

        {/* When is installed */}
        {installState === EInstallState.Installed && (
          <>
            <Button
              className="w-full"
              asChild
              onClick={() => gameInstallManager.openApp(window.bitmapApi)}
            >
              <Flex gap="1">
                <Play className="mr-2 h-4 w-4" />
                {t("play")}
              </Flex>
            </Button>

            <Button
              className="w-full"
              asChild
              onClick={() => gameInstallManager.removeApp(window.bitmapApi)}
            >
              <Flex gap="1">
                <Delete className="mr-2 h-4 w-4" />
                {t("uninstall")}
              </Flex>
            </Button>
          </>
        )}

        {/* Install View */}
        {bIsCompatible && (
          <Dialog>
            <DialogTrigger asChild>
              <Button className="w-full">
                <Flex gap="1">
                  <Image
                    src={bIsMac ? AppleLogo : Windows10Logo}
                    alt={t("download")}
                    className="mr-2 h-4 w-4"
                    width={18}
                    height={18}
                  />
                  {t("download")}
                </Flex>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {gameInstallManager.getGameInfo.gameTitle}
                </DialogTitle>
                <DialogDescription>
                  {locale === "ko"
                    ? gameInstallManager.getGameInfo.gameTitle + t("installing")
                    : t("installing") +
                      gameInstallManager.getGameInfo.gameTitle}
                </DialogDescription>
              </DialogHeader>

              <Input
                readOnly
                onClick={selectDirectory}
                placeholder="Path"
                value={installationPath ?? ""}
              />

              {gameInstallManager.getIsDownloadingOrInstallingState && (
                <div>
                  {installState === EInstallState.Downloading
                    ? `다운로드 중: ${Math.round(downloadProgress)}%`
                    : `디스크에 쓰는 중: ${extractProgress}`}
                  <Progress
                    value={
                      installState === EInstallState.Downloading
                        ? Math.round(downloadProgress)
                        : extractProgress
                    }
                  />
                </div>
              )}

              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="secondary">{t("cancel")}</Button>
                </DialogClose>
                <Button onClick={handleDownloadAndInstall}>
                  {t("rate-delete-btn")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </Flex>
    </div>
  );
}

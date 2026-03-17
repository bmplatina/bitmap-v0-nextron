import { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
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

const GameInteractableButtons = observer(function ({
  game,
}: GameInteractableButtonsProps) {
  const { store, bIsMac } = useGameInstallManager();
  const {
    t,
    i18n: { language: locale },
  } = useTranslation("GamesView");

  const [gameInstallManager, setGameInstallManager] =
    useState<GameInstallManager>(() => new GameInstallManager(bIsMac));
  const [bIsCompatible, setIsCompatible] = useState(false);

  function openExternalLink(e: React.MouseEvent<HTMLAnchorElement>) {
    openExternal(e, window.electronTools);
  }

  function pushNewManager() {
    store.add(gameInstallManager);
  }

  /**
   * Download and Install Game. Call this function directly in your React component.
   */
  async function handleDownloadAndInstall(
    event: React.MouseEvent<HTMLButtonElement>,
  ) {
    event.preventDefault(); // 필요한 경우

    // 다운로드가 시작되면 무조건 BottomDrawer에 표시되도록 설정
    gameInstallManager.setShowInDownloadDrawer = true;

    // 다운로드가 시작되기 전에 store에 등록하여 BottomDrawer에 즉시 표시되도록 함
    pushNewManager();

    try {
      await gameInstallManager.downloadAndInstall(window.bitmapApi);
    } catch (error: any) {
      console.error("Download and Install Error:", error);
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
        return !!gameInstallManager.getPlatformMac;
      }

      console.log(
        `GameInstallManager::PlatformWin: ${gameInstallManager.getPlatformWin}`,
      );
      return !!gameInstallManager.getPlatformWin;
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
        gameInstallManager.setInstallationPath = path;
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
      const existingManager = store.managers.get(game.gameId);

      if (existingManager) {
        setGameInstallManager(existingManager);
      }
    },
    [store, game.gameId],
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
        {gameInstallManager.getInstallState === EInstallState.Installed && (
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
                  {t("installing", {
                    gameName: gameInstallManager.getGameInfo.gameTitle,
                  })}
                </DialogDescription>
              </DialogHeader>

              <Input
                readOnly
                onClick={selectDirectory}
                placeholder="Path"
                value={gameInstallManager.getInstallationPath ?? ""}
              />

              {gameInstallManager.getIsDownloadingOrInstallingState && (
                <div>
                  {gameInstallManager.getInstallState ===
                  EInstallState.Downloading
                    ? t("downloading", {
                        progress: Math.round(
                          gameInstallManager.getDownloadProgress,
                        ),
                      })
                    : t("writing-to-disk", {
                        progress: gameInstallManager.getExtractProgress,
                      })}
                  <Progress
                    value={
                      gameInstallManager.getInstallState ===
                      EInstallState.Downloading
                        ? Math.round(gameInstallManager.getDownloadProgress)
                        : gameInstallManager.getExtractProgress
                    }
                  />
                </div>
              )}

              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="secondary">{t("cancel")}</Button>
                </DialogClose>
                <Button onClick={handleDownloadAndInstall}>
                  {t("install")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </Flex>
    </div>
  );
});

export default GameInteractableButtons;

import { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { Delete, Globe, Monitor, Play } from "lucide-react";
import LocalizedLink from "../common/localized-link";
import { Button } from "../ui/button";
import { openExternal } from "@/lib/utils-client";
import { observer } from "mobx-react";
import { EInstallState, Game, GameInstallManager } from "@/lib/types";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/lib/store";
import { addManager } from "@/lib/slices/dl-slice";
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

interface GameInteractableButtonsProps {
  game: Game;
}

export default observer(function GameInteractableButtons({
  game,
}: GameInteractableButtonsProps) {
  const router = useRouter();
  const {
    t,
    i18n: { language: locale },
  } = useTranslation("GamesView");

  function openExternalLink(e: React.MouseEvent<HTMLAnchorElement>) {
    openExternal(e, window.electronTools);
  }

  const dispatch = useDispatch();
  const bIsMac: boolean = useSelector(
    (state: RootState) => state.platform.bIsMac,
  );
  const [bIsCompatible, setIsCompatible] = useState(false);

  function pushNewManager() {
    dispatch(addManager(gameInstallManager));
  }

  const [gameInstallManager, setGameInstallManager] =
    useState<GameInstallManager>(() => new GameInstallManager());

  /**
   * Download and Install Game. Call this function directly in your React component.
   */
  const handleDownloadAndInstall = (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    event.preventDefault(); // 필요한 경우
    const downloadUri = bIsMac
      ? gameInstallManager.getGameInfo.gameDownloadMacURL
      : gameInstallManager.getGameInfo.gameDownloadWinURL;
    gameInstallManager
      .downloadAndInstall(
        window.bitmapApi,
        downloadUri,
        gameInstallManager.getInstallationPath ?? "",
      )
      .catch((error) => {
        console.error("Download and Install Error:", error);
      });
    pushNewManager();
  };

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
    const options = {
      title: "Select Installation Directory",
      properties: ["openDirectory"], // 폴더 선택 가능
    };

    try {
      const path = await (window as any).electronTools.showDialog(options);
      if (path) {
        gameInstallManager.setInstallationPath = bIsMac
          ? `${path}/${gameInstallManager.getGameInfo.gameBinaryName}/`
          : `${path}\\${gameInstallManager.getGameInfo.gameBinaryName}\\`; // 선택한 경로 저장
      }
    } catch (error) {
      console.error("파일 선택 중 오류 발생:", error);
    }
  }

  useEffect(() => {
    if (gameInstallManager.getGameInfo && gameInstallManager)
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

  return (
    <div className="mt-6 space-y-4">
      {game.gameWebsite && (
        <Button variant="outline" className="w-full" asChild>
          <a
            onClick={openExternalLink}
            href={game.gameWebsite}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Globe className="mr-2 h-4 w-4" />
            {t("official-website")}
          </a>
        </Button>
      )}
      {gameInstallManager.getGameInfo.gameWebsite && (
        <Button variant="outline" className="w-full" asChild>
          <a
            href={gameInstallManager.getGameInfo.gameWebsite}
            onClick={openExternalLink}
            rel="noopener noreferrer"
          >
            <Globe className="mr-2 h-4 w-4" />
            웹사이트 방문
          </a>
        </Button>
      )}

      {/* When is installed */}
      {gameInstallManager.getInstallState === EInstallState.Installed && (
        <div>
          <Button
            className="w-full"
            asChild
            onClick={() => gameInstallManager.openApp(window.bitmapApi)}
          >
            <Play className="mr-2 h-4 w-4" />
            실행
          </Button>

          <Button
            className="w-full"
            asChild
            onClick={() => gameInstallManager.removeApp(window.bitmapApi)}
          >
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
                  src={bIsMac ? AppleLogo : Windows10Logo}
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
              <DialogTitle>
                {gameInstallManager.getGameInfo.gameTitle}
              </DialogTitle>
              <DialogDescription>
                {gameInstallManager.getGameInfo.gameTitle}을(를) 설치합니다.
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
                  ? `다운로드 중: ${Math.round(gameInstallManager.getDownloadProgress)}%`
                  : `디스크에 쓰는 중: ${gameInstallManager.getExtractProgress}`}
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
                <Button variant="secondary">Cancel</Button>
              </DialogClose>
              <Button onClick={handleDownloadAndInstall}>Delete</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
});

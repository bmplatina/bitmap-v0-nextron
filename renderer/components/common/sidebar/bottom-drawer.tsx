"use client";

import { useDispatch, useSelector } from "react-redux";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import GameInstallationCard from "../../games/game-installation-card";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EInstallState, GameInstallManager } from "@/lib/types";
import { useGameInstallManager } from "@/lib/GameInstallManagerContext";
import { useState } from "react";

export default function BottomDrawer() {
  const { addManager, managers, bIsMac } = useGameInstallManager();

  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [extractProgress, setExtractProgress] = useState<number>(0);
  const [installState, setInstallState] = useState<EInstallState>(
    EInstallState.NotInstalled,
  );

  const createExampleManagerWithInstalledState = () => {
    createExampleManager(true);
  };

  const createExampleManagerWithDownloadingState = () => {
    createExampleManager(false);
  };

  const createExampleManager = (bIsInstalled: boolean) => {
    const exampleMgr: GameInstallManager = new GameInstallManager(bIsMac);
    exampleMgr.setGameInfo = {
      gameId: 0,
      uid: "example-game",
      isApproved: true,
      gameTitle: "Example Game",
      gameLatestRevision: 0,
      gamePlatformWindows: false,
      gamePlatformMac: true,
      gameEngine: "Unreal",
      gameGenre: { ko: "Action", en: "Action" },
      gameDeveloper: "Example Developer",
      gamePublisher: "Example Publisher",
      isEarlyAccess: false,
      isReleased: false,
      gameReleasedDate: "2021-01-01",
      gameWebsite: "https://example.com",
      gameVideoURL: "dsdfdfssdf",
      gameDownloadMacURL: "dsdfdfssdf",
      requirementsMac: "dsdfdfssdf",
      gameDownloadWinURL: "https://example.com",
      requirementsWindows: "dsdfdfssdf",
      gameImageURL: ["https://example.com"],
      gameBinaryName: "ExampleGame",
      gameHeadline: {
        ko: "Example Game Headline",
        en: "Example Game Headline",
      },
      gameDescription: {
        ko: "Example Game Description",
        en: "Example Game Description",
      },
    };
    // gameTitle={manager.getGameTitle}
    // gameImageURL={manager.getGameImageURL}
    // gameDownloadProgress={manager.getDownloadProgress}
    // gameExtractProgress={manager.getExtractProgress}
    // gameInstallState={manager.getInstallState}
    // gameInstallationPath={manager.getInstallationPath}

    exampleMgr.setDownloadProgress = 0;
    exampleMgr.setExtractProgress = 0;
    exampleMgr.setInstallState = bIsInstalled
      ? EInstallState.Downloading
      : EInstallState.Installed;
    exampleMgr.setInstallationPath("/Users/Shared/Downloads/ExampleGame");

    addManager(exampleMgr);
  };

  return (
    <Drawer>
      {/* Footer 스타일의 트리거 */}
      <DrawerTrigger
        style={{
          WebkitBackdropFilter: "saturate(180%) blur(20px)",
          backdropFilter: "saturate(180%) blur(20px)",
          backgroundColor: "var(--topbar-bg, rgba(255, 255, 255, 0.72))",
        }}
        className="fixed bottom-0 left-64 right-0 z-50
                           bg-background border-t
                           flex items-center justify-center
                           p-4 hover:bg-accent
                           transition-all duration-200"
      >
        <div className="flex items-center gap-2">
          <Download className="w-5 h-5" />
          <span>Downloads</span>
        </div>
      </DrawerTrigger>

      <DrawerContent className="left-64">
        <DrawerHeader>
          <DrawerTitle>다운로드</DrawerTitle>
          <DrawerDescription>
            다운로드하고 있는 항목을 관리합니다.
          </DrawerDescription>
        </DrawerHeader>

        {[...managers.entries()].map(([gameId, mgr]) => (
          <>
            {mgr.getShowInDownloadDrawer && (
              <GameInstallationCard key={gameId} manager={mgr} />
            )}
          </>
        ))}
        {/*<GameInstallationCard gameTitle="Example"/>*/}

        <DrawerFooter>
          {/*<Button variant="secondary" onClick={createExampleManagerWithDownloadingState}>Create Example Manager: Installing</Button>*/}
          {/*<Button variant="outline" onClick={createExampleManagerWithInstalledState}>Create Example Manager: Installed</Button>*/}
          <DrawerClose>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

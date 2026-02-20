"use client";

import { observer } from "mobx-react-lite";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/lib/store";

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
import { addManager } from "@/lib/slices/dl-slice";

const BottomDrawer = observer(() => {
  const managers: GameInstallManager[] = useSelector(
    (state: RootState) => state.gameInstaller.managers,
  );
  const dispatch = useDispatch();

  const createExampleManagerWithInstalledState = () => {
    createExampleManager(true);
  };

  const createExampleManagerWithDownloadingState = () => {
    createExampleManager(false);
  };

  const createExampleManager = (bIsInstalled: boolean) => {
    const exampleMgr: GameInstallManager = new GameInstallManager();
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
    exampleMgr.setInstallationPath = "/Users/Shared/Downloads/ExampleGame";

    dispatch(addManager(exampleMgr));
  };

  return (
    <Drawer>
      {/* Footer 스타일의 트리거 */}
      <DrawerTrigger
        className="fixed bottom-0 left-0 right-0 z-50
                           bg-background border-t
                           flex items-center justify-center
                           p-4 hover:bg-accent
                           transition-colors duration-200"
      >
        <div className="flex items-center gap-2">
          {/* 여기에 Footer 내용 추가 */}
          <Download className="w-5 h-5" />
          <span>Downloads</span>
        </div>
      </DrawerTrigger>

      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>다운로드</DrawerTitle>
          <DrawerDescription>
            다운로드하고 있는 항목을 관리합니다.
          </DrawerDescription>
        </DrawerHeader>

        {managers.map((manager, index) => (
          <div key={index}>
            {manager.getShowInDownloadDrawer && (
              <GameInstallationCard
                index={index}
                gameTitle={manager.getGameTitle}
                gameImageURL={manager.getGameImageURL[0]}
                gameDownloadProgress={manager.getDownloadProgress}
                gameExtractProgress={manager.getExtractProgress}
                gameInstallState={manager.getInstallState}
                gameInstallationPath={manager.getInstallationPath ?? undefined}
              />
            )}
          </div>
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
});

export default BottomDrawer;

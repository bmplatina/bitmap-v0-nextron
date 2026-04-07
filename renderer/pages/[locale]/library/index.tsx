import React, { useState } from "react";
import { getStaticPaths, makeStaticProperties } from "@/lib/get-static";
import {
  AspectRatio,
  ContextMenu,
  Container,
  Flex,
  ScrollArea,
} from "@radix-ui/themes";
import { observer } from "mobx-react-lite";
import { useGameInstallManager } from "@/lib/GameInstallManagerContext";
import { useTranslation } from "next-i18next";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { GameInstallManager, GameWithSize, GameRating, EInstallState } from "@/lib/types";
import { cn } from "@/lib/utils";
import GameDetail from "@/components/games/game-details";
import { getGameRatesById } from "@/lib/games";
import { useRouter } from "next/router";

interface GameListButtonProps {
  gameMgr: GameInstallManager;
  bIsSelected: boolean;
  gameIdCallback: (gameId: number) => void;
  removeCallback: () => void;
}

const GameListButton = observer(function ({
  gameMgr,
  bIsSelected,
  gameIdCallback,
  removeCallback,
}: GameListButtonProps) {
  const { t } = useTranslation("DownloadLibrary");

  async function removeApp() {
    await gameMgr.removeApp(window.bitmapApi);
    removeCallback();
  }

  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger>
        <button
          className={cn(
            "flex w-full justify-start items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors hover:bg-accent hover:text-accent-foreground outline-none text-left",
            bIsSelected
              ? "bg-accent text-accent-foreground font-medium"
              : "text-muted-foreground",
          )}
          onClick={() => gameIdCallback(gameMgr.getGameInfo.gameId)}
        >
          {/* 아이콘이 필요한 경우 여기에 추가할 수 있습니다 */}
          <Image
            src={
              gameMgr.getGameImageURL[2] ||
              gameMgr.getGameImageURL[0] ||
              "/placeholder.svg?height=40&width=40"
            }
            alt={gameMgr.getGameTitle}
            width={25}
            height={25}
            className="object-cover"
          />
          {gameMgr.getGameTitle || t("unknown_game")}
        </button>
      </ContextMenu.Trigger>
      <ContextMenu.Content>
        <ContextMenu.Item
          color="green"
          onClick={() => gameMgr.openApp(window.bitmapApi)}
        >
          {t("play")}
        </ContextMenu.Item>
        <ContextMenu.Item disabled>{t("add-to-favorites")}</ContextMenu.Item>
        <ContextMenu.Separator />

        <ContextMenu.Sub>
          <ContextMenu.SubTrigger>{t("manage")}</ContextMenu.SubTrigger>
          <ContextMenu.SubContent>
            <ContextMenu.Item disabled>{t("add-shortcut")}</ContextMenu.Item>
            <ContextMenu.Item disabled>{t("open-local")}</ContextMenu.Item>
            <ContextMenu.Separator />
            <ContextMenu.Item shortcut="⌘ ⌫" color="red" onClick={removeApp}>
              {t("uninstall")}
            </ContextMenu.Item>
          </ContextMenu.SubContent>
        </ContextMenu.Sub>

        <ContextMenu.Separator />
        <ContextMenu.Item disabled>{t("properties")}</ContextMenu.Item>
      </ContextMenu.Content>
    </ContextMenu.Root>
  );
});

const LibraryPage = observer(function () {
  const router = useRouter();
  const { t } = useTranslation("DownloadLibrary");
  const { gameId } = router.query;
  const { bIsMac, store } = useGameInstallManager();
  const [gameManagers, setGameManagers] = React.useState<GameInstallManager[]>(
    [],
  );
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedGameId, setSelectedGameId] = useState<number | null>(null);
  const [libraryViewedGameInfo, setLibraryViewedGameInfo] =
    useState<GameWithSize>();
  const [libraryViewedGameRating, setLibraryViewedGameRating] =
    useState<GameRating[]>();

  function setGameDetail(newGameId: number) {
    setSelectedGameId(newGameId);
    // getGameById(window.bitmapApi, newGameId.toString()).then((payload) => {
    //   if (payload) setLibraryViewedGameInfo(payload);
    // });
    const gameInfo = gameManagers.find(
      (mgr) => mgr.getGameInfo.gameId === newGameId,
    )?.getGameInfo;
    setLibraryViewedGameInfo(gameInfo);
    getGameRatesById(window.bitmapApi, newGameId.toString()).then((payload) => {
      if (payload) setLibraryViewedGameRating(payload);
    });
  }

  async function fetchInstallInfos() {
    try {
      const payloads = await window.bitmapApi.getGameInstallInfoAll();

      // 1. 이미 설치된 상태인 매니저만 메모리에서 제거하여 DB 데이터와 동기화 준비
      // (진행 중인 다운로드 상태 등은 유지)
      for (const [id, manager] of store.managers.entries()) {
        if (manager.getInstallState === EInstallState.Installed) {
          store.managers.delete(id);
        }
      }

      // 2. DB 페이로드 데이터를 스토어에 주입
      payloads.forEach((payload) => {
        if (!store.managers.has(payload.gameId)) {
          const manager = new GameInstallManager(bIsMac);
          manager.setGameInfo = payload;
          manager.setInstallationPath = payload.gameInstallationPath;
          manager.setInstallState = payload.gameInstallState;
          manager.setCurrentVersion = payload.gameInstalledVersion;
          store.add(manager);
        }
      });

      // 3. 사이드바 상태 업데이트 (NotInstalled 상태 제외)
      setGameManagers(() => {
        const allManagers = Array.from(store.managers.values());
        const uniqueByTitle = new Map<string, GameInstallManager>();

        allManagers.forEach((mgr) => {
          const title = mgr.getGameTitle;
          const state = mgr.getInstallState;

          // 조건: NotInstalled가 아니고 중복되지 않은 제목만 표시
          if (state !== EInstallState.NotInstalled && !uniqueByTitle.has(title)) {
            uniqueByTitle.set(title, mgr);
          }
        });

        const updatedList = Array.from(uniqueByTitle.values());

        // 현재 선택된 게임이 리스트에서 사라졌다면 상세정보 초기화
        if (
          selectedGameId &&
          !updatedList.some((m) => m.getGameInfo.gameId === selectedGameId)
        ) {
          setSelectedGameId(null);
          setLibraryViewedGameInfo(undefined);
          setLibraryViewedGameRating(undefined);
        }

        return updatedList;
      });
    } catch (error) {
      console.error("Failed to fetch game install infos:", error);
    }
  }

  React.useEffect(
    function () {
      fetchInstallInfos();
    },
    [bIsMac, store],
  );

  React.useEffect(
    function () {
      if (gameId) {
        setGameDetail(Number(gameId));
      }
    },
    [gameId],
  );

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full relative overflow-hidden bg-background">
      {/* Collapsible Sidebar (Overlay) */}
      <div
        className={cn(
          "fixed top-[4rem] left-0 md:left-64 h-[calc(100vh-4rem)] apple-blur border-r flex-col flex transition-all duration-300 ease-in-out z-40 shadow-xl w-64",
          isSidebarOpen
            ? "translate-x-0 opacity-100"
            : "-translate-x-full md:-translate-x-[200%] opacity-0 pointer-events-none",
        )}
      >
        <ScrollArea
          type="auto"
          scrollbars="vertical"
          className="flex-1 p-4 w-64"
        >
          {gameManagers.length > 0 && (
            <>
              <h3 className="text-sm font-medium text-muted-foreground mb-3 px-2 whitespace-nowrap">
                {t("games")}
              </h3>
              <div className="space-y-1">
                {gameManagers.map((manager) => (
                  <GameListButton
                    key={manager.getGameInfo.gameId}
                    gameMgr={manager}
                    gameIdCallback={setGameDetail}
                    bIsSelected={selectedGameId === manager.getGameInfo.gameId}
                    removeCallback={fetchInstallInfos}
                  />
                ))}
              </div>
            </>
          )}
        </ScrollArea>
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className={cn(
          "fixed top-1/2 -translate-y-1/2 z-50 flex items-center justify-center w-6 h-12 apple-blur border border-border rounded-r-md shadow-md hover:bg-accent/50 transition-all duration-300 focus:outline-none",
          isSidebarOpen ? "left-64 md:left-[32rem]" : "left-0 md:left-64",
        )}
        aria-label="Toggle Sidebar"
      >
        {isSidebarOpen ? (
          <ChevronLeft size={16} className="text-muted-foreground" />
        ) : (
          <ChevronRight size={16} className="text-muted-foreground" />
        )}
      </button>

      {/* Main Content */}
      <div className="flex-1 flex flex-col w-full h-full overflow-y-auto">
        <Container size="4" className="h-full">
          <Flex direction="column" p="6" gap="4" className="h-full">
            {libraryViewedGameInfo && libraryViewedGameRating ? (
              <GameDetail
                game={libraryViewedGameInfo}
                gameRates={libraryViewedGameRating}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                {t("nothing-chosen")}
              </div>
            )}
          </Flex>
        </Container>
      </div>
    </div>
  );
});

export default LibraryPage;

export const getStaticProps = makeStaticProperties([
  "DownloadLibrary",
  "Sidebar",
]);
export { getStaticPaths };

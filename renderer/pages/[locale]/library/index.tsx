import React, { useState } from "react";
import { getStaticPaths, makeStaticProperties } from "@/lib/get-static";
import { Container, Flex, ScrollArea } from "@radix-ui/themes";
import { observer } from "mobx-react-lite";
import { useGameInstallManager } from "@/lib/GameInstallManagerContext";
import { useTranslation } from "next-i18next";
import Image from "next/image";
import { GameWithSize, GameRating, EInstallState } from "@/lib/types";
import { GameInstallManager } from "@/lib/game-manager";
import { cn } from "@/lib/utils";
import GameDetail from "@/components/games/game-details";
import { getGameRatesById } from "@/lib/games";
import { useRouter } from "next/router";
import GameContextMenu from "@/components/games/game-context-menu";

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

  return (
    <GameContextMenu gameMgr={gameMgr} removeCallback={removeCallback}>
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
    </GameContextMenu>
  );
});

const LibraryPage = observer(function () {
  const router = useRouter();
  const { t } = useTranslation("DownloadLibrary");
  const { gameId } = router.query;
  const { bIsMac, store, queueManager } = useGameInstallManager();
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

    // Read from the MobX store directly (source of truth) instead of
    // relying on the gameManagers React state, which may be stale in
    // closures captured by useEffect.
    const manager = store.managers.get(newGameId);
    const gameInfo = manager?.getGameInfo;
    setLibraryViewedGameInfo(gameInfo ? { ...gameInfo } : undefined);
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
          const bQueued = queueManager.isQueuedOrRunning(mgr.getGameInfo.gameId);

          // 조건: 설치됨/진행중이거나 큐에 존재하고 중복되지 않은 제목만 표시
          if (
            (state !== EInstallState.NotInstalled || bQueued) &&
            !uniqueByTitle.has(title)
          ) {
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
    [bIsMac, store, queueManager],
  );

  React.useEffect(
    function () {
      if (gameId) {
        setGameDetail(Number(gameId));
      }
    },
    [gameId, gameManagers],
  );

  // When gameManagers updates and a game is currently selected, re-sync
  // the detail view so it reflects the latest manager data (e.g. after
  // fetchInstallInfos re-creates managers).
  React.useEffect(
    function () {
      if (gameManagers.length === 0) setIsSidebarOpen(false);
      // 설치된 게임이 있고 선택된 게임이 없으며 URL에 gameId가 없을 때 첫 번째 게임 자동 선택
      if (gameManagers.length > 0 && !selectedGameId && !gameId) {
        setGameDetail(gameManagers[0].getGameInfo.gameId);
      } else if (gameManagers.length > 0 && selectedGameId && !gameId) {
        // 매니저가 재생성되었을 수 있으므로 현재 선택된 게임의 정보를 갱신
        const currentManager = store.managers.get(selectedGameId);
        if (currentManager) {
          setLibraryViewedGameInfo({ ...currentManager.getGameInfo });
        }
      }
    },
    [gameManagers, selectedGameId, gameId],
  );

  const showMainSidebar = router.query.sidebar === "main";

  return (
    <>
      {/* Collapsible Sidebar (Overlay for mobile, Static for desktop) */}
      <aside
        className={cn(
          "fixed top-12 left-0 h-[calc(100vh-48px)] w-64 hidden md:block z-31",
          showMainSidebar && "md:hidden",
        )}
      >
        {!showMainSidebar && (
          <div className="w-64 h-full bg-background border-r flex-col hidden md:flex">
            <div className={cn("flex-1 overflow-y-auto p-4")}>
              <ScrollArea
                type="auto"
                scrollbars="vertical"
                className="flex-1 p-4 w-64"
              >
                <div className="mb-4">
                  <button
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
                    onClick={() =>
                      router.push({
                        pathname: router.pathname,
                        query: { ...router.query, sidebar: "main" },
                      })
                    }
                  >
                    {t("toggle-sidebar")}
                  </button>
                </div>
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
                          bIsSelected={
                            selectedGameId === manager.getGameInfo.gameId
                          }
                          removeCallback={fetchInstallInfos}
                        />
                      ))}
                    </div>
                  </>
                )}
              </ScrollArea>
            </div>
          </div>
        )}
      </aside>
      <div className="flex w-full h-full min-h-0">
        {/* Main Content */}
        <div className="min-w-0 flex-1 flex flex-col h-full overflow-y-auto">
          <Container size="4" className="h-full">
            <Flex direction="column" p="6" gap="4" className="h-full">
              {libraryViewedGameInfo && libraryViewedGameRating ? (
                <GameDetail
                  game={libraryViewedGameInfo}
                  gameRates={libraryViewedGameRating}
                />
              ) : (
                gameManagers.length === 0 && (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    {t("nothing-chosen")}
                  </div>
                )
              )}
            </Flex>
          </Container>
        </div>
      </div>
    </>
  );
});

export default LibraryPage;

export const getStaticProps = makeStaticProperties([
  "DownloadLibrary",
  "Sidebar",
]);
export { getStaticPaths };

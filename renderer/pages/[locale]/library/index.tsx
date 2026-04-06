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
import { GameInstallManager, GameWithSize, GameRating } from "@/lib/types";
import { cn } from "@/lib/utils";
import GameDetail from "@/components/games/game-details";
import { getGameById, getGameRatesById } from "@/lib/games";

interface GameListButtonProps {
  gameMgr: GameInstallManager;
  bIsSelected: boolean;
  gameIdCallback: (gameId: number) => void;
}

const GameListButton = observer(function ({
  gameMgr,
  bIsSelected,
  gameIdCallback,
}: GameListButtonProps) {
  const { t } = useTranslation(["GamesView", "Sidebar"]);
  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger>
        <button
          className={cn(
            "flex w-full justify-start items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors hover:bg-accent hover:text-accent-foreground outline-none",
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
        <ContextMenu.Item shortcut="⌘ D" disabled>
          Duplicate
        </ContextMenu.Item>
        <ContextMenu.Separator />
        <ContextMenu.Item shortcut="⌘ N" disabled>
          Archive
        </ContextMenu.Item>

        <ContextMenu.Sub>
          <ContextMenu.SubTrigger>{t("manage")}</ContextMenu.SubTrigger>
          <ContextMenu.SubContent>
            <ContextMenu.Item disabled>Move to project…</ContextMenu.Item>
            <ContextMenu.Item disabled>Move to folder…</ContextMenu.Item>
            <ContextMenu.Separator />
            <ContextMenu.Item
              shortcut="⌘ ⌫"
              color="red"
              onClick={() => gameMgr.removeApp(window.bitmapApi)}
            >
              {t("uninstall")}
            </ContextMenu.Item>
          </ContextMenu.SubContent>
        </ContextMenu.Sub>

        <ContextMenu.Separator />
        <ContextMenu.Item disabled>Share</ContextMenu.Item>
        <ContextMenu.Item disabled>Add to favorites</ContextMenu.Item>
        <ContextMenu.Separator />
      </ContextMenu.Content>
    </ContextMenu.Root>
  );
});

const LibraryPage = observer(function () {
  const { t } = useTranslation("GamesView");
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
    getGameById(window.bitmapApi, newGameId.toString()).then((payload) => {
      if (payload) setLibraryViewedGameInfo(payload);
    });
    getGameRatesById(window.bitmapApi, newGameId.toString()).then((payload) => {
      if (payload) setLibraryViewedGameRating(payload);
    });
  }

  React.useEffect(
    function () {
      async function fetchInstallInfos() {
        try {
          const payloads = await window.bitmapApi.getGameInstallInfoAll();

          // 1. 모든 페이로드 데이터를 스토어에 먼저 주입
          payloads.forEach((payload) => {
            const manager = new GameInstallManager(bIsMac);
            manager.setGameInfo = payload;
            manager.setInstallationPath = payload.gameInstallationPath;
            manager.setInstallState = payload.gameInstallState;
            manager.setCurrentVersion = payload.gameInstalledVersion;
            store.add(manager);
          });

          // 2. 루프 완료 후 중복 제거 및 경로 조건 필터링을 거쳐 상태 업데이트
          setGameManagers(() => {
            const allManagers = Array.from(store.managers.values());
            const uniqueByTitle = new Map<string, GameInstallManager>();

            allManagers.forEach((mgr) => {
              const title = mgr.getGameTitle;
              const path = mgr.getInstallationPath;

              // 조건:
              // 1. 설치 경로(getInstallationPath)가 비어있지 않아야 함 (남기기 위한 필수 조건)
              // 2. 제목(getGameTitle)이 중복되는 경우 하나만 남김
              if (path && !uniqueByTitle.has(title)) {
                uniqueByTitle.set(title, mgr);
              }
            });

            return Array.from(uniqueByTitle.values());
          });
        } catch (error) {
          console.error("Failed to fetch game install infos:", error);
        }
      }
      fetchInstallInfos();
    },
    [bIsMac, store],
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
        <div className="flex-1 overflow-y-auto p-4 w-64">
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
              />
            ))}
          </div>
        </div>
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
                {t(
                  "select_game_to_view_details",
                  "Select a game to view details",
                )}
              </div>
            )}
          </Flex>
        </Container>
      </div>
    </div>
  );
});

export default LibraryPage;

export const getStaticProps = makeStaticProperties(["GamesView"]);
export { getStaticPaths };

import React from "react";
import { getStaticPaths, makeStaticProperties } from "@/lib/get-static";
import { ContextMenu, Button, Container } from "@radix-ui/themes";
import { observer } from "mobx-react-lite";
import { useGameInstallManager } from "@/lib/GameInstallManagerContext";
import { useTranslation } from "next-i18next";
import {
  EInstallState,
  GameInstallInfo,
  GameInstallManager,
} from "@/lib/types";
import { cn } from "@/lib/utils";

interface GameListButtonProps {
  gameMgr: GameInstallManager;
}

const GameListButton = observer(function ({ gameMgr }: GameListButtonProps) {
  const { t } = useTranslation("GamesView");
  const isActive = false; // 활성 상태 로직은 추후 구현
  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger>
        <Button
          variant="ghost"
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
            isActive
              ? "bg-accent text-accent-foreground font-medium"
              : "text-muted-foreground",
          )}
        >
          {gameMgr?.getGameTitle || t("unknown_game")}
        </Button>
      </ContextMenu.Trigger>
      <ContextMenu.Content>
        <ContextMenu.Item shortcut="⌘ E" disabled>
          Edit
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
            <ContextMenu.Item shortcut="⌘ ⌫" color="red">
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

  React.useEffect(function () {
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
  }, [bIsMac, store]);

  return (
    <Container>
      <div className="w-64 h-full bg-background border-r flex-col flex">
        {/* 사이드바 콘텐츠 */}
        <div className="flex-1 overflow-y-auto p-4">
          <h3 className="text-sm font-medium text-muted-foreground mb-3 px-2">
            {t("games")}
          </h3>
          <div className="space-y-1">
            {gameManagers.map((manager) => (
              <GameListButton
                key={manager.getGameInfo.gameId}
                gameMgr={manager}
              />
            ))}
          </div>
        </div>
      </div>
    </Container>
  );
});

export default LibraryPage;

export const getStaticProps = makeStaticProperties(["GamesView"]);
export { getStaticPaths };

import GameInstallationCard from "@/components/games/game-installation-card";
import { useGameInstallManager } from "@/lib/GameInstallManagerContext";
import { EInstallState } from "@/lib/types";
import { Button, Flex, Text } from "@radix-ui/themes";
import { Download } from "lucide-react";
import { observer } from "mobx-react-lite";
import { useTranslation } from "next-i18next";
import { useState } from "react";

const DownloadManagerPage = observer(function () {
  const { store } = useGameInstallManager();
  const { t } = useTranslation("GamesView");

  const visibleManagers = Array.from(store.managers.values()).filter(
    (mgr) => mgr.getShowInDownloadDrawer,
  );

  const activeDownloadsCount = visibleManagers.filter(
    (mgr) =>
      mgr.getInstallState === EInstallState.Downloading ||
      mgr.getInstallState === EInstallState.Extracting,
  ).length;
  return (
    <>
      <Flex direction="column" gap="3" p="4">
        {visibleManagers.map((mgr) => (
          <GameInstallationCard
            key={`${mgr.getGameInfo.gameId}-${mgr.getGameInfo.uid}`}
            manager={mgr}
          />
        ))}
        {visibleManagers.length === 0 && (
          <Flex
            align="center"
            justify="center"
            py="8"
            direction="column"
            gap="3"
          >
            <Download size={48} color="var(--gray-8)" />
            <Text color="gray" size="2">
              다운로드 중인 항목이 없습니다.
            </Text>
          </Flex>
        )}
      </Flex>
    </>
  );
});

export default DownloadManagerPage;

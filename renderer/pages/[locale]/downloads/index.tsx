import { getStaticPaths, makeStaticProperties } from "@/lib/get-static";
import GameInstallationCard from "@/components/games/game-installation-card";
import { useGameInstallManager } from "@/lib/GameInstallManagerContext";
import { EInstallState } from "@/lib/types";
import { GameInstallManager } from "@/lib/game-manager";
import { Flex, Text, Card, Progress } from "@radix-ui/themes";
import { Download } from "lucide-react";
import { observer } from "mobx-react-lite";
import { useTranslation } from "next-i18next";
import { useState, useEffect } from "react";
import { BarChart, Bar, ResponsiveContainer, YAxis } from "recharts";

const SpeedChart = observer(({ manager }: { manager: GameInstallManager }) => {
  const MAX_POINTS = 60; // 약 1분간의 기록 (1초 단위 업데이트 가정)
  const [history, setHistory] = useState<{ speed: number }[]>(
    Array(MAX_POINTS).fill({ speed: 0 }),
  );
  const currentSpeed = manager.getDownloadSpeedRealtime;

  useEffect(() => {
    setHistory((prev) => {
      const next = [...prev, { speed: currentSpeed }];
      return next.slice(-MAX_POINTS);
    });
  }, [currentSpeed]);

  // 게임 ID가 변경되면 속도 기록 초기화
  useEffect(() => {
    setHistory(Array(MAX_POINTS).fill({ speed: 0 }));
  }, [manager.getGameInfo.gameId]);

  return (
    <div style={{ width: "100%", height: 80, opacity: 0.8 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={history}
          margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
        >
          <YAxis hide domain={[0, "auto"]} />
          <Bar
            dataKey="speed"
            fill="var(--accent-9)"
            isAnimationActive={false}
            barSize={4}
            radius={[2, 2, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
});

const DownloadManagerPage = observer(function () {
  const { store, queueManager } = useGameInstallManager();
  const { t } = useTranslation("DownloadLibrary");
  const [lastActiveMgr, setLastActiveMgr] = useState<GameInstallManager | null>(
    null,
  );

  const visibleManagers = Array.from(store.managers.values()).filter(
    (mgr) => mgr.getShowInDownloadDrawer,
  );

  const activeMgr = visibleManagers.find(
    (mgr) =>
      mgr.getInstallState === EInstallState.Downloading ||
      mgr.getInstallState === EInstallState.Extracting,
  );
  const queuedGameIds = queueManager.getQueuedGameIds();
  const nextQueuedMgr = queuedGameIds.length
    ? visibleManagers.find((mgr) => mgr.getGameInfo.gameId === queuedGameIds[0])
    : undefined;
  const summaryMgr = activeMgr ?? nextQueuedMgr ?? lastActiveMgr;

  useEffect(() => {
    if (activeMgr) {
      setLastActiveMgr(activeMgr);
    }
  }, [activeMgr]);

  useEffect(() => {
    if (!lastActiveMgr) {
      return;
    }
    const bStillVisible = visibleManagers.some(
      (mgr) => mgr.getGameInfo.gameId === lastActiveMgr.getGameInfo.gameId,
    );
    if (!bStillVisible && !activeMgr && !nextQueuedMgr) {
      setLastActiveMgr(null);
    }
  }, [activeMgr, nextQueuedMgr, lastActiveMgr, visibleManagers]);

  return (
    <Flex direction="column" gap="4" p="4">
      {summaryMgr && (
        <Card variant="surface" style={{ padding: "20px" }}>
          <Flex direction="column" gap="3">
            <Text size="1" color="gray" weight="bold" style={{ opacity: 0.6 }}>
              {activeMgr
                ? activeMgr.getInstallState === EInstallState.Downloading
                  ? t("downloading")
                  : t("installing")
                : nextQueuedMgr
                  ? t("queue")
                  : t("installing")}
            </Text>
            <Text size="5" weight="bold">
              {summaryMgr.getGameTitle}
            </Text>

            <Flex gap="5" align="center" mt="2">
              <div style={{ flex: 1, minWidth: 0 }}>
                {activeMgr || lastActiveMgr ? (
                  <SpeedChart manager={(activeMgr ?? lastActiveMgr)!} />
                ) : (
                  <Flex
                    align="center"
                    justify="center"
                    style={{ width: "100%", height: 80 }}
                  >
                    <Text size="2" color="gray">
                      {t("queued")}
                    </Text>
                  </Flex>
                )}
              </div>
              <Flex
                direction="column"
                gap="2"
                style={{ width: 160, flexShrink: 0 }}
              >
                <Flex direction="column">
                  <Text size="1" color="gray">
                    {t("downloading-spped-current")}
                  </Text>
                  <Text size="4" weight="bold">
                    {activeMgr || lastActiveMgr
                      ? `${(activeMgr ?? lastActiveMgr)!.getDownloadSpeedRealtime} Mbps`
                      : "-"}
                  </Text>
                </Flex>
                <Flex direction="column">
                  <Text size="1" color="gray">
                    {t("downloading-eta")}
                  </Text>
                  <Text size="4" weight="bold">
                    {activeMgr || lastActiveMgr
                      ? (activeMgr ?? lastActiveMgr)!.getDownloadEta
                      : "-"}
                  </Text>
                </Flex>
                <Flex direction="column" gap="1" mt="1">
                  <Flex justify="between">
                    <Text size="1" color="gray">
                      {t("progress")}
                    </Text>
                    <Text size="1" weight="bold">
                      {activeMgr || lastActiveMgr
                        ? `${Math.round((activeMgr ?? lastActiveMgr)!.getDownloadProgress)}%`
                        : "-"}
                    </Text>
                  </Flex>
                  <Progress
                    value={
                      activeMgr || lastActiveMgr
                        ? (activeMgr ?? lastActiveMgr)!.getDownloadProgress
                        : 0
                    }
                  />
                </Flex>
              </Flex>
            </Flex>
          </Flex>
        </Card>
      )}

      <Flex direction="column" gap="3">
        {visibleManagers.map((mgr) => (
          <GameInstallationCard key={mgr.getGameInfo.gameId} manager={mgr} />
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
              {t("queue-empty")}
            </Text>
          </Flex>
        )}
      </Flex>
    </Flex>
  );
});

export default DownloadManagerPage;

export const getStaticProps = makeStaticProperties(["DownloadLibrary"]);
export { getStaticPaths };

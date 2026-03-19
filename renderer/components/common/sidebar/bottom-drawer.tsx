import { useTranslation } from "next-i18next";
import GameInstallationCard from "@/components/games/game-installation-card";
import { Download } from "lucide-react";
import { EInstallState, GameInstallManager } from "@/lib/types";
import { useGameInstallManager } from "@/lib/GameInstallManagerContext";
import {
  Button,
  Text,
  Flex,
  Box,
  ScrollArea,
  Popover,
  IconButton,
  Badge,
} from "@radix-ui/themes";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import LocalizedLink from "../localized-link";

const BottomDrawer = observer(function () {
  const { store } = useGameInstallManager();
  const { t } = useTranslation("GamesView");
  const [open, setOpen] = useState(false);

  const visibleManagers = Array.from(store.managers.values()).filter(
    (mgr) => mgr.getShowInDownloadDrawer,
  );

  const activeDownloadsCount = visibleManagers.filter(
    (mgr) =>
      mgr.getInstallState === EInstallState.Downloading ||
      mgr.getInstallState === EInstallState.Extracting,
  ).length;

  return (
    <Box className="fixed bottom-6 right-6 z-50">
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger>
          <Button
            size="3"
            variant="solid"
            color="gray"
            highContrast
            style={{
              borderRadius: "var(--radius-full)",
              boxShadow: "var(--shadow-4)",
              padding: "0 20px",
              height: "48px",
              cursor: "pointer",
            }}
          >
            <Flex align="center" gap="2">
              <Download size={20} />
              <Text weight="medium">{t("downloads")}</Text>
              {activeDownloadsCount > 0 && (
                <Badge color="blue" variant="solid" radius="full">
                  {activeDownloadsCount}
                </Badge>
              )}
            </Flex>
          </Button>
        </Popover.Trigger>

        <Popover.Content
          side="top"
          align="end"
          sideOffset={16}
          className="apple-blur"
          style={{
            width: "400px",
            padding: 0,
            borderRadius: "var(--radius-4)",
            boxShadow: "var(--shadow-5)",
            overflow: "hidden",
            backgroundColor: "transparent", // Override default popover background to show blur
          }}
        >
          <Flex direction="column" style={{ maxHeight: "60vh" }}>
            <Box p="4" style={{ borderBottom: "1px solid var(--gray-a4)" }}>
              <Text size="4" weight="bold" as="div">
                {t("downloads")}
              </Text>
              <Text size="2" color="gray">
                {t("downloads-desc")}
              </Text>
            </Box>

            <ScrollArea
              type="auto"
              scrollbars="vertical"
              style={{ flexGrow: 1 }}
            >
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
                <Button asChild>
                  <LocalizedLink href="/downloads">전체 화면</LocalizedLink>
                </Button>
              </Flex>
            </ScrollArea>
          </Flex>
        </Popover.Content>
      </Popover.Root>
    </Box>
  );
});

export default BottomDrawer;

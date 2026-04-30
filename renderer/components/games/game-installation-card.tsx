import { useTranslation } from "next-i18next";
import {
  Button,
  Flex,
  Box,
  Text,
  Progress,
  IconButton,
} from "@radix-ui/themes";
import Image from "next/image";
import { EInstallState, GameInstallManager } from "@/lib/types";
import { observer } from "mobx-react-lite";
import { useGameInstallManager } from "@/lib/GameInstallManagerContext";
import { Download, X, Play, Trash2, Pause, Icon } from "lucide-react";
import { useRouter } from "next/router";
import LocalizedLink from "../common/localized-link";
import GameContextMenu from "./game-context-menu";

interface GameInstallationCardProps {
  manager: GameInstallManager;
}

const GameInstallationCard = observer(function ({
  manager,
}: GameInstallationCardProps) {
  const router = useRouter();
  const { bIsMac, store } = useGameInstallManager();
  const {
    t,
    i18n: { language: locale },
  } = useTranslation("GamesView");

  function cancelDownload() {
    if (manager) manager.cancelDownload(window.bitmapApi);
  }

  function pauseDownload() {
    if (manager) manager.pauseDownload(window.bitmapApi);
  }

  function resumeDownload() {
    if (manager) manager.resumeDownload(window.bitmapApi);
  }

  function removeManager() {
    if (manager) store.remove(manager.getGameInfo.gameId);
  }

  function openApp() {
    if (manager) {
      console.log(`Requesting to open ${manager.getGameTitle}`);
      manager.setIsMac = bIsMac;
      manager.openApp(window.bitmapApi);
    } else {
      console.log(`Failed to open. Game install manager is not valid.`);
    }
  }

  function removeApp() {
    if (manager) {
      console.log(`Requesting to remove ${manager.getGameTitle}`);
      manager.setIsMac = bIsMac;
      manager.removeApp(window.bitmapApi);
      removeManager();
    } else {
      console.log(`Failed to remove. Game install manager is not valid.`);
    }
  }

  function openPage() {
    if (router.pathname.includes("downloads")) {
      return `/library?gameId=${manager.getGameInfo.gameId}`;
    }
    return "/downloads";
    // router.push(`/${locale}/library?gameId=${manager.getGameInfo.gameId}`);
  }

  return (
    <GameContextMenu gameMgr={manager} removeCallback={removeManager}>
      <Box
        className="bg-card text-card-foreground shadow-sm relative overflow-hidden"
        style={{
          border: "1px solid var(--gray-a6)",
          borderRadius: "var(--radius-4)",
          padding: "12px",
        }}
      >
        <Flex gap="4" align="center">
          {/* Game Image */}
          <Box
            style={{
              minWidth: "60px",
              height: "85px",
              position: "relative",
              borderRadius: "var(--radius-2)",
              overflow: "hidden",
              boxShadow: "var(--shadow-2)",
            }}
          >
            <LocalizedLink href={openPage()}>
              <Image
                src={manager.getGameImageURL[0] || "/images/unknownImage.png"}
                alt=""
                fill
                className="object-cover"
              />
            </LocalizedLink>
          </Box>

          {/* Content */}
          <Flex
            direction="column"
            className="flex-grow"
            justify="between"
            style={{ minHeight: "85px" }}
          >
            <Flex justify="between" align="start">
              <Box>
                <Text
                  as="div"
                  size="3"
                  weight="bold"
                  style={{ lineHeight: "1.2", marginBottom: "4px" }}
                >
                  {manager.getGameTitle}
                </Text>
                <Text as="div" size="2" color="gray">
                  {manager.getInstallState === EInstallState.Downloading &&
                    t("downloading", {
                      progress: Math.round(manager.getDownloadProgress),
                    })}
                  {manager.getInstallState === EInstallState.Extracting &&
                    t("writing-to-disk", {
                      progress: manager.getExtractProgress,
                    })}
                  {manager.getInstallState === EInstallState.Installed &&
                    t("play")}
                </Text>
              </Box>

              {/* Dismiss Button (Top Right) */}
              <Flex
                gap="2"
                style={{ margin: "-4px -4px 0 0", alignSelf: "center" }}
              >
                {manager.getInstallState === EInstallState.Paused ? (
                  <IconButton
                    size="1"
                    variant="ghost"
                    color="green"
                    onClick={resumeDownload}
                  >
                    <Play size={16} color="green" />
                  </IconButton>
                ) : manager.getInstallState === EInstallState.Downloading ? (
                  <IconButton
                    size="1"
                    variant="ghost"
                    color="gray"
                    onClick={pauseDownload}
                  >
                    <Pause size={16} />
                  </IconButton>
                ) : (
                  <></>
                )}
                <IconButton
                  size="1"
                  variant="ghost"
                  color="red"
                  onClick={cancelDownload}
                >
                  <Trash2 size={16} color="red" />
                </IconButton>
              </Flex>
            </Flex>

            <Box mt="2">
              {/* Progress Bar */}
              {manager.getInstallState !== EInstallState.Installed && (
                <Progress
                  value={
                    manager.getInstallState === EInstallState.Downloading
                      ? Math.round(manager.getDownloadProgress)
                      : manager.getExtractProgress
                  }
                  size="2"
                  style={{ height: "6px" }}
                />
              )}

              {/* Action Buttons for Installed State */}
              {manager.getInstallState === EInstallState.Installed && (
                <Flex gap="2" mt="2">
                  <Button size="2" onClick={openApp} disabled={!manager}>
                    <Play size={16} className="mr-1" />
                    {t("play")}
                  </Button>
                  <Button
                    size="2"
                    variant="soft"
                    color="red"
                    onClick={removeApp}
                    disabled={!manager}
                  >
                    <Trash2 size={16} className="mr-1" />
                    {t("uninstall")}
                  </Button>
                </Flex>
              )}
            </Box>
          </Flex>
        </Flex>
      </Box>
    </GameContextMenu>
  );
});

export default GameInstallationCard;

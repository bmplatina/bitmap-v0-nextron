import { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import { useTranslation } from "next-i18next";
import { Delete, Globe, Play } from "lucide-react";
import { openExternal } from "@/lib/utils-client";
import { EInstallState, GameWithSize, GameInstallManager } from "@/lib/types";
import { Progress } from "@/components/ui/progress";
import AppleLogo from "@/public/images/platforms/platformMac.png";
import Windows10Logo from "@/public/images/platforms/platformWindows10.png";
import { useGameInstallManager } from "@/lib/GameInstallManagerContext";
import { Separator } from "../ui/separator";
import {
  AspectRatio,
  Box,
  Button,
  Checkbox,
  Dialog,
  Flex,
  Text,
} from "@radix-ui/themes";

interface GameInteractableButtonsProps {
  game: GameWithSize;
}

const GameInteractableButtons = observer(function ({
  game,
}: GameInteractableButtonsProps) {
  const { store, bIsMac } = useGameInstallManager();
  const {
    t,
    i18n: { language: locale },
  } = useTranslation("GamesView");

  const [gameInstallManager, setGameInstallManager] =
    useState<GameInstallManager>(() => new GameInstallManager(bIsMac));
  const [bIsCompatible, setIsCompatible] = useState(false);
  const [bCreateShortcut, setCreateShortcut] = useState(true);

  function openExternalLink(e: React.MouseEvent<HTMLAnchorElement>) {
    openExternal(e, window.electronTools);
  }

  function pushNewManager() {
    store.add(gameInstallManager);
  }

  /**
   * Download and Install Game. Call this function directly in your React component.
   */
  async function handleDownloadAndInstall(
    event: React.MouseEvent<HTMLButtonElement>,
  ) {
    event.preventDefault(); // 필요한 경우

    // 다운로드가 시작되면 무조건 BottomDrawer에 표시되도록 설정
    gameInstallManager.setShowInDownloadDrawer = true;

    // 다운로드가 시작되기 전에 store에 등록하여 BottomDrawer에 즉시 표시되도록 함
    pushNewManager();

    try {
      await gameInstallManager.downloadAndInstall(
        window.bitmapApi,
        bCreateShortcut,
      );
    } catch (error: any) {
      console.error("Download and Install Error:", error);
    }
  }

  /**
   * Check Platform compatibility
   */
  function GetIsPlatformCompatible(): boolean {
    if (gameInstallManager) {
      if (bIsMac) {
        console.log(
          `GameInstallManager::PlatformMac: ${gameInstallManager.getPlatformMac}`,
        );
        return !!gameInstallManager.getPlatformMac;
      }

      console.log(
        `GameInstallManager::PlatformWin: ${gameInstallManager.getPlatformWin}`,
      );
      return !!gameInstallManager.getPlatformWin;
    } else {
      console.error(
        "GameInstallManager: 클래스가 Invalid임",
        gameInstallManager,
      );
      return false;
    }
  }

  /**
   * Select the installation directory
   */
  async function selectDirectory() {
    const options: Electron.OpenDialogOptions = {
      title: "Select Installation Directory",
      properties: ["openDirectory"], // 폴더 선택 가능
    };

    try {
      const path = await window.electronTools.showDialog(options);
      console.log("Path selected:", path);
      if (path) {
        gameInstallManager.setInstallationPath = path;
        await window.bitmapApi.setDefaultGameInstallationPath(path); // Bitmap API를 통해 설치 경로 저장
      }
    } catch (error) {
      console.error("파일 선택 중 오류 발생:", error);
    }
  }

  useEffect(function () {
    gameInstallManager.setGameInfo = game;
  }, []);

  useEffect(() => {
    if (gameInstallManager)
      gameInstallManager.pullInstallState(
        window.electronTools,
        window.bitmapApi,
      );
  }, [gameInstallManager.getGameInfo]);

  useEffect(() => {
    // gameInstallManager.setIsMac = bIsMac;
    console.log("Is Mac: ", gameInstallManager.getIsMac);
    setIsCompatible(GetIsPlatformCompatible());
    console.log(`Game Compatibility: ${bIsCompatible ? "Yes" : "No"}`);
  }, [bIsMac]);

  useEffect(
    function () {
      const existingManager = store.managers.get(game.gameId);

      if (existingManager) {
        setGameInstallManager(existingManager);
      }
    },
    [store, game.gameId],
  );

  return (
    <div className="mt-6 space-y-4">
      <Flex direction="column" gap="2">
        {game.gameWebsite && (
          <Button variant="outline" className="w-full" size="3" asChild>
            <a
              onClick={openExternalLink}
              href={game.gameWebsite}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Flex gap="2" align="center" justify="center" width="100%">
                <Globe size={18} />
                <Text size="2" weight="medium">
                  {t("official-website")}
                </Text>
              </Flex>
            </a>
          </Button>
        )}

        {/* When is installed */}
        {gameInstallManager.getInstallState === EInstallState.Installed && (
          <>
            <Button
              size="3"
              className="w-full"
              onClick={() => gameInstallManager.openApp(window.bitmapApi)}
            >
              <Flex gap="2" align="center" justify="center" width="100%">
                <Play size={18} fill="currentColor" />
                <Text size="2" weight="bold">
                  {t("play")}
                </Text>
              </Flex>
            </Button>

            <Button
              size="3"
              variant="soft"
              color="red"
              className="w-full"
              onClick={() => gameInstallManager.removeApp(window.bitmapApi)}
            >
              <Flex gap="2" align="center" justify="center" width="100%">
                <Delete size={18} />
                <Text size="2" weight="medium">
                  {t("uninstall")}
                </Text>
              </Flex>
            </Button>
          </>
        )}
        {/* Install View */}
        {bIsCompatible &&
          gameInstallManager.getInstallState !== EInstallState.Installed && (
            <Dialog.Root>
              <Dialog.Trigger>
                <Button size="3" className="w-full" highContrast color="gray">
                  <Flex gap="2" align="center" justify="center" width="100%">
                    <Image
                      src={bIsMac ? AppleLogo : Windows10Logo}
                      alt={t("download")}
                      className="mr-1"
                      width={18}
                      height={18}
                    />
                    <Text size="2" weight="bold">
                      {t("download")}
                    </Text>
                  </Flex>
                </Button>
              </Dialog.Trigger>
              <Dialog.Content className="apple-blur !bg-transparent border border-black/10 dark:border-white/10 shadow-2xl sm:max-w-[425px] !rounded-2xl !p-6">
                <Flex direction="column" gap="5">
                  <Box>
                    <Text
                      size="5"
                      weight="bold"
                      style={{ letterSpacing: "-0.02em" }}
                      as="div"
                    >
                      {t("installation")}
                    </Text>
                    <Text size="2" color="gray" mt="1" as="div">
                      {t("installing", {
                        gameName: gameInstallManager.getGameTitle,
                      })}
                    </Text>
                  </Box>

                  <Separator />
                  <Flex align="center" justify="between">
                    <Flex align="center">
                      <Image
                        src={
                          gameInstallManager.getGameImageURL[1] ||
                          gameInstallManager.getGameImageURL[0]
                        }
                        width="150"
                        height="85"
                        alt="Game Image"
                        className="object-cover object-top rounded-lg"
                      />
                      <Text size="3" weight="bold" ml="4" as="div">
                        {gameInstallManager.getGameTitle}
                      </Text>
                    </Flex>
                    <Text size="2" color="gray">
                      {game.size[bIsMac ? 1 : 0]} GB
                    </Text>
                  </Flex>
                  <Separator />

                  <Text as="label" size="2">
                    <Flex as="span" gap="2">
                      <Checkbox
                        size="1"
                        checked={bCreateShortcut}
                        onCheckedChange={(checked) =>
                          setCreateShortcut(checked as boolean)
                        }
                        disabled={
                          gameInstallManager.getInstallState ===
                            EInstallState.Downloading ||
                          gameInstallManager.getInstallState ===
                            EInstallState.Extracting
                        }
                      />{" "}
                      {t("add-shortcut")}
                    </Flex>
                  </Text>

                  <Box>
                    <Text as="div" size="2" weight="bold" color="gray" mb="2">
                      {t("installation-path")}
                    </Text>
                    <div
                      onClick={selectDirectory}
                      className="flex items-center gap-3 p-3 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl cursor-pointer hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                    >
                      <Globe
                        size={16}
                        className="text-gray-500 dark:text-gray-400 shrink-0"
                      />
                      <Text size="2" className="truncate flex-grow">
                        {gameInstallManager.getInstallationPath ||
                          t("installation-path-hint")}
                      </Text>
                    </div>
                  </Box>

                  {gameInstallManager.getIsDownloadingOrInstallingState && (
                    <Box className="bg-black/5 dark:bg-white/5 p-4 rounded-xl border border-black/5 dark:border-white/5">
                      <Flex justify="between" mb="2" align="end">
                        <Text size="2" weight="medium">
                          {gameInstallManager.getInstallState ===
                          EInstallState.Downloading
                            ? t("downloading", {
                                progress: Math.round(
                                  gameInstallManager.getDownloadProgress,
                                ),
                              })
                            : gameInstallManager.getInstallState ===
                                EInstallState.Extracting
                              ? t("writing-to-disk", {
                                  progress:
                                    gameInstallManager.getExtractProgress,
                                })
                              : ""}
                        </Text>
                      </Flex>
                      <Progress
                        value={
                          gameInstallManager.getInstallState ===
                          EInstallState.Downloading
                            ? Math.round(gameInstallManager.getDownloadProgress)
                            : gameInstallManager.getExtractProgress
                        }
                        className="h-2"
                      />
                    </Box>
                  )}

                  <Flex gap="3" justify="end" mt="2">
                    <Dialog.Close>
                      <Button
                        variant="soft"
                        color="gray"
                        size="2"
                        style={{ cursor: "pointer" }}
                      >
                        {t("cancel")}
                      </Button>
                    </Dialog.Close>
                    <Button
                      onClick={handleDownloadAndInstall}
                      disabled={
                        gameInstallManager.getInstallState ===
                          EInstallState.Downloading ||
                        gameInstallManager.getInstallState ===
                          EInstallState.Extracting
                      }
                      size="2"
                      variant="solid"
                      color="blue"
                      style={{ cursor: "pointer" }}
                    >
                      {t("install")}
                    </Button>
                  </Flex>
                </Flex>
              </Dialog.Content>
            </Dialog.Root>
          )}
      </Flex>
    </div>
  );
});

export default GameInteractableButtons;

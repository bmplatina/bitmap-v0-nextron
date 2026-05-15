import { EInstallState } from "@/lib/types";
import { GameInstallManager } from "@/lib/game-manager";
import { ContextMenu } from "@radix-ui/themes";
import { observer } from "mobx-react-lite";
import { useTranslation } from "next-i18next";

interface GameContextMenuProps {
  gameMgr: GameInstallManager;
  removeCallback: () => void;
  children: React.ReactNode;
}

const GameContextMenu = observer(function ({
  gameMgr,
  removeCallback,
  children,
}: GameContextMenuProps) {
  const { t } = useTranslation("DownloadLibrary");

  async function removeApp() {
    await gameMgr.removeApp(window.bitmapApi);
    removeCallback();
  }

  async function createShortcut() {
    await gameMgr.createShortcut(window.bitmapApi);
  }

  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger>{children}</ContextMenu.Trigger>
      <ContextMenu.Content>
        {gameMgr.getInstallState === EInstallState.Installed ? (
          <ContextMenu.Item
            color="green"
            onClick={() => gameMgr.openApp(window.bitmapApi)}
          >
            {t("play")}
          </ContextMenu.Item>
        ) : gameMgr.getInstallState === EInstallState.Downloading ? (
          <ContextMenu.Item
            color="red"
            onClick={() => gameMgr.pauseDownload(window.bitmapApi)}
          >
            {t("pause")}
          </ContextMenu.Item>
        ) : gameMgr.getInstallState === EInstallState.Paused ? (
          <ContextMenu.Item
            color="green"
            onClick={() => gameMgr.resumeDownload(window.bitmapApi)}
          >
            {t("resume")}
          </ContextMenu.Item>
        ) : (
          <></>
        )}
        {gameMgr.getInstallState !== EInstallState.Installed &&
          gameMgr.getInstallState !== EInstallState.NotInstalled && (
            <ContextMenu.Item
              color="green"
              onClick={() => gameMgr.cancelDownload(window.bitmapApi)}
            >
              {t("cancel")}
            </ContextMenu.Item>
          )}
        <ContextMenu.Item disabled>{t("add-to-favorites")}</ContextMenu.Item>
        <ContextMenu.Separator />

        <ContextMenu.Sub>
          <ContextMenu.SubTrigger>{t("manage")}</ContextMenu.SubTrigger>
          <ContextMenu.SubContent>
            <ContextMenu.Item
              onClick={createShortcut}
              disabled={gameMgr.getInstallState !== EInstallState.Installed}
            >
              {t("add-shortcut")}
            </ContextMenu.Item>
            <ContextMenu.Item disabled>{t("open-local")}</ContextMenu.Item>
            <ContextMenu.Separator />
            <ContextMenu.Item
              shortcut="⌘ ⌫"
              color="red"
              onClick={removeApp}
              disabled={gameMgr.getInstallState !== EInstallState.Installed}
            >
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

export default GameContextMenu;

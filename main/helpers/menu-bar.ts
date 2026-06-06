import {
  app,
  BrowserWindow,
  nativeImage,
  Menu,
  MenuItemConstructorOptions,
} from "electron";
import { userStore } from "./user-store";
import MenuEn from "./menu-en.json";
import MenuKo from "./menu-ko.json";

const bIsMac: boolean = process.platform === "darwin";

function getIcon(symbol: string) {
  const infoIcon = nativeImage
    .createFromNamedImage(symbol)
    .resize({ width: 16, height: 16 });
  infoIcon.setTemplateImage(true);

  return infoIcon;
}

function createMenu(mainWindow: BrowserWindow): MenuItemConstructorOptions[] {
  const locale = userStore.get("locale");
  const bIsLoggedIn: boolean = userStore.get("token").length > 20;

  const bIsEnglish: boolean = locale !== "ko";
  const t = bIsEnglish ? MenuEn : MenuKo;

  const menu: MenuItemConstructorOptions[] = [
    { role: "fileMenu" },
    { role: "editMenu" },
    // Sidebar
    {
      label: t.Sidebar.label,
      submenu: [
        {
          label: t.Sidebar.back,
          icon: getIcon("arrow.left.circle"),
          accelerator: "CmdOrCtrl+[",
          click: (e) => {
            mainWindow.webContents.send("bitmap-back");
          },
        },
        {
          label: t.Sidebar.search,
          icon: getIcon("magnifyingglass"),
          accelerator: "CmdOrCtrl+F",
          click: (e) => {
            mainWindow.webContents.send("bitmap-search");
          },
        },
        { type: "separator" },
        {
          label: t.Sidebar.home,
          icon: getIcon("house"),
          accelerator: "CmdOrCtrl+1",
          click: (e) => {
            mainWindow.webContents.send("bitmap-home");
          },
        },
        {
          label: t.Sidebar.games,
          icon: getIcon("gamecontroller"),
          accelerator: "CmdOrCtrl+2",
          click: (e) => {
            mainWindow.webContents.send("bitmap-games");
          },
        },
      ],
    },
    // Downloads
    {
      label: t.Downloads.label,
      submenu: [
        {
          label: t.Downloads.manage,
          icon: getIcon("square.and.arrow.down.on.square"),
          accelerator: "CmdOrCtrl+Alt+N",
          id: "newProject",
          click: (e) => {
            mainWindow.webContents.send("bitmap-downloads");
          },
        },
        { type: "separator" },
        {
          label: t.Downloads.library,
          icon: getIcon("sidebar.left"),
          accelerator: "CmdOrCtrl+Alt+N",
          click: (e) => {
            mainWindow.webContents.send("bitmap-library");
          },
        },
      ],
    },
    // Bitmap ID
    {
      label: t.Accounts.label,
      submenu: [
        ...(bIsLoggedIn
          ? // 로그아웃
            ([
              {
                label: t.Accounts.logout,
                icon: getIcon("person.crop.circle.badge.xmark"),
                accelerator: "",
                click: (e) => {
                  mainWindow.webContents.send("bitmap-id-logout");
                },
              },
              { type: "separator" },
              {
                label: t.Accounts.accountSettings,
                icon: getIcon("person.circle"),
                accelerator: "CmdOrCtrl+Alt+N",
                click: (e) => {
                  mainWindow.webContents.send("bitmap-account-settings");
                },
              },
              {
                label: t.Accounts.publisherDashboard,
                icon: getIcon("plus.circle"),
                accelerator: "CmdOrCtrl+Alt+N",
                click: (e) => {
                  mainWindow.webContents.send("bitmap-publisher-dashboard");
                },
              },
            ] as MenuItemConstructorOptions[])
          : // 로그인 및 계정 설정
            ([
              {
                label: t.Accounts.login,
                icon: getIcon("person.crop.circle.badge.plus"),
                accelerator: "",
                click: (e) => {
                  mainWindow.webContents.send("bitmap-id-login");
                },
              },
              { type: "separator" },
              {
                label: t.Accounts.signup,
                icon: getIcon("person.2"),
                accelerator: "",
                click: (e) => {
                  mainWindow.webContents.send("bitmap-id-signup");
                },
              },
            ] as MenuItemConstructorOptions[])),
      ],
    },
    { role: "viewMenu" },
    { role: "windowMenu" },
    { role: "help" },
  ];

  if (bIsMac) {
    menu.unshift({
      label: "Bitmap",
      submenu: [
        {
          label: t.AppMenu.about,
          icon: getIcon("info.circle"),
          click: (e) => {
            mainWindow.webContents.send("bitmap-about");
          },
        },
        { type: "separator" },
        {
          label: t.AppMenu.preferences,
          icon: getIcon("gear"),
          click: (e) => {
            mainWindow.webContents.send("bitmap-settings");
          },
        },
        { type: "separator" },
        { role: "services" as const },
        { type: "separator" },
        { role: "hide" as const },
        { role: "hideOthers" as const },
        { role: "unhide" as const },
        { type: "separator" },
        {
          label: t.AppMenu.quit,
          icon: getIcon("xmark.app"),
          click: (e) => {
            app.exit(0);
          },
        },
      ],
    });
  }

  return menu;
}

function setMenu(window: BrowserWindow) {
  const bitmapMenu = Menu.buildFromTemplate(createMenu(window));
  Menu.setApplicationMenu(bitmapMenu);
}

export default setMenu;

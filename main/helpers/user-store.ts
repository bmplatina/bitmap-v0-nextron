import { app } from "electron";
import Store from "electron-store";

interface Settings {
  token: string;
  screenMode: string;
  locale: string;
  defaultGamePath: string;
}

const defaultGamePath =
  process.platform === "win32"
    ? app.getPath("userData")
    : process.platform === "darwin"
      ? "/Users/Shared/Bitmap Production"
      : "";

export const userStore = new Store<Settings>({
  name: "com.prodbybitmap.esd",
  defaults: {
    token: "",
    screenMode: "auto",
    locale: "en",
    defaultGamePath,
  },
});

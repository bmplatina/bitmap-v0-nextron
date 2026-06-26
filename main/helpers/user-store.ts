import { app } from "electron";
import path from "path";
import Store from "electron-store";

interface Settings {
  token: string;
  screenMode: string;
  locale: string;
  defaultGamePath: string;
  isFirstRun: boolean;
}

const defaultGamePath =
  process.platform === "win32"
    ? path.join(path.dirname(app.getPath("exe")), "BitmapApps")
    : process.platform === "darwin"
      ? "/Users/Shared/Bitmap Production"
      : "";

export const userStore = new Store<Settings>({
  name: "com.prodbybitmap.esd",
  defaults: {
    token: "",
    screenMode: "system",
    locale: "en",
    defaultGamePath,
    isFirstRun: true,
  },
});

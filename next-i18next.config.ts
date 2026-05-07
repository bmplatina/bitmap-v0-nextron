import path from "path";
import { UserConfig } from "next-i18next";

const config: UserConfig = {
  i18n: {
    defaultLocale: "en",
    locales: ["ko", "en"],
  },
  debug: false,
  reloadOnPrerender: process.env.NODE_ENV === "development",
  localePath:
    typeof window === "undefined"
      ? path.resolve("./renderer/public/locales")
      : "/locales",
  // react: {
  //   useSuspense: true,
  // },
};

export default config;

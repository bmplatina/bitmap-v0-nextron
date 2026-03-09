const path = require("path");

/** @type {import('next-i18next').UserConfig} */
const config = {
  i18n: {
    defaultLocale: "en",
    locales: ["ko", "en"],
  },
  debug: process.env.NODE_ENV === "development",
  reloadOnPrerender: process.env.NODE_ENV === "development",
  localePath:
    typeof window === "undefined"
      ? path.resolve("./renderer/public/locales")
      : "/locales",
  // react: {
  //   useSuspense: true,
  // },
};

module.exports = config;

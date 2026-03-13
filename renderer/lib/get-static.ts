import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import i18next from "../../next-i18next.config";

type i18nNamespaces =
  | "About"
  | "AccountEdit"
  | "AccountPermissions"
  | "AccountTabs"
  | "Admin"
  | "Authentication"
  | "BitmapApp"
  | "BitmapDeveloper"
  | "BitmapTeammate"
  | "common"
  | "Footer"
  | "GameSubmit"
  | "GamesView"
  | "MainPage"
  | "Notifications"
  | "Publish"
  | "Settings"
  | "Sidebar";

export function getI18nPaths() {
  return ["en", "ko"].map((locale) => ({
    params: {
      locale,
    },
  }));
}

export function getStaticPaths() {
  return {
    fallback: false,
    paths: getI18nPaths(),
  };
}

export async function getI18nProperties(
  context: any,
  namespaces: i18nNamespaces[] = ["common"],
) {
  const locale =
    context?.locale ??
    context?.params?.locale ??
    context?.query?.locale ??
    i18next.i18n.defaultLocale;
  return {
    ...(await serverSideTranslations(locale, namespaces, i18next)),
  };
}

export function makeStaticProperties(namespaces: i18nNamespaces[] = []) {
  const commonNamespaces: i18nNamespaces[] = [
    ...namespaces,
    "About",
    "Authentication",
    "GamesView",
    "Sidebar",
    "common",
    "Footer",
    "Settings",
  ];
  return async function (context: any) {
    return {
      props: await getI18nProperties(context, commonNamespaces),
    };
  };
}

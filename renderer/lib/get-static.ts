import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import i18next from "../../next-i18next.config";

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
  namespaces: string[] = ["common"],
) {
  const locale = context?.params?.locale ?? i18next.i18n.defaultLocale;
  return {
    ...(await serverSideTranslations(locale, namespaces, i18next)),
  };
}

export function makeStaticProperties(namespaces: string[] = []) {
  return async function (context: any) {
    return {
      props: await getI18nProperties(context, namespaces),
    };
  };
}

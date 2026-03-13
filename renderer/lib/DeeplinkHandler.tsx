import { useRouter } from "next/router";
import { startTransition, useEffect } from "react";
import { useTranslation } from "next-i18next";

export default function DeeplinkHandler() {
  const router = useRouter();
  const {
    i18n: { language: locale },
  } = useTranslation();

  useEffect(() => {
    if (!router.isReady) return;

    let isMounted = true;

    // React의 Suspense hydration 완료를 보장하기 위해 약간의 지연(setTimeout)을 사용합니다.
    const initTimer = setTimeout(() => {
      window.deeplink.onLauncherUrl((uri: string) => {
        if (!isMounted) return;

        const substring = uri.split("bitmap://")[1] || uri.split("//")[1];
        if (!substring) return;

        console.log(`Redirecting to /${locale}/${substring}`);
        startTransition(() => {
          router.push(`/${locale}/${substring}`);
        });
      });

      window.deeplink.setWindowIsReady(true);
    }, 100);

    return () => {
      isMounted = false;
      clearTimeout(initTimer);
    };
  }, [locale, router.isReady, router]);

  return null;
}

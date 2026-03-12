import { useRouter } from "next/router";
import { startTransition, useEffect, useState } from "react";
import { useTranslation } from "next-i18next";
import { useAuth } from "./AuthContext";

export default function DeeplinkHandler() {
  const router = useRouter();
  const {
    i18n: { language: locale },
  } = useTranslation();
  const { login } = useAuth();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || !router.isReady) return;

    (async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { deeplink } = window;

      deeplink.onLauncherUrl((uri: string) => {
        // const formattedUrl = launcherUrl.startsWith('/') ? launcherUrl : `/${launcherUrl}`;
        // launcherUrl.split("//")[1]
        const substring = uri.split("bitmap://")[1];
        // 게임 페이지 리디렉션 bitmap://games/${id}
        if (substring.startsWith("games")) {
          startTransition(() => {
            router.push(
              `/${locale}/games/detail?id=${substring.split("/")[1]}`,
            );
          });
        }
        // 토큰을 받았다면 로그인 bitmap://token/${token}
        else if (substring.startsWith("token")) {
          startTransition(() => {
            login(substring.split("/")[1]);
          });
        } else {
          console.log(`Redirecting to /${locale}/${substring}`);
          startTransition(() => {
            router.push(`/${locale}/${substring}`);
          });
        }
      });
      deeplink.setWindowIsReady(true);
    })();
  }, [locale, router, isMounted]);

  return null;
}

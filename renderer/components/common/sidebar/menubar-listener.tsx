import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { openExternalByUri } from "@/lib/utils-client";
import { useAuth } from "@/lib/AuthContext";

export default function MenuBarListener() {
  const router = useRouter();
  const {
    i18n: { language: locale },
  } = useTranslation();
  const { logout } = useAuth();

  function openExternal(uri: string) {
    openExternalByUri(uri, window.electronTools);
  }

  const [jwtToken, setJwtToken] = useState<string>("");

  async function getToken() {
    const token = await window.bitmapApi.getToken();
    setJwtToken(token);
  }

  useEffect(
    function () {
      getToken();

      // 홈 메뉴 클릭 시
      const unsubscribeHome = window.electronTools.onOpenHome(() => {
        router.push(`/${locale}/`);
      });
      // 홈 메뉴 클릭 시
      const unsubscribeGames = window.electronTools.onOpenGames(() => {
        router.push(`/${locale}/games`);
      });

      // 다운로드 메뉴 클릭 시
      const unsubscribeDownloads = window.electronTools.onOpenDownloads(() => {
        router.push(`/${locale}/downloads`);
      });
      // 라이브러리 메뉴 클릭 시
      const unsubscribeLibrary = window.electronTools.onOpenLibrary(() => {
        router.push(`/${locale}/library`);
      });

      // 로그아웃 메뉴 클릭 시
      const unsubscribeLogout = window.electronTools.onLogout(() => {
        console.log("로그아웃 메뉴 클릭");
        logout();
      });
      // 계정 설정 메뉴 클릭 시
      const unsubscribeAccountSettings =
        window.electronTools.onOpenAccountSettings(async () => {
          openExternal(
            `https://prodbybitmap.com/${locale}/account?token=${jwtToken}`,
          );
        });
      // 퍼블리셔 대시보드 메뉴 클릭 시
      const unsubscribePublisherDashboard =
        window.electronTools.onOpenPublisherDashboard(() => {
          openExternal(
            `https://prodbybitmap.com/${locale}/publish?token=${jwtToken}`,
          );
        });
      // 로그인 메뉴 클릭 시
      const unsubscribeLogin = window.electronTools.onLogin(() => {
        router.push(`/${locale}/auth`);
      });
      // 가입 메뉴 클릭 시
      const unsubscribeSignup = window.electronTools.onSignup(() => {
        openExternal(`https://prodbybitmap.com/${locale}/auth/signup`);
      });

      // 환경설정 메뉴 클릭 시
      const unsubscribeSettings = window.electronTools.onOpenSettings(() => {
        router.push(`/${locale}/settings`);
      });

      // 컴포넌트 언마운트 시 리스너 해제 (메모리 누수 방지)
      return () => {
        unsubscribeHome();
        unsubscribeGames();

        unsubscribeDownloads();
        unsubscribeLibrary();

        unsubscribeLogout();
        unsubscribeAccountSettings();
        unsubscribePublisherDashboard();
        unsubscribeLogin();
        unsubscribeSignup();

        unsubscribeSettings();
      };
    },

    [router],
  );

  return null;
}

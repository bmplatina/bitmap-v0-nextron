import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { openExternalByUri } from "@/lib/utils-client";
import { useAuth } from "@/lib/AuthContext";
import { Button, Dialog, Flex, Text } from "@radix-ui/themes";
import { pretendard } from "@/lib/utils";
import About from "../about";

export default function MenuBarListener() {
  const router = useRouter();
  const {
    i18n: { language: locale },
  } = useTranslation();
  const { logout } = useAuth();

  const [bIsAboutOpen, setIsAboutOpen] = useState<boolean>(false);
  const [appVersion, setAppVersion] = useState<string>("");
  const [jwtToken, setJwtToken] = useState<string>("");

  function openExternal(uri: string) {
    openExternalByUri(uri, window.electronTools);
  }

  async function getAppVersion() {
    const ver = await window.electronTools.getAppVersion();
    setAppVersion(ver);
  }

  async function getToken() {
    const token = await window.bitmapApi.getToken();
    setJwtToken(token);
  }

  useEffect(
    function () {
      getToken();
      getAppVersion();

      // Bitmap App 정보 클릭 시
      const unsubscribeAbout = window.electronTools.onOpenAbout(() => {
        console.log("About");
        setIsAboutOpen(true);
      });

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
        unsubscribeAbout();

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

    [],
  );

  return (
    <Dialog.Root open={bIsAboutOpen} onOpenChange={setIsAboutOpen}>
      <Dialog.Content maxWidth="800px" className={pretendard.className}>
        <Dialog.Title>
          <Text className={pretendard.className} weight="bold">
            Bitmap App™
          </Text>
        </Dialog.Title>
        <Dialog.Description>
          <Text className={pretendard.className} weight="medium">
            Version {appVersion}
          </Text>
        </Dialog.Description>

        <About />

        <Flex gap="3" mt="4" justify="end">
          <Dialog.Close>
            <Button variant="soft" color="gray">
              <div className={pretendard.className}>Close</div>
            </Button>
          </Dialog.Close>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}

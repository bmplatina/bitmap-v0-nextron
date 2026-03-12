import { Fragment, startTransition, useEffect, useState } from "react";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import { ScrollArea, Theme } from "@radix-ui/themes";
import { ThemeProvider } from "@/components/common/theme-provider";
import Sidebar from "@/components/common/sidebar/sidebar";
import TopBar from "@/components/common/sidebar/top-bar";
import Footer from "@/components/common/footer";
import BottomDrawer from "@/components/common/sidebar/bottom-drawer";
import { AuthProvider } from "@/lib/AuthContext";
import NextToploader from "nextjs-toploader";
import "./globals.css";
import "@radix-ui/themes/styles.css";
import TokenHandler from "@/components/common/token-handler";
import { appWithTranslation } from "next-i18next";
import nextI18NextConfig from "../../next-i18next.config";
import { pretendard } from "@/lib/utils";
import { useTranslation } from "next-i18next";
import { GameInstallManagerProvider } from "@/lib/GameInstallManagerContext";

function RootLayout({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const {
    i18n: { language: locale },
  } = useTranslation();

  const [bIsMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    (async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { deeplink } = window;

      deeplink.onLauncherUrl((uri: string) => {
        // const formattedUrl = launcherUrl.startsWith('/') ? launcherUrl : `/${launcherUrl}`;
        // launcherUrl.split("//")[1]
        const substring = uri.split("//")[1];
        if (substring.startsWith("games")) {
          startTransition(() => {
            router.push(
              `/${locale}/games/detail?id=${substring.split("/")[1]}`,
            );
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
  }, [locale, router]);

  if (!bIsMounted) {
    return null;
  }

  return (
    <Fragment>
      <GameInstallManagerProvider>
        <NextToploader showSpinner={false} />
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Theme>
              <div
                className={`${pretendard.variable} font-pretendard font-sans antialiased`}
              >
                <div className="flex flex-col h-screen overflow-hidden">
                  <div className="sticky top-0 z-50 w-full">
                    <TokenHandler />
                    <TopBar />
                  </div>
                  <div className="flex flex-1 min-h-0">
                    <aside className="sticky top-12 h-[calc(100vh-48px)] hidden md:block self-start z-30">
                      <Sidebar />
                    </aside>
                    <ScrollArea className="flex-1 w-full h-[calc(100vh-48px)]">
                      <main className="w-full pb-10">
                        <Component {...pageProps} />
                        <Footer />
                        <BottomDrawer />
                      </main>
                    </ScrollArea>
                  </div>
                </div>
              </div>
              {/* 클라이언트 사이드 로직(토큰 처리)은 별도 컴포넌트로 유지 */}
            </Theme>
          </ThemeProvider>
        </AuthProvider>
      </GameInstallManagerProvider>
    </Fragment>
  );
}

export default appWithTranslation(RootLayout, nextI18NextConfig);

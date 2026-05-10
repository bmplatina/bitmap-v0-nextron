import { Fragment, useEffect, useState } from "react";
import type { AppProps } from "next/app";
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
import LoginSplash from "@/components/common/login-splash";
import TokenHandler from "@/components/common/token-handler";
import { appWithTranslation } from "next-i18next";
import nextI18NextConfig from "../../next-i18next.config";
import { cn, pretendard } from "@/lib/utils";
import {
  getDownloadCacheSize,
  removeDownloadCache,
  formatBytesToGB,
} from "@/lib/utils-client";
import { GameInstallManagerProvider } from "@/lib/GameInstallManagerContext";
import DeeplinkHandler from "@/lib/DeeplinkHandler";
import { useRouter } from "next/router";

function RootLayout({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [cacheSize, setCacheSize] = useState<number>(0);
  const [bIsMounted, setIsMounted] = useState(false);
  const showMainSidebar = router.query.sidebar === "main";
  const useLibrarySidebarOffset =
    router.pathname.includes("/library") && !showMainSidebar;

  async function autoPurgeDesyncCache() {
    const size = await getDownloadCacheSize(window.bitmapApi);
    setCacheSize(size);
    if (formatBytesToGB(cacheSize) > 7.5) {
      await removeDownloadCache(window.bitmapApi, setCacheSize);
    }
  }

  useEffect(() => {
    setIsMounted(true);
    autoPurgeDesyncCache();
  }, []);

  if (!bIsMounted) {
    return null;
  }

  return (
    <Fragment>
      <GameInstallManagerProvider>
        <NextToploader showSpinner={false} />
        <AuthProvider>
          <DeeplinkHandler />
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
                <LoginSplash />
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
                      <main
                        className={cn(
                          "w-full pb-10",
                          useLibrarySidebarOffset && "md:pl-64",
                        )}
                      >
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

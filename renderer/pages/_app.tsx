import React from "react";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import { Provider } from "react-redux";
import { setIsMac } from "../lib/slices/platform-slice";
import { Theme } from "@radix-ui/themes";
import { store } from "../lib/store";
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

function RootLayout({ Component, pageProps }: AppProps) {
  let [launcherUrl, setLauncherUrl] = React.useState("");
  const router = useRouter();

  React.useEffect(() => {
    (async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { deeplink } = window;

      deeplink.onLauncherUrl((url: string) => {
        setLauncherUrl(url);
        if (launcherUrl) {
          // const formattedUrl = launcherUrl.startsWith('/') ? launcherUrl : `/${launcherUrl}`;
          // launcherUrl.split("//")[1]
          console.log(`Redirecting to ${launcherUrl.split("//")[1]}`);
          router.push(launcherUrl.split("//")[1]);
        }
      });
      deeplink.setWindowIsReady(true);
    })();
  }, [launcherUrl, router]);

  return (
    <Provider store={store}>
      <React.Fragment>
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
                <div className="flex flex-col min-h-screen">
                  <div className="sticky top-0 z-50 w-full">
                    <TokenHandler />
                    <TopBar />
                  </div>
                  <div className="flex flex-1">
                    <aside className="sticky top-12 h-[calc(100vh-48px)] hidden md:block self-start z-30">
                      <Sidebar />
                    </aside>
                    <main className="flex-1 w-full pb-10">
                      <Component {...pageProps} />
                      <Footer />
                      <BottomDrawer />
                    </main>
                  </div>
                </div>
              </div>
              {/* 클라이언트 사이드 로직(토큰 처리)은 별도 컴포넌트로 유지 */}
            </Theme>
          </ThemeProvider>
        </AuthProvider>
      </React.Fragment>
    </Provider>
  );
}

export default appWithTranslation(RootLayout, nextI18NextConfig);

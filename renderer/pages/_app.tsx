import React from 'react'
import type { AppProps } from "next/app";
import { Inter } from "next/font/google";
import { useRouter } from 'next/router';
import { Provider } from 'react-redux';
import { setIsMac } from '../lib/slices/platform-slice';
import { store } from '../lib/store';
import "../styles/globals.css";
import { ThemeProvider } from "../components/theme-provider";
import Sidebar from "../components/sidebar";
import TopBar from "../components/top-bar";
import BottomDrawer from "../components/bottom-drawer";

const inter = Inter({ subsets: ["latin"] });

export default function MyApp({ Component, pageProps }: AppProps) {
    let [launcherUrl, setLauncherUrl] = React.useState('');
    const router = useRouter();

    React.useEffect(() => {
        ;(async () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { deeplink } = window as any;

            deeplink.onLauncherUrl((url: string) => {
                setLauncherUrl(url);
                if(launcherUrl)
                {
                    // const formattedUrl = launcherUrl.startsWith('/') ? launcherUrl : `/${launcherUrl}`;
                    // launcherUrl.split("//")[1]
                    console.log(`Redirecting to ${launcherUrl.split("//")[1]}`);
                    router.push(launcherUrl.split("//")[1]);
                }
            })
            deeplink.setWindowIsReady(true);
        })();
    }, [launcherUrl, router]);

    return (
        <Provider store={store}>
            <React.Fragment>
                <div className={inter.className}>
                    <ThemeProvider
                        attribute="class"
                        defaultTheme="system"
                        enableSystem
                        disableTransitionOnChange
                    >
                        <div className="flex flex-col h-screen">
                            <TopBar />
                            <div className="flex flex-1 overflow-hidden">
                                <Sidebar />
                                <main className="flex-1 overflow-auto">
                                    <Component {...pageProps} />
                                    <BottomDrawer/>
                                </main>
                            </div>
                        </div>
                    </ThemeProvider>
                </div>
            </React.Fragment>
        </Provider>
    );
}

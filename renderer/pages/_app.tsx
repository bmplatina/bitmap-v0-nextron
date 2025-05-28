import React from 'react'
import type { AppProps } from "next/app";
import { Inter } from "next/font/google";
import { useRouter } from 'next/router'
import "../styles/globals.css";
import { ThemeProvider } from "../components/theme-provider";
import Sidebar from "../components/sidebar";
import TopBar from "../components/top-bar";

const inter = Inter({ subsets: ["latin"] });

export default function MyApp({ Component, pageProps }: AppProps) {
    // const [launcherUrl, setLauncherUrl] = React.useState('');
    // const router = useRouter();
    //
    // React.useEffect(() => {
    //     ;(async () => {
    //         // eslint-disable-next-line @typescript-eslint/no-explicit-any
    //         const { api } = window as any;
    //
    //         api.onLauncherUrl((url: string) => {
    //             setLauncherUrl(url);
    //         })
    //
    //         api.setWindowIsReady(true);
    //     })();
    //
    //     if(launcherUrl)
    //     {
    //         const formattedUrl = launcherUrl.startsWith('/') ? launcherUrl : `/${launcherUrl}`;
    //         router.push(formattedUrl);
    //     }
    // }, [launcherUrl, router]);

    return (
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
                            </main>
                        </div>
                    </div>
                </ThemeProvider>
            </div>
        </React.Fragment>
    );
}

import type { AppProps } from "next/app";
import { Inter } from "next/font/google";
import "../styles/globals.css";
import { ThemeProvider } from "../components/theme-provider";
import Sidebar from "../components/sidebar";
import TopBar from "../components/top-bar";

const inter = Inter({ subsets: ["latin"] });

export default function MyApp({ Component, pageProps }: AppProps) {
    return (
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
    );
}

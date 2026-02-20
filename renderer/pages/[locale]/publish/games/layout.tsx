import type React from "react";
import { GamePublishProvider } from "@/lib/GamePublishContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <GamePublishProvider>{children}</GamePublishProvider>;
}

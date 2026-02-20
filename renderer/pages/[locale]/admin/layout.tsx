"use client";

import type React from "react";
import { useEffect } from "react";
import { TabNav } from "@radix-ui/themes";
import { useTranslation } from "next-i18next";
import { Link, usePathname, useRouter } from "next/router";
import { useAuth } from "@/lib/AuthContext";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { t } = useTranslation("Admin");
  const pathname = usePathname();
  const router = useRouter();
  const { isLoading, bIsAdmin } = useAuth();

  useEffect(
    function () {
      if (!isLoading) {
        if (!bIsAdmin) router.push("/account/permissions");
      }
    },
    [isLoading, bIsAdmin],
  );

  return (
    <>
      <TabNav.Root className="sticky top-0 z-10 bg-background border-b-0">
        <TabNav.Link asChild active={pathname === "/admin"}>
          <Link href="/admin">{t("dashboard")}</Link>
        </TabNav.Link>
        <TabNav.Link asChild active={pathname.startsWith("/admin/members")}>
          <Link href="/admin/members">{t("member-manage")}</Link>
        </TabNav.Link>
        <TabNav.Link asChild active={pathname === "/admin/developer"}>
          <Link href="/admin/developer">{t("bitmap-developer")}</Link>
        </TabNav.Link>
      </TabNav.Root>
      {bIsAdmin && children}
    </>
  );
}

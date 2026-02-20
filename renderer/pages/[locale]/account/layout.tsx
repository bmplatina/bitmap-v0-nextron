"use client";

import type React from "react";
import { useEffect } from "react";
import { TabNav } from "@radix-ui/themes";
import { useTranslation } from "next-i18next";
import { Link, usePathname, useRouter } from "next/router";
import { useAuth } from "@/lib/AuthContext";
import EmailVerificationDialog from "@/components/accounts/email-verification";

export default function AccountLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { t } = useTranslation("AccountTabs");
  const pathname = usePathname();
  const router = useRouter();
  const { isLoading, bIsLoggedIn, bIsEmailVerified } = useAuth();

  useEffect(
    function () {
      if (!isLoading) {
        if (!bIsLoggedIn) router.push("/auth");
      }
    },
    [isLoading, bIsLoggedIn],
  );

  return (
    <>
      <EmailVerificationDialog open={!bIsEmailVerified} />
      <TabNav.Root className="sticky top-0 z-10 bg-background border-b-0">
        <TabNav.Link asChild active={pathname === "/account"}>
          <Link href="/account">{t("profile")}</Link>
        </TabNav.Link>
        <TabNav.Link
          asChild
          active={pathname.startsWith("/account/personal-info")}
        >
          <Link href="/account/personal-info">{t("personal-info")}</Link>
        </TabNav.Link>
        <TabNav.Link asChild active={pathname.startsWith("/account/security")}>
          <Link href="/account/security">{t("security-login")}</Link>
        </TabNav.Link>
        <TabNav.Link
          asChild
          active={pathname.startsWith("/account/permissions")}
        >
          <Link href="/account/permissions">{t("permissions")}</Link>
        </TabNav.Link>
        <TabNav.Link asChild active={pathname === "/account/settings"}>
          <Link href="/account/settings">{t("settings")}</Link>
        </TabNav.Link>
      </TabNav.Root>
      {bIsLoggedIn && children}
    </>
  );
}

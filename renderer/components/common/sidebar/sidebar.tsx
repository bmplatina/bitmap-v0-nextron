import LocalizedLink from "@/components/common/localized-link";
import { useRouter } from "next/router";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/AuthContext";
import { sidebarItems } from "@/lib/sidebar-items";
import { useTranslation } from "next-i18next";
import LanguageSwitcher from "./language-changer";
import React from "react";
import { openExternal } from "@/lib/utils-client";

export default function Sidebar() {
  const router = useRouter();
  const { bIsLoggedIn, bIsDeveloper, bIsTeammate, bIsAdmin } = useAuth();
  const { i18n, t } = useTranslation("Sidebar");

  const locale = (router.query.locale as string) || i18n.language || "en";

  function openExternalLink(event: React.MouseEvent<HTMLAnchorElement>) {
    openExternal(event, window.electronTools);
  }

  function getPathName(): string {
    const pathName = router.asPath.split(locale)[1];
    if (pathName.length === 1) return "/";
    else if (pathName.includes("games")) return "/games";

    return pathName.endsWith("/") ? pathName.slice(0, -1) : pathName;
  }

  React.useEffect(() => {
    console.log("Locale (ready): ", locale, getPathName());
  }, [locale, router.asPath]);

  return (
    <div className="w-64 h-full bg-background border-r flex-col hidden md:flex">
      {/* 사이드바 콘텐츠 */}
      <div className="flex-1 overflow-y-auto p-4">
        {sidebarItems.map((section) => {
          // 섹션 레벨 권한 체크
          if (section.bRequire === "login" && !bIsLoggedIn) return null;
          if (section.bRequire === "developer" && !bIsDeveloper) return null;
          if (section.bRequire === "teammate" && !bIsTeammate) return null;

          return (
            <div key={section.title} className="mb-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-3 px-2">
                {t(section.title)}
              </h3>
              <div className="space-y-1">
                {section.items.map((item) => {
                  // 아이템 레벨 권한 체크
                  if (item.bRequire === "login" && !bIsLoggedIn) return null;
                  if (item.bRequire === "developer" && !bIsDeveloper)
                    return null;
                  if (item.bRequire === "teammate" && !bIsTeammate) return null;

                  return (
                    <LocalizedLink
                      onClick={
                        item.href.startsWith("http")
                          ? openExternalLink
                          : undefined
                      }
                      key={item.title}
                      href={item.href}
                      target={
                        item.href.startsWith("http") ? "_blank" : undefined
                      }
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                        getPathName() === item.href
                          ? "bg-accent text-accent-foreground"
                          : "text-muted-foreground",
                      )}
                    >
                      {item.icon}
                      {t(item.title)}
                    </LocalizedLink>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      <div className="p-4 border-t">
        <LanguageSwitcher />
      </div>
    </div>
  );
}

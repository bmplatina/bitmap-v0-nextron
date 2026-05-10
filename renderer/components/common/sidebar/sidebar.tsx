import LocalizedLink from "@/components/common/localized-link";
import { useRouter } from "next/router";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/AuthContext";
import { sidebarItems } from "@/lib/sidebar-items";
import { useTranslation } from "next-i18next";
import { Text } from "@radix-ui/themes";
import React from "react";
import { openExternal } from "@/lib/utils-client";

export default function Sidebar() {
  const { bIsLoggedIn, bIsDeveloper, bIsTeammate, bIsAdmin } = useAuth();
  const { t } = useTranslation("Sidebar");
  const router = useRouter();
  // 현재 경로에서 /[locale] 부분을 제거하여 "/games", "/settings" 등 베이스 경로만 추출

  const showMainSidebar = router.query.sidebar === "main";
  const bIsLibraryPage = router.pathname.includes("/library");
  const currentPath =
    router.pathname === "/[locale]"
      ? "/"
      : router.pathname.replace("/[locale]", "") || "/";

  function openExternalLink(event: React.MouseEvent<HTMLAnchorElement>) {
    openExternal(event, window.electronTools);
  }

  React.useEffect(() => {
    console.log("Current Base Path: ", currentPath);
  }, [currentPath]);

  if (bIsLibraryPage && !showMainSidebar) {
    return null;
  }

  return (
    <div className="w-64 h-full bg-background border-r flex-col hidden md:flex">
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

                  // 활성 상태 확인 로직
                  // 1. 홈("/")은 정확히 일치할 때만
                  // 2. 다른 메뉴는 해당 경로로 시작할 때 하이라이트 (예: /games/detail 도 /games 하이라이트)
                  const isActive =
                    item.href === "/"
                      ? currentPath === "/"
                      : currentPath.startsWith(item.href);

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
                        isActive
                          ? "bg-accent text-accent-foreground font-medium"
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
    </div>
  );
}

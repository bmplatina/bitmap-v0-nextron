"use client";

import Link from "next/link";
import { usePathname } from "next/router";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/AuthContext";
import { sidebarItems } from "@/lib/sidebar-items";
import { useTranslation } from "next-i18next";
import LanguageSwitcher from "./language-changer";

interface MobileSidebarProps {
  onItemClick?: () => void;
}

export function MobileSidebar({ onItemClick }: MobileSidebarProps) {
  const pathname = usePathname();
  const { bIsLoggedIn, bIsDeveloper, bIsTeammate } = useAuth();
  const { t } = useTranslation("Sidebar");

  const handleItemClick = () => {
    if (onItemClick) {
      onItemClick();
    }
  };

  return (
    <>
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
                    <Link
                      key={item.title}
                      href={item.href}
                      onClick={handleItemClick}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                        pathname === item.href
                          ? "bg-accent text-accent-foreground"
                          : "text-muted-foreground",
                      )}
                    >
                      {item.icon}
                      {t(item.title)}
                    </Link>
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
    </>
  );
}

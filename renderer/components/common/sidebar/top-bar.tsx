"use client";

import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { Bell, BellDot, Search as SearchIcon, Menu, X } from "lucide-react";
import { useRouter } from "next/router";
import LocalizedLink from "@/components/common/localized-link";
import { imageUriRegExp } from "@/lib/utils";
import Image from "next/image";
import { useTranslation } from "next-i18next";
import {
  Avatar,
  Button,
  Flex,
  IconButton,
  Popover,
  Spinner,
} from "@radix-ui/themes";
import { ProfilePopover } from "@/components/accounts/profile";
import { useAuth } from "@/lib/AuthContext";
import NotificationCenter from "./notification-center";
import UpdateOverlay from "@/components/common/sidebar/update-overlay";
import Search from "@/components/common/search/search";
import { useGameInstallManager } from "@/lib/GameInstallManagerContext";
import BitmapLogoBMP from "@/public/images/bitmap_bmp.png";

export default function TopBar() {
  const router = useRouter();
  const { t } = useTranslation("common");
  const { bIsMac } = useGameInstallManager();
  const { bIsLoggedIn, username, isLoading, avatarUri } = useAuth();
  // Electron 및 MacOS 환경 감지 변수 (실제 감지 코드는 구현하지 않음)
  const [titleTransform, setTitleTransform] =
    useState<string>("translateX(80px)");

  // 프로필 팝오버 상태 관리
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  // 스크롤 상태 관리
  const [isScrolled, setIsScrolled] = useState(false);

  const handleFullscreenChange = (newFullscreenState: boolean) => {
    if (!bIsMac) return;
    console.log("fullscreen state changed:", newFullscreenState);
    setTitleTransform(
      !newFullscreenState ? "translateX(80px)" : "translateX(0px)",
    );
  };

  // 스크롤 감지
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    window.electronTools.onFullscreenChange(handleFullscreenChange);

    // 컴포넌트 언마운트 시 리스너 제거
    return () => {
      window.electronTools.removeFullscreenListener();
    };
  }, [handleFullscreenChange]);

  // 라우트 변경 시 팝오버 및 사이드바 닫기
  useEffect(() => {
    setIsProfileOpen(false);
  }, [router.pathname]);

  function getIsSigninButtonActive(): boolean {
    const authPageRegExp: RegExp = /^\/auth/;
    return !authPageRegExp.test(router.pathname) && !bIsLoggedIn;
  }

  const electronDragCss: React.CSSProperties & { WebkitAppRegion?: string } = {
    WebkitAppRegion: "drag",
  };

  const electronNoDragCss: React.CSSProperties & { WebkitAppRegion?: string } =
    {
      WebkitAppRegion: "none",
    };

  return (
    <>
      <div
        className={`h-12 border-b flex items-center px-4 w-full relative z-50 transition-all duration-300 ${
          isScrolled ? "border-border/50" : "bg-background border-border"
        }`}
        style={
          isScrolled
            ? {
                WebkitBackdropFilter: "saturate(180%) blur(20px)",
                backdropFilter: "saturate(180%) blur(20px)",
                backgroundColor: "var(--topbar-bg, rgba(255, 255, 255, 0.72))",
                ...electronDragCss,
              }
            : electronDragCss
        }
      >
        {/* 로고 이미지 */}
        <LocalizedLink
          href="/"
          className="flex items-center"
          style={{
            ...electronNoDragCss,
            transform: titleTransform,
            willChange: "transform",
            transition: "transform 0.5s ease 0.05s",
            mixBlendMode: "difference",
          }}
        >
          <Image
            src={BitmapLogoBMP}
            alt="Bitmap"
            width={120}
            height={32}
            className="h-8 w-auto cursor-pointer hover:opacity-80 transition-opacity invert dark:invert-0 object-contain"
            priority
          />
        </LocalizedLink>

        {/* 검색 폼 */}
        <Search
          className="hidden md:block md:absolute md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full"
          style={electronNoDragCss}
        />

        <div
          className="ml-auto pl-2 flex items-center gap-2"
          style={{ ...(!bIsMac && { transform: "translateX(-100px)" }) }}
        >
          <Flex gap="4" className="items-center">
            {isLoading ? (
              <Spinner />
            ) : (
              <>
                {bIsLoggedIn && (
                  <>
                    <NotificationCenter>
                      <IconButton variant="ghost" radius="full">
                        <Bell className="h-5 w-5" />
                      </IconButton>
                    </NotificationCenter>

                    <Popover.Root
                      open={isProfileOpen}
                      onOpenChange={setIsProfileOpen}
                    >
                      <Popover.Trigger>
                        <IconButton
                          variant="ghost"
                          radius="full"
                          style={electronNoDragCss}
                        >
                          <Avatar
                            src={
                              imageUriRegExp.test(avatarUri)
                                ? avatarUri
                                : undefined
                            }
                            radius="full"
                            size="2"
                            fallback={username.charAt(0).toUpperCase()}
                          />
                        </IconButton>
                      </Popover.Trigger>
                      <Popover.Content
                        style={{
                          WebkitBackdropFilter: "saturate(180%) blur(20px)",
                          backdropFilter: "saturate(180%) blur(20px)",
                          backgroundColor:
                            "var(--topbar-bg, rgba(255, 255, 255, 0.72))",
                        }}
                        className="text-center"
                      >
                        <ProfilePopover />
                      </Popover.Content>
                    </Popover.Root>
                  </>
                )}
                {getIsSigninButtonActive() && (
                  <Button radius="full" asChild style={electronNoDragCss}>
                    <LocalizedLink href="/auth">{t("signin")}</LocalizedLink>
                  </Button>
                )}
              </>
            )}
          </Flex>
          <UpdateOverlay /> {/* 전역 알림 컴포넌트 */}
        </div>
      </div>
    </>
  );
}

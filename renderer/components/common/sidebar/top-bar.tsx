"use client";

import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { Bell, BellDot, Search as SearchIcon, Menu, X } from "lucide-react";
import { useRouter } from "next/router";
import Link from "next/link";
import { imageUriRegExp } from "@/lib/utils";
import Image from "next/image";
import { MobileSidebar } from "./mobile-sidebar";
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
import BitmapLogoBMP from "@/public/images/bitmap_bmp.png";
import Search from "@/components/common/search/search";

export default function TopBar() {
  const router = useRouter();
  const { t } = useTranslation("common");
  const { bIsLoggedIn, username, isLoading, avatarUri } = useAuth();
  // Electron 및 MacOS 환경 감지 변수 (실제 감지 코드는 구현하지 않음)
  const bIsElectron: boolean = false; // 예시 값, 실제로는 Electron 감지 로직 필요
  const [bIsMacOS, setIsMacOS] = useState(false); // 예시 값, 실제로는 MacOS 감지 로직 필요
  const [titleTransform, setTitleTransform] = useState("translateX(0px)");

  // 모바일 사이드바 상태 관리
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  // 모바일 검색창 상태 관리
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  // 프로필 팝오버 상태 관리
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  // 스크롤 상태 관리
  const [isScrolled, setIsScrolled] = useState(false);

  const handleFullscreenChange = (newFullscreenState: boolean) => {
    console.log("fullscreen state changed:", newFullscreenState);
    setTitleTransform(
      bIsMacOS && !newFullscreenState ? "translateX(80px)" : "translateX(0px)",
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
    const { electronTools } = window as any;
    electronTools.getPlatform().then((currentPlatform: string) => {
      setIsMacOS(currentPlatform === "darwin");
      electronTools.onFullscreenChange(handleFullscreenChange);
    });

    // 컴포넌트 언마운트 시 리스너 제거
    return () => {
      electronTools.removeFullscreenListener(handleFullscreenChange);
    };
  }, [handleFullscreenChange]);

  // 라우트 변경 시 팝오버 및 사이드바 닫기
  useEffect(() => {
    setIsProfileOpen(false);
    setIsMobileSidebarOpen(false);
    setIsMobileSearchOpen(false);
  }, [router.pathname]);

  // 모바일 사이드바 토글
  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  // 모바일 사이드바 닫기
  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

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
        {/* 모바일 메뉴 버튼 */}
        <div className={`md:hidden mr-3 ${isMobileSearchOpen ? "hidden" : ""}`}>
          <IconButton
            variant="ghost"
            radius="full"
            className="h-8 w-8"
            onClick={toggleMobileSidebar}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">{t("open-menu")}</span>
          </IconButton>
        </div>

        {/* 로고 이미지 */}
        <Link
          href="/"
          className={`flex items-center ${
            isMobileSearchOpen ? "hidden md:flex" : ""
          }`}
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
        </Link>

        {/* 검색 폼 */}
        <Search
          className={
            isMobileSearchOpen
              ? "flex-1 relative block"
              : "hidden md:block md:absolute md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full"
          }
          style={electronNoDragCss}
        />

        <div className="ml-auto pl-2 flex items-center gap-2">
          {/* 모바일 검색 토글 버튼 */}
          <div className="md:hidden flex items-center">
            <IconButton
              variant="ghost"
              radius="full"
              className="h-8 w-8"
              onClick={() => {
                setIsMobileSearchOpen(!isMobileSearchOpen);
              }}
            >
              {isMobileSearchOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <SearchIcon className="h-5 w-5" />
              )}
              <span className="sr-only">{t("search-toggle")}</span>
            </IconButton>
          </div>
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
                        <IconButton variant="ghost" radius="full">
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
                  <Button radius="full" asChild>
                    <Link href="/auth">{t("signin")}</Link>
                  </Button>
                )}
              </>
            )}
          </Flex>
        </div>
      </div>

      {/* 모바일 사이드바 오버레이 */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          {/* 배경 오버레이 */}
          <div
            className="fixed inset-0 bg-black/50"
            onClick={closeMobileSidebar}
          />

          {/* 사이드바 */}
          <div
            className={`fixed left-0 top-0 h-full w-64 border-r shadow-lg transform transition-transform duration-300 ease-in-out ${
              isScrolled ? "border-border/50" : "bg-background border-border"
            } flex flex-col`}
            style={{
              WebkitBackdropFilter: "saturate(180%) blur(20px)",
              backdropFilter: "saturate(180%) blur(20px)",
              backgroundColor: "var(--topbar-bg, rgba(255, 255, 255, 0.72))",
            }}
          >
            {/* 사이드바 헤더 */}
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">{t("menu")}</h2>
              <IconButton
                variant="ghost"
                className="h-8 w-8"
                radius="full"
                onClick={closeMobileSidebar}
              >
                <X className="h-5 w-5" />
                <span className="sr-only">{t("close-menu")}</span>
              </IconButton>
            </div>

            {/* 사이드바 콘텐츠 */}
            <MobileSidebar onItemClick={closeMobileSidebar} />
          </div>
        </div>
      )}
    </>
  );
}

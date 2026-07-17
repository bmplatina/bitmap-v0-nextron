import type React from "react";
import { startTransition, useEffect, useState } from "react";
import { UpdateProgress, UpdateStatus, UpdateStatusType } from "@/lib/types";
import { Bell, ChevronLeft } from "lucide-react";
import { useRouter } from "next/router";
import LocalizedLink from "@/components/common/localized-link";
import { cn, imageUriRegExp, pretendard } from "@/lib/utils";
import Image from "next/image";
import { useTranslation } from "next-i18next";
import {
  Avatar,
  Button,
  Dialog,
  Flex,
  IconButton,
  Popover,
  Progress,
  Spinner,
  Text,
} from "@radix-ui/themes";
import { ProfilePopover } from "@/components/accounts/profile";
import { useAuth } from "@/lib/AuthContext";
import NotificationCenter from "./notification-center";
import Search from "@/components/common/search/search";
import { useGameInstallManager } from "@/lib/GameInstallManagerContext";
import semver from "semver";
import { openExternal } from "@/lib/utils-client";
import { getBitmapAppFromGitHub } from "@/lib/general";
import { GitHubRelease } from "@/lib/types";
import ClientMarkdown from "../markdown/client-markdown";
import BitmapLogoBMP from "@/public/images/bitmap_bmp.png";

export default function TopBar() {
  const router = useRouter();
  const { t } = useTranslation("common");
  const { bIsMac } = useGameInstallManager();
  const { bIsLoggedIn, username, isLoading, avatarUri, bIsEmailVerified } =
    useAuth();
  // Electron 및 MacOS 환경 감지 변수 (실제 감지 코드는 구현하지 않음)
  const [titleTransform, setTitleTransform] =
    useState<string>("translateX(80px)");

  // 프로필 팝오버 상태 관리
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  // 스크롤 상태 관리
  const [isScrolled, setIsScrolled] = useState(false);
  // 뒤로가기 가능 여부 관리
  const [canGoBack, setCanGoBack] = useState(false);

  useEffect(() => {
    const updateBackStatus = () => {
      // Next.js의 history state.idx를 활용하여 첫 페이지인지 확인
      setCanGoBack((window.history.state?.idx ?? 0) > 0);
    };

    updateBackStatus();
    router.events.on("routeChangeComplete", updateBackStatus);
    return () => {
      router.events.off("routeChangeComplete", updateBackStatus);
    };
  }, [router.events]);

  function handleFullscreenChange(newFullscreenState: boolean) {
    if (!bIsMac) return;
    console.log("fullscreen state changed:", newFullscreenState);
    setTitleTransform(
      !newFullscreenState ? "translateX(80px)" : "translateX(0px)",
    );
  }

  function handleBackPage() {
    router.back();
  }

  // 스크롤 감지
  useEffect(() => {
    const handleScroll = () => {
      startTransition(() => {
        setIsScrolled(window.scrollY > 0);
      });
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

  return (
    <>
      <div
        className={`h-12 border-b flex items-center px-4 w-full relative z-50 transition-all duration-300 electron-drag ${
          isScrolled
            ? "border-border/50 apple-blur"
            : "bg-background border-border"
        }`}
      >
        {/* 로고 이미지 */}
        <div
          className="flex items-center electron-nodrag"
          style={{
            ...(bIsMac &&
              bIsEmailVerified && {
                transform: titleTransform,
                willChange: "transform",
                transition: "transform 0.5s ease 0.05s",
              }),
          }}
        >
          <LocalizedLink href="/" className="flex items-center">
            <Image
              src={BitmapLogoBMP}
              alt="Bitmap"
              width={120}
              height={32}
              className="h-8 w-auto cursor-pointer hover:opacity-80 transition-opacity invert dark:invert-0 object-contain"
              priority
            />
          </LocalizedLink>
          <IconButton
            variant="ghost"
            radius="full"
            className="electron-nodrag"
            onClick={handleBackPage}
            disabled={!canGoBack}
          >
            <ChevronLeft className="h-5 w-5" />
          </IconButton>
        </div>

        {/* 검색 폼 */}
        <Search className="hidden md:block md:absolute md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full electron-nodrag" />

        <div
          className={cn(
            "ml-auto pl-2 flex items-center gap-2",
            !bIsMac && "mr-[128px]",
          )}
        >
          <Flex gap="4" className="items-center">
            <UpdateButton />
            {isLoading ? (
              <Spinner />
            ) : (
              <>
                {bIsLoggedIn && (
                  <>
                    <NotificationCenter>
                      <IconButton
                        variant="ghost"
                        radius="full"
                        className="electron-nodrag"
                      >
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
                          className="electron-nodrag"
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
                      <Popover.Content className="text-center apple-blur">
                        <ProfilePopover />
                      </Popover.Content>
                    </Popover.Root>
                  </>
                )}
                {getIsSigninButtonActive() && (
                  <Button radius="full" asChild className="electron-nodrag">
                    <LocalizedLink href="/auth">{t("signin")}</LocalizedLink>
                  </Button>
                )}
              </>
            )}
          </Flex>
        </div>
      </div>
    </>
  );
}

const UpdateButton: React.FC = function () {
  const { t } = useTranslation("BitmapApp");
  const { bIsMac } = useGameInstallManager();
  const [gitHubReleases, setGitHubReleases] = useState<GitHubRelease>();
  const [latestReleaseDownloadURI, setLatestReleaseDownloadURI] = useState("");
  const [latestReleaseVersion, setLatestReleaseVersion] = useState("");
  const [latestTag, setLatestTag] = useState("");
  const [currentAppVersion, setCurrentAppVersion] = useState("");
  const [bIsUpdatable, setIsUpdatable] = useState(false);

  // States for Auto Update
  const [status, setStatus] = useState<UpdateStatusType>("idle");
  const [message, setMessage] = useState("");
  const [progress, setProgress] = useState<UpdateProgress | null>(null);

  function openExternalLink(
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
  ) {
    openExternal(event, window.electronTools);
  }

  useEffect(() => {
    async function checkUpdate() {
      try {
        // 1. 최신 릴리즈 정보 가져오기
        const release = await getBitmapAppFromGitHub(window.bitmapApi);
        if (!release) return;

        // UI 표시를 위한 상태 업데이트
        setGitHubReleases(release);

        const latestRelease = release;
        const latestTagName = latestRelease.tag_name;

        // 다운로드 자산 찾기
        const downloadAsset = latestRelease.assets.find((asset) =>
          asset.browser_download_url.includes(bIsMac ? ".dmg" : ".exe"),
        );

        // 상태 업데이트
        setLatestTag(latestTagName);
        setLatestReleaseVersion(latestTagName);
        if (downloadAsset) {
          setLatestReleaseDownloadURI(downloadAsset.browser_download_url);
        }

        // 2. 버전 비교 (로컬 변수 사용)
        const currentVersion = await window.electronTools.getAppVersion();
        setCurrentAppVersion(currentVersion);

        // semver 유효성 검사 및 비교
        if (semver.valid(latestTagName) && semver.valid(currentVersion)) {
          setIsUpdatable(semver.gt(latestTagName, currentVersion));
        } else setIsUpdatable(false);
      } catch (error) {
        console.error("버전 체크 중 오류 발생:", error);
      }
    }

    checkUpdate();
  }, [bIsMac]);

  useEffect(() => {
    // 메인 프로세스로부터 상태 수신
    window.electronTools.onUpdateStatus((data: UpdateStatus) => {
      setStatus(data.status);
      setMessage(data.message);
    });

    // 다운로드 진행률 수신
    window.electronTools.onDownloadProgress((data: UpdateProgress) => {
      setStatus("downloading");
      setProgress(data);
    });
  }, []);

  if (!bIsUpdatable) return null;

  return (
    <Dialog.Root>
      <Dialog.Trigger>
        <Button
          radius="full"
          className={cn("electron-nodrag", pretendard.className)}
        >
          {t("update")}
        </Button>
      </Dialog.Trigger>
      <Dialog.Content
        maxWidth="450px"
        className={cn(pretendard.className, "md:!max-w-[800px]")}
      >
        <Dialog.Title>
          <Text className={pretendard.className}>
            Bitmap App {latestReleaseVersion}
          </Text>
        </Dialog.Title>
        <Dialog.Description size="2" mb="4">
          {t("latest-release-note-desc")}
        </Dialog.Description>

        <Flex direction="column" gap="3">
          {gitHubReleases?.body && (
            <ClientMarkdown content={gitHubReleases?.body} />
          )}
        </Flex>

        <Flex gap="3" mt="4" justify="end">
          {status === "downloading" && progress ? (
            <>
              <Progress value={progress.percent} />
              <Text>
                {Math.round(progress.percent)}%,{" "}
                {(progress.bytesPerSecond / 1024 / 1024).toFixed(1)} MB/s
              </Text>
            </>
          ) : status === "downloaded" ? (
            <Button
              color="green"
              onClick={() => window.electronTools.quitAndInstall()}
            >
              {t("bitmap-app-update-now")}
            </Button>
          ) : (
            <Button color="green" asChild>
              <LocalizedLink
                href={latestReleaseDownloadURI}
                onClick={openExternalLink}
              >
                {t("download")}
              </LocalizedLink>
            </Button>
          )}

          <Dialog.Close>
            <Button>
              <Text className={pretendard.className}>{t("dismiss")}</Text>
            </Button>
          </Dialog.Close>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
};

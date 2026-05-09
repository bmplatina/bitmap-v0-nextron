import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter } from "next/router";
import { Separator } from "@/components/ui/separator";
import { Monitor, Moon, Sun } from "lucide-react";
import { type TFunction, useTranslation } from "next-i18next";
import type { i18n } from "i18next";
import {
  Box,
  Button,
  Flex,
  Progress,
  RadioCards,
  Select,
  Text,
  Tabs,
  Spinner,
} from "@radix-ui/themes";
import { getDownloadCacheSize, removeDownloadCache } from "@/lib/utils-client";
import { getStaticPaths, makeStaticProperties } from "@/lib/get-static";
import { error } from "electron-log";

interface i18nProp {
  t: TFunction;
  i18n?: i18n;
}

export default function SettingsPage() {
  const { t, i18n } = useTranslation("Settings");
  const [mounted, setMounted] = useState(false);

  // 클라이언트 사이드에서만 테마 관련 UI를 렌더링
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <Tabs.Root defaultValue="general">
      <Tabs.List>
        <Tabs.Trigger value="general">{t("general")}</Tabs.Trigger>
        <Tabs.Trigger value="display">{t("display")}</Tabs.Trigger>
        <Tabs.Trigger value="download">{t("download")}</Tabs.Trigger>
      </Tabs.List>

      <Box pt="3" className="px-4">
        <Tabs.Content value="general">
          <GeneralSettings t={t} />
        </Tabs.Content>

        <Tabs.Content value="display">
          <DisplaySettings t={t} />
        </Tabs.Content>

        <Tabs.Content value="download">
          <DownloadSettings t={t} />
        </Tabs.Content>
      </Box>
    </Tabs.Root>
  );
}

function GeneralSettings({ t }: i18nProp) {
  const router = useRouter();
  const { i18n } = useTranslation();

  async function handleLocaleChange(nextLocale: string) {
    // i18next 인스턴스에 언어 변경을 직접 지시하여 즉각적인 DOM 리렌더링 유도
    await i18n.changeLanguage(nextLocale);

    // Next.js 라우터 경로도 업데이트 (향후 새로고침이나 Link 이동을 위해)
    const newAsPath = router.asPath.replace(
      `/${i18n.language}`,
      `/${nextLocale}`,
    );
    router.replace(
      {
        pathname: router.pathname,
        query: { ...router.query, locale: nextLocale },
      },
      newAsPath,
      { shallow: false },
    );
  }

  useEffect(
    function () {
      const newLocale: "ko" | "en" = i18n.language === "ko" ? "ko" : "en";
      window.electronTools.setLocale(newLocale);
    },
    [i18n.language],
  );

  useEffect(() => {
    void (async () => {
      const initialLocale = await window.electronTools.getLocale();
      await handleLocaleChange(initialLocale);
    })();
  }, []);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{t("language")}</CardTitle>
          <CardDescription>{t("language-desc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Select.Root
            defaultValue={i18n.language || "en"}
            onValueChange={handleLocaleChange}
          >
            <Select.Trigger />
            <Select.Content>
              <Select.Group>
                <Select.Label>Global</Select.Label>
                <Select.Item value="en">English (English)</Select.Item>
              </Select.Group>
              <Select.Separator />
              <Select.Group>
                <Select.Label>Asia</Select.Label>
                <Select.Item value="ko">Korean (한국어)</Select.Item>
                <Select.Item value="ja" disabled>
                  Japanese (日本語)
                </Select.Item>
              </Select.Group>
            </Select.Content>
          </Select.Root>
        </CardContent>
      </Card>

      <Separator />
    </>
  );
}

function DisplaySettings({ t }: i18nProp) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // 클라이언트 사이드에서만 테마 관련 UI를 렌더링
  useEffect(() => {
    setMounted(true);
  }, []);

  const setScreenMode = (newTheme: "light" | "system" | "dark") => {
    setTheme(newTheme);
    window.bitmapApi.setScreenMode(newTheme);
  };

  // 테마 옵션 정의
  const themeOptions = [
    {
      value: "light",
      label: "screen-mode-light",
      description: "screen-mode-light-desc",
      icon: <Sun className="h-4 w-4" />,
    },
    {
      value: "system",
      label: "screen-mode-system-default",
      description: "screen-mode-system-default-desc",
      icon: <Monitor className="h-4 w-4" />,
    },
    {
      value: "dark",
      label: "screen-mode-dark",
      description: "screen-mode-dark-desc",
      icon: <Moon className="h-4 w-4" />,
    },
  ];

  // 현재 테마 정보 가져오기
  const getCurrentThemeInfo = () => {
    return (
      themeOptions.find((option) => option.value === theme) || themeOptions[2]
    );
  };

  return (
    <>
      {/* 테마 설정 */}
      <Card>
        <CardHeader>
          <CardTitle>{t("theme")}</CardTitle>
          <CardDescription>{t("theme-desc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <RadioCards.Root
                value={theme}
                onValueChange={setScreenMode}
                columns={{ initial: "1", sm: "3" }}
              >
                {themeOptions.map((option) => (
                  <RadioCards.Item key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">{option.icon}</div>
                    <Flex direction="column" width="100%">
                      <Text weight="bold">{t(option.label)}</Text>
                    </Flex>
                  </RadioCards.Item>
                ))}
              </RadioCards.Root>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />
    </>
  );
}

function DownloadSettings({ t }: i18nProp) {
  const [cacheSize, setCacheSize] = useState<number>(0);
  const [bIsCachePurging, setIsCachePurging] = useState<boolean>(false);

  function formatBytesToGB(bytes: number) {
    return Number((bytes / 1024 ** 3).toFixed(2));
  }

  async function purgeCache() {
    try {
      setIsCachePurging(true);
      await removeDownloadCache(window.bitmapApi, setCacheSize);
    } catch (error) {
    } finally {
      setIsCachePurging(false);
    }
  }

  useEffect(() => {
    async function fetchCacheSize() {
      const size = await getDownloadCacheSize(window.bitmapApi);
      setCacheSize(size);
    }

    fetchCacheSize();
  }, []);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{t("download-cache")}</CardTitle>
          <CardDescription>{t("download-cache-desc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Flex gap="2" direction="column">
            <Text>{formatBytesToGB(cacheSize)}GiB / 7.5GiB</Text>
            <Progress value={(formatBytesToGB(cacheSize) / 7.5) * 100} />
          </Flex>
        </CardContent>
        <CardFooter>
          <Button onClick={purgeCache} disabled={bIsCachePurging}>
            {bIsCachePurging ? <Spinner /> : <Text>캐시 제거</Text>}
          </Button>
        </CardFooter>
      </Card>

      <Separator />
    </>
  );
}

export const getStaticProps = makeStaticProperties(["Settings"]);

export { getStaticPaths };

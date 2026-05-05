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
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Monitor, Moon, Sun } from "lucide-react";
import { TFunction, useTranslation } from "next-i18next";
import { Flex, RadioCards, Text, Tabs, Box, Button } from "@radix-ui/themes";
import { getStaticPaths, makeStaticProperties } from "@/lib/get-static";

interface i18nProp {
  t: TFunction;
}

export default function SettingsPage() {
  const { t } = useTranslation("Settings");
  const [mounted, setMounted] = useState(false);

  // 클라이언트 사이드에서만 테마 관련 UI를 렌더링
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <Tabs.Root defaultValue="general">
      <Tabs.List>
        <Tabs.Trigger value="general">General</Tabs.Trigger>
        <Tabs.Trigger value="display">Display</Tabs.Trigger>
        <Tabs.Trigger value="downloads">Downloads</Tabs.Trigger>
      </Tabs.List>

      <Box pt="3" className="px-4">
        <Tabs.Content value="general">
          <Text size="2">Make changes to your account.</Text>
        </Tabs.Content>

        <Tabs.Content value="display">
          <DiaplaySettings t={t} />
        </Tabs.Content>

        <Tabs.Content value="downloads">
          <DownloadsSettings t={t} />
        </Tabs.Content>
      </Box>
    </Tabs.Root>
  );
}

function DiaplaySettings({ t }: i18nProp) {
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
          {/* <CardDescription>애플리케이션의 외관을 설정합니다.</CardDescription> */}
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="theme-select">테마 선택</Label>
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
                      <Text>{t(option.description)}</Text>
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

function DownloadsSettings({ t }: i18nProp) {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>다운로드 캐시</CardTitle>
        </CardHeader>
        <CardContent>다운로드 캐시 용량: {5} GB</CardContent>
        <CardFooter>
          <Button onClick={window.bitmapApi.removeDesyncCache}>
            캐시 제거
          </Button>
        </CardFooter>
      </Card>

      <Separator />
    </>
  );
}

export const getStaticProps = makeStaticProperties(["Settings"]);

export { getStaticPaths };

"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTranslation } from "next-i18next";
import { Flex, RadioCards, Text } from "@radix-ui/themes";

export default function SettingsPage() {
  const { t } = useTranslation("Settings");
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // 클라이언트 사이드에서만 테마 관련 UI를 렌더링
  useEffect(() => {
    setMounted(true);
  }, []);

  const setScreenMode = (newTheme: string) => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
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

  if (!mounted) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">{t("settings-general")}</h1>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("theme")}</CardTitle>
              {/* <CardDescription>
                애플리케이션의 외관을 설정합니다.
              </CardDescription> */}
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="theme-select">테마 선택</Label>
                <div className="h-10 bg-muted rounded-md animate-pulse" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">{t("settings-general")}</h1>

      <div className="space-y-6">
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
                      <div className="flex items-center gap-2">
                        {option.icon}
                      </div>
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
      </div>
    </div>
  );
}

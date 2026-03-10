import { useRouter } from "next/router";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useTranslation } from "next-i18next";
import i18next from "../../../../next-i18next.config";
import { useEffect } from "react";

export default function LanguageSwitch() {
  const router = useRouter();
  const { i18n } = useTranslation();

  const locale = (router.query.locale as string) || i18n.language || "en";
  const isEnglish = locale === "en";

  async function handleLocaleChange(checked: boolean) {
    const nextLocale = checked ? "en" : "ko";

    // i18next 인스턴스에 언어 변경을 직접 지시하여 즉각적인 DOM 리렌더링 유도
    await i18n.changeLanguage(nextLocale);

    // Next.js 라우터 경로도 업데이트 (향후 새로고침이나 Link 이동을 위해)
    const newAsPath = router.asPath.replace(`/${locale}`, `/${nextLocale}`);
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
      const newLocale: "ko" | "en" = locale === "ko" ? "ko" : "en";
      window.electronTools.setLocale(newLocale);
    },
    [locale],
  );

  useEffect(function () {
    const initialLocale = window.electronTools.getLocale();
    handleLocaleChange(initialLocale === "en");
  }, []);

  return (
    <div className="flex items-center justify-between px-2 py-2">
      <div className="flex items-center gap-2">
        <Label
          htmlFor="language-mode"
          className="text-xs font-medium text-muted-foreground uppercase"
        >
          {isEnglish ? "English" : "한국어"}
        </Label>
      </div>
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "text-[10px] font-bold transition-colors",
            !isEnglish ? "text-foreground" : "text-muted-foreground/50",
          )}
        >
          KO
        </span>
        <Switch
          id="language-mode"
          checked={isEnglish}
          onCheckedChange={handleLocaleChange}
          aria-label="언어 전환"
        />
        <span
          className={cn(
            "text-[10px] font-bold transition-colors",
            isEnglish ? "text-foreground" : "text-muted-foreground/50",
          )}
        >
          EN
        </span>
      </div>
    </div>
  );
}

import { useRouter } from "next/router";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useTranslation } from "next-i18next";

export default function LanguageSwitch() {
  const router = useRouter();
  const { i18n } = useTranslation();

  const locale = (router.query.locale as string) || i18n.language || "en";
  const isEnglish = locale === "en";

  const handleLocaleChange = (checked: boolean) => {
    const nextLocale = checked ? "en" : "ko";

    const { pathname, asPath, query } = router;

    // 현재 경로에서 /locale/ 부분을 새 locale로 교체
    const newAsPath = asPath.replace(`/${locale}`, `/${nextLocale}`);

    // 만약 asPath가 그냥 /locale/ 이었다면 nextLocale로
    if (asPath === `/${locale}` || asPath === `/${locale}/`) {
      router.push(`/${nextLocale}`);
    } else {
      router.push(newAsPath);
    }
  };

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

"use client";

import { useRouter } from "next/router";
import { useParams } from "next/navigation";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export default function LanguageSwitch() {
  const router = useRouter();
  const locale = router.locale;
  const params = useParams();

  const isEnglish = locale === "en";

  const handleLocaleChange = (checked: boolean) => {
    const nextLocale = checked ? "en" : "ko";

    router.replace(
      // @ts-expect-error: dynamic params 타입을 위해 추가
      { pathname: router.pathname, params },
      { locale: nextLocale },
    );
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

import { getLocalizedString } from "@/lib/utils";
import { getEula } from "@/lib/general";
import type { searchParamsPropsSSR } from "@/lib/types";
import { getLocale, getTranslations } from "next-intl/server";
import SmartMarkdown from "@/components/common/markdown/markdown-renderer";
import { Text } from "@radix-ui/themes";

export default function EulaPage({ searchParams }: searchParamsPropsSSR) {
  const locale = await getLocale();
  const { t } = useTranslation("Common");
  const { license } = await searchParams;
  const eula = await getEula(license as string);

  if (!eula) {
    return (
      <div className="px-4 md:px-32 pt-6 items-center justify-center">
        <Text className="text-center">{t("data-not-processable")}</Text>
      </div>
    );
  }

  return (
    <div className="px-4 md:px-32 pt-6">
      <SmartMarkdown content={getLocalizedString(locale, eula)} />
    </div>
  );
}

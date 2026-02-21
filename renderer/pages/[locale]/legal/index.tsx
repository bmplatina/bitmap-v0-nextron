import { getStaticPaths, makeStaticProperties } from "@/lib/get-static";
import { getLocalizedString } from "@/lib/utils";
import { getEula } from "@/lib/general";
import { useTranslation } from "next-i18next";
import SmartMarkdown from "@/components/common/markdown/client-markdown";
import { Text } from "@radix-ui/themes";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";

export default function EulaPage() {
  const router = useRouter();
  const { locale, license } = router.query;
  const { t } = useTranslation("common");
  const [eula, setEula] = useState<any>(null);

  useEffect(() => {
    async function fetchEula() {
      if (!license) return;
      const data = await getEula(window.bitmapApi, license as string);
      setEula(data);
    }
    fetchEula();
  }, [license]);

  if (!eula) {
    return (
      <div className="px-4 md:px-32 pt-6 items-center justify-center">
        <Text className="text-center">{t("data-not-processable")}</Text>
      </div>
    );
  }

  return (
    <div className="px-4 md:px-32 pt-6">
      <SmartMarkdown content={getLocalizedString(locale as string, eula)} />
    </div>
  );
}

export const getStaticProps = makeStaticProperties([]);
export { getStaticPaths };

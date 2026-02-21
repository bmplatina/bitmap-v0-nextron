import { useEffect } from "react";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { makeStaticProperties } from "@/lib/get-static";

export default function Index() {
  const router = useRouter();
  const { i18n } = useTranslation();
  const locale = i18n.language || "en";

  useEffect(() => {
    router.replace(`/${locale}/`);
  }, [router, locale]);

  return null;
}

export const getStaticProps = makeStaticProperties([]);

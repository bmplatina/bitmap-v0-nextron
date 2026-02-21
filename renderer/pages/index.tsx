import { useEffect } from "react";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";

export default function Index() {
  const router = useRouter();
  const {
    i18n: { language: locale },
  } = useTranslation();

  useEffect(() => {
    router.replace(`/${locale}`);
  }, [router, locale]);

  return null;
}

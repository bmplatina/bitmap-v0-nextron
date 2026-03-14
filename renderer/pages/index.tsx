import { useEffect } from "react";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { makeStaticProperties } from "@/lib/get-static";
import { Flex } from "@radix-ui/themes";
import BitmapAppAnim from "@/components/common/bitmap-app/bitmap-app-anim";

export default function Index() {
  const router = useRouter();
  const { i18n } = useTranslation();
  const locale = i18n.language || "en";

  useEffect(() => {
    router.replace(`/${locale}/`);
  }, [router, locale]);

  return (
    <Flex
      align="center"
      justify="center"
      className="w-screen h-screen electron-drag"
    >
      <BitmapAppAnim text="BITMAP APP" />
    </Flex>
  );
}

export const getStaticProps = makeStaticProperties([]);

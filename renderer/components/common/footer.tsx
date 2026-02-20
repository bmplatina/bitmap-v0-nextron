import { useTranslation } from "next-i18next";
import Link from "next/link";
import { Flex, Separator, Text, Container } from "@radix-ui/themes";
import Image from "next/image";

import BitmapLogo from "@/public/images/bitmaplogo-notext.png";

export default function Footer() {
  const { t } = useTranslation("Footer");

  return (
    <footer className="w-full mt-20 py-16 px-4 md:px-6 bg-muted/30 border-t border-border/50">
      <Container size="4">
        <Flex
          direction={{ initial: "column", md: "row" }}
          gap="6"
          justify="between"
          align={{ initial: "start", md: "center" }}
        >
          <Flex gap="4" align="center">
            <Link href="/">
              <Image
                src={BitmapLogo}
                alt="Bitmap Production Logo"
                width={36}
                className="invert dark:invert-0 object-contain"
              />
            </Link>

            <Flex direction="column" gap="2">
              <Text size="3" weight="bold" className="tracking-tighter">
                Bitmap Production
              </Text>
              <Text size="1" color="gray" className="opacity-70">
                {t("copyright-bitmap")}
              </Text>
            </Flex>
          </Flex>

          <Flex
            gap="2"
            wrap="wrap"
            align="center"
            className="text-muted-foreground"
          >
            <Link
              href="/legal?license=BitmapPrivacy"
              className="hover:text-foreground transition-colors duration-200"
            >
              <Text size="2" weight="medium">
                {t("privacy-policy")}
              </Text>
            </Link>
            <Separator orientation="vertical" />
            <Link
              href="/legal?license=BitmapEULA"
              className="hover:text-foreground transition-colors duration-200"
            >
              <Text size="2" weight="medium">
                {t("terms-of-use")}
              </Text>
            </Link>
            <Separator orientation="vertical" />
            <Link
              href="/legal?license=sla"
              className="hover:text-foreground transition-colors duration-200"
            >
              <Text size="2" weight="medium">
                {t("legal")}
              </Text>
            </Link>
            <Separator orientation="vertical" />
            <Link
              href="/about"
              className="hover:text-foreground transition-colors duration-200"
            >
              <Text size="2" weight="medium">
                {t("about")}
              </Text>
            </Link>
          </Flex>
        </Flex>
        <div className="mt-8">
          <Text size="2" as="p" color="gray">
            {t("bitmap-about")}
          </Text>
        </div>
      </Container>
    </footer>
  );
}

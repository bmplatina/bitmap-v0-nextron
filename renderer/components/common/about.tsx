import { Button, Container, Flex, Text } from "@radix-ui/themes";
import { Separator } from "../ui/separator";
import LocalizedLink from "./localized-link";
import Image from "next/image";
import { useTranslation } from "next-i18next";
import BitmapLogo from "@/public/images/bitmaplogo-notext.png";
import { openExternal } from "@/lib/utils-client";
import { cn, pretendard } from "@/lib/utils";

export default function About() {
  const { t } = useTranslation("Footer");

  function openExternalLink(event: React.MouseEvent<HTMLAnchorElement>) {
    openExternal(event, window.electronTools);
  }

  return (
    <Flex
      direction="column"
      gap="3"
      className={cn("pt-3", pretendard.className)}
    >
      <Separator />
      <Container
        size="4"
        className="rounded-xl bg-black/5 dark:bg-white/10 p-5"
      >
        <Flex
          direction={{ initial: "column", md: "row" }}
          gap="6"
          justify="between"
          align={{ initial: "start", md: "center" }}
        >
          <Flex gap="4" align="center">
            <LocalizedLink href="/">
              <Image
                src={BitmapLogo}
                alt="Bitmap Production Logo"
                width={36}
                className="invert dark:invert-0 object-contain"
              />
            </LocalizedLink>

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
            <Button variant="ghost" color="gray">
              <LocalizedLink
                href="/legal?license=BitmapPrivacy"
                className="hover:text-foreground transition-colors duration-200"
              >
                <Text size="2" weight="medium" className={pretendard.className}>
                  {t("privacy-policy")}
                </Text>
              </LocalizedLink>
            </Button>

            <Separator orientation="vertical" />

            <Button variant="ghost" color="gray">
              <LocalizedLink
                href="/legal?license=BitmapEULA"
                className="hover:text-foreground transition-colors duration-200"
              >
                <Text size="2" weight="medium" className={pretendard.className}>
                  {t("terms-of-use")}
                </Text>
              </LocalizedLink>
            </Button>

            <Separator orientation="vertical" />

            <Button variant="ghost" color="gray">
              <LocalizedLink
                href="/legal?license=sla"
                className="hover:text-foreground transition-colors duration-200"
              >
                <Text size="2" weight="medium" className={pretendard.className}>
                  {t("legal")}
                </Text>
              </LocalizedLink>
            </Button>

            <Separator orientation="vertical" />
          </Flex>
        </Flex>
        <div className="mt-8">
          <Text size="2" as="p" color="gray">
            {t("bitmap-about")}
          </Text>
        </div>
      </Container>
      <Container
        size="4"
        className="rounded-xl bg-black/5 dark:bg-white/10 p-5"
      >
        <Flex
          direction={{ initial: "column", md: "row" }}
          gap="6"
          justify="between"
          align={{ initial: "start", md: "center" }}
        >
          <Flex direction="column" gap="2">
            <Text size="3" weight="bold" className="tracking-tighter">
              Open Source Notices
            </Text>
            <Text size="1" color="gray" className="opacity-70">
              This application is built with open source software.
            </Text>
          </Flex>

          <Flex gap="2" align="center">
            <Button variant="ghost" color="gray">
              <LocalizedLink
                href="https://github.com/bmplatina/bitmap-v0-nextron"
                onClick={openExternalLink}
                className="hover:text-foreground transition-colors duration-200"
              >
                <Text size="2" weight="medium" className={pretendard.className}>
                  GitHub
                </Text>
              </LocalizedLink>
            </Button>
          </Flex>
        </Flex>
      </Container>
    </Flex>
  );
}

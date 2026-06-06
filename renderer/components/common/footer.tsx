import { useEffect, useState } from "react";
import { useTranslation } from "next-i18next";
import LocalizedLink from "@/components/common/localized-link";
import {
  Flex,
  Separator,
  Text,
  Container,
  Button,
  Box,
  Dialog,
} from "@radix-ui/themes";
import Image from "next/image";
import { openExternal } from "@/lib/utils-client";
import BitmapLogo from "@/public/images/bitmaplogo-notext.png";
import { pretendard } from "@/lib/utils";

export default function Footer() {
  const { t } = useTranslation("Footer");
  const [appVersion, setAppVersion] = useState<string>("");
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  function openExternalLink(event: React.MouseEvent<HTMLAnchorElement>) {
    openExternal(event, window.electronTools);
  }

  async function getAppVersion() {
    const ver = await window.electronTools.getAppVersion();
    setAppVersion(ver);
  }

  useEffect(function () {
    getAppVersion();

    const unsubscribeAbout = window.electronTools.onOpenAbout(() => {
      setIsAboutOpen(true);
    });

    return () => {
      if (unsubscribeAbout) unsubscribeAbout();
    };
  }, []);

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
                <Text size="2" weight="medium">
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
                <Text size="2" weight="medium">
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
                <Text size="2" weight="medium">
                  {t("legal")}
                </Text>
              </LocalizedLink>
            </Button>

            <Separator orientation="vertical" />

            <Dialog.Root open={isAboutOpen} onOpenChange={setIsAboutOpen}>
              <Dialog.Trigger>
                <Button variant="ghost" color="gray">
                  <Text size="2" weight="medium">
                    {t("about")}
                  </Text>
                </Button>
              </Dialog.Trigger>

              <Dialog.Content maxWidth="450px" className={pretendard.className}>
                <Dialog.Title>
                  <Text className={pretendard.className} weight="bold">
                    Bitmap App™
                  </Text>
                </Dialog.Title>
                <Dialog.Description>
                  <Text className={pretendard.className} weight="medium">
                    Version {appVersion}
                  </Text>
                </Dialog.Description>

                <Flex direction="column" gap="3">
                  <Box asChild px="4">
                    <ul style={{ listStyleType: "disc" }}>
                      <li>
                        <Text size="2">Frontend: Next.js (React)</Text>
                      </li>
                      <li>
                        <Text size="2">Backend: Electron (Nextron)</Text>
                      </li>
                      <li>
                        <Text size="2">Scripting: TypeScript</Text>
                      </li>
                      <li>
                        <Text size="2">Styling: Tailwind, PostCSS</Text>
                      </li>
                      <li>
                        <Text size="2">Themes: Radix UI</Text>
                      </li>
                      <li>
                        <Text size="2">
                          Fonts: Pretendard, Inter, JetBrains Mono
                        </Text>
                      </li>
                      <li>
                        <Text size="2">Icons: Lucide</Text>
                      </li>
                      <li>
                        <Text size="2">API Communication: Axios</Text>
                      </li>
                      <li>
                        <Text size="2">
                          Game Versioning Manager: Desync (customized)
                        </Text>
                      </li>
                      <li>
                        <Text size="2">
                          Markdown: Monaco Editor, react-markdown
                        </Text>
                      </li>
                      <li>
                        <Text size="2">Animation: Framer Motion</Text>
                      </li>
                    </ul>
                  </Box>
                  <Text>
                    Visit{" "}
                    <LocalizedLink
                      href="https://github.com/bmplatina/bitmap-v0"
                      onClick={openExternalLink}
                    >
                      <Text color="blue">GitHub</Text>
                    </LocalizedLink>{" "}
                    to see all dependencies.
                  </Text>
                </Flex>

                <Flex gap="3" mt="4" justify="end">
                  <Dialog.Close>
                    <Button variant="soft" color="gray">
                      <div className={pretendard.className}>Close</div>
                    </Button>
                  </Dialog.Close>
                </Flex>
              </Dialog.Content>
            </Dialog.Root>
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

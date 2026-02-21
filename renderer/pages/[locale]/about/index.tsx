import { getStaticPaths, makeStaticProperties } from "@/lib/get-static";
import Image from "next/image";
import {
  Container,
  Button,
  Box,
  Dialog,
  Flex,
  Text,
  Section,
  Grid,
} from "@radix-ui/themes";
import { useTranslation } from "next-i18next";
import BitmapAppAnim from "@/components/common/bitmap-app/bitmap-app-anim";
import BitmapLogo from "@/public/bitmaplogo-notext.png";
import Link from "next/link";
import {
  FadeIn,
  FadeInUp,
  FadeInUpNoInit,
  FadeInWithScale,
  StaggerContainer,
} from "@/components/framer-motion/motions";
import MultiLineText from "@/components/common/multi-line-text";
import YouTubeWorksList from "@/components/common/youtube-works-list";
import MemberList from "@/components/common/member-list";
import ReadyToStartNavigations from "@/components/common/about/ready-to-start-btn";
import OpenSourceNotices from "@/components/common/about/open-src-notices";

export default function BitmapAbout() {
  const { t } = useTranslation("About");

  return (
    <div className="w-full">
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <BitmapAppAnim />
        <FadeIn>
          <Text size="2" color="gray" className="mt-8 opacity-60">
            Scroll down to explore
          </Text>
        </FadeIn>
      </div>

      <Container size="3" className="px-4">
        {/* Section 1: Intro Text */}
        <Section size="3">
          <FadeInUp>
            <Flex
              direction="column"
              align="center"
              gap="5"
              className="text-center"
            >
              <Flex gap="2">
                <Image
                  src={BitmapLogo}
                  alt="Bitmap Production Logo"
                  width={32}
                  className="invert dark:invert-0 object-contain"
                />
                <Text size="8" weight="bold" className="tracking-tighter">
                  Bitmap Production™
                </Text>
              </Flex>
              <MultiLineText
                as="p"
                size="5"
                color="gray"
                className="max-w-[600px] leading-relaxed break-keep"
              >
                {t("bitmap-overview-desc")}
              </MultiLineText>
            </Flex>
          </FadeInUp>
        </Section>

        {/* Section 2: Features Grid */}
        <Section size="3">
          <Grid columns={{ initial: "1", md: "2" }} gap="9" width="auto">
            <FadeInUp viewportMargin={0}>
              <Box className="bg-gray-100 dark:bg-gray-900 rounded-3xl p-4 h-64 flex items-center justify-center border border-gray-200 dark:border-gray-800">
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/OdzY7CqBWVw`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </Box>
            </FadeInUp>

            <Flex direction="column" justify="center" gap="5">
              <StaggerContainer>
                <FadeInUpNoInit>
                  <Text size="7" mb="3" weight="bold">
                    What is Bitmap?
                  </Text>
                </FadeInUpNoInit>
                <FadeInUpNoInit>
                  <Text
                    as="p"
                    size="3"
                    color="gray"
                    className="leading-relaxed"
                  >
                    {t("what-is-bitmap")}
                  </Text>
                </FadeInUpNoInit>
              </StaggerContainer>
            </Flex>
          </Grid>
        </Section>

        {/* Section 3: Portfolio Grid */}
        <Section size="3">
          <Grid columns={{ initial: "1", md: "2" }} gap="9" width="auto">
            <Flex
              direction="column"
              justify="center"
              gap="5"
              className="order-2 md:order-1"
            >
              <StaggerContainer>
                <FadeInUpNoInit>
                  <Text size="7" mb="3" weight="bold">
                    Our Portfolio
                  </Text>
                </FadeInUpNoInit>
                <FadeInUpNoInit>
                  <Text
                    as="p"
                    size="3"
                    color="gray"
                    className="leading-relaxed"
                  >
                    {t("our-portfolio")}
                  </Text>
                </FadeInUpNoInit>
              </StaggerContainer>
            </Flex>
            <FadeInUp viewportMargin={0} className="min-w-0 order-1 md:order-2">
              <Box className="bg-gray-100 dark:bg-gray-900 rounded-3xl p-4 border border-gray-200 dark:border-gray-800">
                <YouTubeWorksList bFetchFromClient />
              </Box>
            </FadeInUp>
          </Grid>
        </Section>

        {/* Section 5: Our Members */}
        <Section size="3" className="mb-20">
          <FadeInWithScale className="rounded-3xl p-12 text-center bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 overflow-hidden">
            <MemberList />
          </FadeInWithScale>
        </Section>

        {/* Section 6: Call to Action */}
        <Section size="3" className="mb-20">
          <FadeInWithScale className="rounded-3xl p-12 text-center bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800">
            <Flex direction="column" align="center" gap="4">
              <Text size="8" weight="bold">
                Ready to Start?
              </Text>
              <Text size="4" color="gray" className="mb-4">
                {t("start-with-bitmap")}
              </Text>
              <ReadyToStartNavigations />
              <Button asChild>
                <Link href="/">Get Started</Link>
              </Button>
            </Flex>
          </FadeInWithScale>
        </Section>
      </Container>
      <footer className="w-full mt-20 py-16 px-4 md:px-6 bg-muted/30 border-t border-border/50">
        <Container size="4">
          <Box asChild px="4">
            <ul style={{ listStyleType: "disc" }}>
              <li>
                <Text size="2" color="gray">
                  {t("start-of-bitmap")}
                </Text>
              </li>
              <li>
                <Text size="2" color="gray">
                  {t("origin-of-name")}
                </Text>
              </li>
              <li>
                <OpenSourceNotices>Open Source Notices</OpenSourceNotices>
              </li>
            </ul>
          </Box>
        </Container>
      </footer>
    </div>
  );
}

export const getStaticProps = makeStaticProperties(["About"]);
export { getStaticPaths };

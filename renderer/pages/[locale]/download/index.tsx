import { Suspense } from "react";
import {
  Flex,
  Container,
  Button,
  Spinner,
  Section,
  Text,
  Grid,
  Card,
  Separator,
} from "@radix-ui/themes";
import MultiLineText from "@/components/common/multi-line-text";
import { useTranslation } from "next-i18next";
import type { searchParamsPropsSSR } from "@/lib/types";
import BitmapAppDownloadButton from "@/components/common/bitmap-app/bitmap-app-dl-btn";
import BitmapAppAnim from "@/components/common/bitmap-app/bitmap-app-anim";
import BitmapAppRedirector from "@/components/common/bitmap-app/bitmap-app-redirector";
import { FadeInUp, StaggerContainer } from "@/components/framer-motion/motions";

export default function BitmapAppPage({ searchParams }: searchParamsPropsSSR) {
  const { t } = useTranslation("BitmapApp");

  // 1. Promise를 resolve 합니다.
  const { gameId, projectId, lectureId } = await searchParams;

  return (
    <div className="w-full py-12 px-4">
      <Container size="3">
        <StaggerContainer>
          {/* Hero Section */}
          <Section py="8">
            <Flex
              direction="column"
              align="center"
              gap="6"
              className="text-center"
            >
              <FadeInUp>
                <BitmapAppAnim text="BITMAP APP" />
              </FadeInUp>

              <FadeInUp>
                {/* 딜레이 0.2 */}
                <Text size="8" mb="2" weight="bold">
                  {t("intro-title")}
                </Text>
                <br />
                <MultiLineText
                  size="4"
                  color="gray"
                  className="max-w-[600px] mx-auto leading-relaxed break-keep opacity-90"
                >
                  {t("about")}
                </MultiLineText>
              </FadeInUp>

              <FadeInUp>
                {/* 딜레이 0.4 */}
                <Flex
                  direction="column"
                  gap="4"
                  className="w-full max-w-[320px] items-center"
                >
                  <Suspense fallback={<RedirectorSkeleton />}>
                    <BitmapAppRedirector gameId={gameId as string} />
                  </Suspense>
                  <BitmapAppDownloadButton />
                  <Text size="1" color="gray" className="opacity-60">
                    {t("download-alert")}
                  </Text>
                </Flex>
              </FadeInUp>
            </Flex>
          </Section>

          <Separator size="4" />

          {/* Features Section */}
          <Section py="8">
            <FadeInUp>
              <Grid columns={{ initial: "1", sm: "3" }} gap="6">
                <Card variant="surface" size="3">
                  <Flex direction="column" gap="3">
                    <Text size="4" weight="bold">
                      {t("feature-1-title")}
                    </Text>
                    <Text size="2" color="gray">
                      {t("feature-1-desc")}
                    </Text>
                  </Flex>
                </Card>
                <Card variant="surface" size="3">
                  <Flex direction="column" gap="3">
                    <Text size="4" weight="bold">
                      {t("feature-2-title")}
                    </Text>
                    <Text size="2" color="gray">
                      {t("feature-2-desc")}
                    </Text>
                  </Flex>
                </Card>
                <Card variant="surface" size="3">
                  <Flex direction="column" gap="3">
                    <Text size="4" weight="bold">
                      {t("feature-3-title")}
                    </Text>
                    <Text size="2" color="gray">
                      {t("feature-3-desc")}
                    </Text>
                  </Flex>
                </Card>
              </Grid>
            </FadeInUp>
          </Section>

          {/* System Requirements Section */}
          <Section py="8">
            <FadeInUp>
              <Card
                variant="ghost"
                className="bg-gray-100/50 dark:bg-gray-800/20"
              >
                <Flex direction="column" gap="4" p="4">
                  <Text size="5" weight="bold">
                    {t("system-req")}
                  </Text>
                  <Flex direction="column" gap="1">
                    <Text weight="bold" size="2">
                      {t("os")}
                    </Text>
                    <Text size="2" color="gray">
                      {t("os-desc")}
                    </Text>
                  </Flex>
                </Flex>
              </Card>
            </FadeInUp>
          </Section>
        </StaggerContainer>
      </Container>
    </div>
  );
}

function RedirectorSkeleton() {
  return (
    <Button variant="outline" className="w-full cursor-pointer" disabled>
      <Spinner />
    </Button>
  );
}

import { Box, Button, Dialog, Flex, Text } from "@radix-ui/themes";
import LocalizedLink from "@/components/common/localized-link"
import { ReactNode } from "react";
import { pretendard } from "@/lib/utils";

export default function OpenSourceNotices({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <Dialog.Root>
      <Dialog.Trigger>
        <LocalizedLink href="#">
          <Text size="2" color="blue" className={pretendard.className}>
            {children}
          </Text>
        </LocalizedLink>
      </Dialog.Trigger>

      <Dialog.Content maxWidth="450px" className={pretendard.className}>
        <Dialog.Title>
          <Text className={pretendard.className} weight="bold">
            {children}
          </Text>
        </Dialog.Title>

        <Flex direction="column" gap="3">
          <Text size="3" mb="1" weight="bold" className={pretendard.className}>
            Bitmap Production™ Website
          </Text>
          <Box asChild px="4">
            <ul style={{ listStyleType: "disc" }}>
              <li>
                <Text size="2">Frontend: Next.js (React)</Text>
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
                <Text size="2">Fonts: Pretendard, Inter, JetBrains Mono</Text>
              </li>
              <li>
                <Text size="2">Icons: Lucide</Text>
              </li>
              <li>
                <Text size="2">API Communication: Axios</Text>
              </li>
              <li>
                <Text size="2">Markdown: Monaco Editor, react-markdown</Text>
              </li>
              <li>
                <Text size="2">Animation: Framer Motion</Text>
              </li>
            </ul>
          </Box>
          <Text>
            Visit{" "}
            <LocalizedLink href="https://github.com/bmplatina/bitmap-v0" target="_blank">
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
  );
}

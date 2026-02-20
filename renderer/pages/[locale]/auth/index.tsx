import { Button, Flex, Text } from "@radix-ui/themes";
import { Card, CardTitle, CardHeader, CardContent } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "next-i18next";
import BitmapLogo from "@/public/bitmaplogo-notext.png";
import { Separator } from "@/components/ui/separator";
import LoginElements from "@/components/common/authenticate/login";

export default function AccountPage() {
  const { t } = useTranslation("Authentication");

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-250px)] p-4 md:p-6 text-center">
      <Flex
        direction="column"
        gap="4"
        align="center"
        className="w-full max-w-md"
      >
        <Flex gap="2">
          <Image
            src={BitmapLogo}
            alt="Bitmap Logo"
            width={32}
            height={32}
            className="invert dark:invert-0 object-contain"
          />
          <Text size="8" weight="bold">
            Bitmap ID
          </Text>
        </Flex>

        <Text as="p" size="4" color="gray">
          {t("bitmap-id-desc")}
        </Text>

        <Flex direction="column" gap="4" className="w-full">
          <Card>
            <CardHeader>
              <CardTitle>{t("login")}</CardTitle>
            </CardHeader>
            <CardContent>
              <LoginElements />
            </CardContent>
          </Card>

          <Separator />

          <Card>
            <CardHeader>
              <CardTitle>{t("other-login-methods")}</CardTitle>
            </CardHeader>
            <CardContent>
              <Flex direction="column" gap="2">
                <Button size="3" asChild>
                  <Link href="https://api.prodbybitmap.com/auth/google">
                    <Image
                      src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg"
                      alt="Google"
                      width={20}
                      height={20}
                      style={{ marginRight: "4px" }}
                    />
                    {t("login-google")}
                  </Link>
                </Button>
              </Flex>
            </CardContent>
          </Card>
        </Flex>
      </Flex>
    </div>
  );
}

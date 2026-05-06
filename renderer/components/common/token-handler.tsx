import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { Button, Flex, Text } from "@radix-ui/themes";
import { useTranslation } from "next-i18next";
import { useGameInstallManager } from "@/lib/GameInstallManagerContext";
import { cn } from "@/lib/utils";
import EmailVerificationDialog from "@/components/accounts/email-verification";

export default function TokenHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { login, logout, bIsEmailVerified, bIsLoggedIn, username } = useAuth();
  const { bIsMac } = useGameInstallManager();
  const { t } = useTranslation("Authentication");
  const [bIsVerificationClicked, setIsVerificationClicked] =
    useState<boolean>(false);

  useEffect(() => {
    const token = searchParams.get("token");

    if (token) {
      login(token);
      router.replace("/");
    }
  }, [searchParams, router, login]);

  if (!bIsEmailVerified && bIsLoggedIn) {
    return (
      <div className="h-12 bg-background border-b flex items-center px-4 w-full relative z-50 apple-blur">
        <div
          className={cn("mr-auto text-sm md:text-base", bIsMac && "ml-[80px]")}
        >
          <Text weight="bold">{username}</Text>
          <Text wrap="pretty">{t("email-verification-incomplete-top")}</Text>
        </div>

        <Flex gap="2">
          <Button onClick={() => setIsVerificationClicked(true)} radius="full">
            <Text>{t("verify")}</Text>
          </Button>
          <div className="hidden md:block">
            <Button onClick={() => logout()} radius="full" variant="outline">
              <Text>{t("logout")}</Text>
            </Button>
          </div>
        </Flex>

        <EmailVerificationDialog
          open={bIsVerificationClicked}
          openHandle={setIsVerificationClicked}
        />
      </div>
    );
  }
  return null;
}

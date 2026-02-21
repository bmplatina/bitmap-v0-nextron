import { getStaticPaths, makeStaticProperties } from "@/lib/get-static";
"use client";

import { useEffect, type KeyboardEvent } from "react";
import { Button, Flex, Spinner, Text } from "@radix-ui/themes";
import { Card, CardTitle, CardHeader, CardContent } from "@/components/ui/card";
import { useAuth } from "@/lib/AuthContext";
import { useTranslation } from "next-i18next";
import { ProfileList } from "@/components/accounts/profile";

export default function AccountPage() {
  const { t } = useTranslation("Authentication");

  const { logout } = useAuth();

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      // handleLogin();
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-160px)] p-4 md:p-6 text-center">
      <Flex direction="column" gap="4" className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Bitmap ID</CardTitle>
          </CardHeader>
          <CardContent>
            <ProfileList />
            <Flex direction="column" gap="2" className="mt-3">
              <Button size="3" onClick={logout}>
                {t("logout")}
              </Button>
            </Flex>
          </CardContent>
        </Card>
      </Flex>
    </div>
  );
}

export const getStaticProps = makeStaticProperties(["Authentication","Sidebar","common"]);
export { getStaticPaths };

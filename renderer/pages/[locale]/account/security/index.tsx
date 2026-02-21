import { getStaticPaths, makeStaticProperties } from "@/lib/get-static";
"use client";

import { useState, useEffect, type KeyboardEvent } from "react";
import {
  Checkbox,
  Button,
  Flex,
  Spinner,
  Text,
  Dialog,
} from "@radix-ui/themes";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardTitle,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import Image from "next/image";
import { TextField } from "@radix-ui/themes";
import { useAuth } from "@/lib/AuthContext";
import { Link, useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import MultiLineText from "@/components/common/multi-line-text";
import { ProfileList } from "@/components/accounts/profile";

export default function AccountEdit() {
  const { t } = useTranslation("AccountEdit");
  const router = useRouter();

  const { bIsLoggedIn, isLoading, bIsTeammate } = useAuth();

  const [bIsAccountEditModalOpened, setIsAccountEditModalOpened] =
    useState<boolean>(false);

  useEffect(
    function () {
      if (!isLoading) {
        if (!bIsLoggedIn) {
          router.push("/auth");
        }
      }
    },
    [isLoading, bIsLoggedIn],
  );

  if (isLoading) return <Spinner />;

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Flex direction="column" gap="3">
        <Card>
          <CardHeader>
            <CardTitle>{t("account-edit")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ProfileList />
          </CardContent>
          <CardFooter>
            <Button onClick={() => setIsAccountEditModalOpened(true)}>
              {t("edit")}
            </Button>
            <AccountInfoEditor
              bIsOpened={bIsAccountEditModalOpened}
              onOpenChange={setIsAccountEditModalOpened}
            />
          </CardFooter>
        </Card>
      </Flex>
    </div>
  );
}

interface DialogOpenProp {
  bIsOpened?: boolean;
  onOpenChange: (open: boolean) => void;
}

function AccountInfoEditor({
  bIsOpened = false,
  onOpenChange,
}: DialogOpenProp) {
  const { t } = useTranslation("AccountEdit");
  const { username } = useAuth();

  return (
    <Dialog.Root open={bIsOpened} onOpenChange={onOpenChange}>
      <Dialog.Content maxWidth="450px">
        <Dialog.Title>{t("account-edit")}</Dialog.Title>
        <Dialog.Description size="2" mb="4">
          Make changes to your profile.
        </Dialog.Description>

        <Flex direction="column" gap="3">
          <label>
            <Text as="div" size="2" mb="1" weight="bold">
              Username
            </Text>
            <TextField.Root
              defaultValue={username}
              placeholder={t("username-edit")}
            />
          </label>
          <label>
            <Text as="div" size="2" mb="1" weight="bold">
              Password
            </Text>
            <TextField.Root placeholder={t("password-edit")} type="password" />
          </label>
        </Flex>

        <Flex gap="3" mt="4" justify="end">
          <Dialog.Close>
            <Button variant="soft" color="gray">
              Cancel
            </Button>
          </Dialog.Close>
          <Dialog.Close>
            <Button>Save</Button>
          </Dialog.Close>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}

export const getStaticProps = makeStaticProperties(["AccountEdit","Sidebar","common"]);
export { getStaticPaths };

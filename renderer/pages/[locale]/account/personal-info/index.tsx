import { getStaticPaths, makeStaticProperties } from "@/lib/get-static";
"use client";

import { useState, useEffect, type KeyboardEvent } from "react";
import { Button, Flex, Text, Dialog, Spinner } from "@radix-ui/themes";
import {
  Card,
  CardTitle,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { pretendard } from "@/lib/utils";
import { TextField } from "@radix-ui/themes";
import { useAuth } from "@/lib/AuthContext";
import { useTranslation } from "next-i18next";
import { editProfileElement } from "@/lib/auth";
import { ProfileList } from "@/components/accounts/profile";
import ProfilePicsEditor from "@/components/accounts/profile-pics-editor";

export default function AccountEdit() {
  const { t } = useTranslation("AccountEdit");

  const [bIsAccountEditModalOpened, setIsAccountEditModalOpened] =
    useState<boolean>(false);

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
  const { username, avatarUri, isLoading, fetchUser } = useAuth();

  const [newUsername, setNewUsername] = useState(username);
  const [newAvatarUri, setNewAvatarUri] = useState(avatarUri);

  const [message, setMessage] = useState("");
  const [postStatus, setPostStatus] = useState<
    "success" | "error" | "waiting" | "posting"
  >("waiting");

  async function postChanges() {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    try {
      setPostStatus("posting");
      const responseAvatarUri = await editProfileElement(
        "avatarUri",
        token,
        newAvatarUri,
      );
      const responseUsername = await editProfileElement(
        "username",
        token,
        newUsername,
      );
      await fetchUser(token);
      setPostStatus("success");
      onOpenChange(false);
    } catch (error: any) {
      setMessage(error.message || "Failed to update profile");
      setPostStatus("error");
    }
  }

  useEffect(
    function () {
      if (!isLoading) setNewAvatarUri(avatarUri);
    },
    [isLoading],
  );

  return (
    <Dialog.Root open={bIsOpened}>
      <Dialog.Content maxWidth="450px" className={pretendard.className}>
        <Dialog.Title>{t("account-edit")}</Dialog.Title>
        <Dialog.Description size="2" mb="4">
          {t("personal-info-edit")}
        </Dialog.Description>

        <Flex direction="column" gap="3">
          <label>
            <Text as="div" size="2" mb="1" weight="bold">
              {t("id")}
            </Text>
            <TextField.Root
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder={t("username-edit")}
            />
          </label>
          <ProfilePicsEditor username={username} profileUri={setNewAvatarUri} />
          <Text color={postStatus === "error" ? "red" : undefined}>
            {message}
          </Text>
        </Flex>

        <Flex gap="3" mt="4" justify="end">
          <Dialog.Close>
            <Button
              variant="soft"
              color="gray"
              onClick={() => onOpenChange(false)}
            >
              <div className={pretendard.className}>Cancel</div>
            </Button>
          </Dialog.Close>
          <Dialog.Close>
            <Button onClick={postChanges}>
              {postStatus === "posting" ? (
                <Spinner />
              ) : (
                <div className={pretendard.className}>Save</div>
              )}
            </Button>
          </Dialog.Close>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}

export const getStaticProps = makeStaticProperties(["AccountEdit","Sidebar","common"]);
export { getStaticPaths };

"use client";

import { useState, useRef, ChangeEvent } from "react";
import { Avatar, Button, Flex, IconButton, Text } from "@radix-ui/themes";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { useAuth } from "@/lib/AuthContext";
import { useTranslation } from "next-i18next";
import { getApiLinkByPurpose } from "@/lib/utils";
import { uploadProfilePics } from "@/lib/auth";

interface UsernameProps {
  username?: string;
  profileUri: (uri: string) => void;
}

export default function ProfilePicsEditor({
  username,
  profileUri,
}: UsernameProps) {
  const { t } = useTranslation("Authentication");
  const { username: authUsername, avatarUri } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [displayedUsername, setDisplayedUsername] = useState(
    username || authUsername,
  );
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);

      const token = localStorage.getItem("accessToken");
      if (!token) return;

      const formData = new FormData();
      formData.append("image", file);

      try {
        const response = await uploadProfilePics(
          window.bitmapApi,
          formData,
          token,
        );

        if (response) profileUri(response.uri);
      } catch (error) {
        console.error("Profile image upload failed:", error);
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("profile-pics")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
        <Flex direction="column" align="center" gap="3" className="my-4">
          <IconButton
            variant="ghost"
            radius="full"
            onClick={() => fileInputRef.current?.click()}
          >
            <Avatar
              src={previewUrl || avatarUri}
              fallback={displayedUsername?.charAt(0) || "?"}
              size="6"
              radius="full"
            />
          </IconButton>
          <Text as="label" size="5" weight="bold">
            {displayedUsername}
          </Text>
          <Button variant="ghost" onClick={() => fileInputRef.current?.click()}>
            <Text color="gray">{t("profile-pics-click")}</Text>
          </Button>
        </Flex>
      </CardContent>
    </Card>
  );
}

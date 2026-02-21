"use client";

import { useEffect, useState } from "react";
import { Flex, Text } from "@radix-ui/themes";
import { ProfileList } from "../accounts/profile";
import { getProfile } from "@/lib/auth";
import { UserProfile } from "@/lib/types";
import { useTranslation } from "next-i18next";

interface UidProps {
  uid: string;
}

export default function MembershipKickHandler({ uid }: UidProps) {
  const { t } = useTranslation("Admin");
  const [user, setUser] = useState<UserProfile>({
    id: 0,
    username: "",
    email: "",
    isAdmin: false,
    isDeveloper: false,
    isTeammate: false,
    avatarUri: "",
    createdAt: new Date().toISOString(),
    google_id: "",
    uid: "",
    isEmailVerified: false,
  });

  useEffect(() => {
    getProfile(window.bitmapApi, undefined, uid).then((user) => {
      console.log("Queried user:", user);
      setUser(user);
    });
  }, [uid]);

  return (
    <Flex className="md:p-6" direction="column" gap="4">
      <Text size="7" weight="bold">
        {t("kick-from-team", { username: user.username, email: user.email })}
      </Text>
      <ProfileList
        username={user.username}
        email={user.email}
        bIsAdmin={user.isAdmin}
        bIsDeveloper={user.isDeveloper}
        bIsTeammate={user.isTeammate}
        bIsEmailVerified={user.isEmailVerified}
        avatarUri={user.avatarUri}
      />
    </Flex>
  );
}

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { useTranslation } from "next-i18next";
import { Button, Spinner, Text } from "@radix-ui/themes";
import { useRouter } from "next/router";
import {
  grantMembershipApplyByUid,
  grantMembershipLeavingByUid,
} from "@/lib/permissions";

interface GrantProps {
  uid: string;
  action: "apply" | "leave";
  bIsApproved?: boolean;
}

export default function GrantButton({ uid, action, bIsApproved }: GrantProps) {
  const { t } = useTranslation("BitmapTeammate");
  const router = useRouter();
  const [bIsApproving, setIsApproving] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");

  const { isLoading, bIsAdmin } = useAuth();

  async function handleApprove() {
    try {
      setIsApproving(true);
      const token = await window.bitmapApi.getToken();
      if (!token) throw Error("invalid-token");
      const response =
        action === "apply"
          ? await grantMembershipApplyByUid(window.bitmapApi, token, uid)
          : await grantMembershipLeavingByUid(window.bitmapApi, token, uid);

      setSubmitMessage(t(response));
      router.replace(router.asPath);
    } catch (e: any) {
      console.error(e);
      setSubmitMessage(t(e.message));
    } finally {
      setIsApproving(false);
    }
  }

  useEffect(
    function () {
      if (!isLoading) {
        if (!bIsAdmin) {
          router.push("/");
        }
      }
    },
    [isLoading, bIsAdmin],
  );

  return (
    <>
      <Button onClick={handleApprove} disabled={bIsApproved}>
        {bIsApproving ? (
          <Spinner />
        ) : (
          <>
            {action === "apply"
              ? t("approve-application")
              : t("approve-leaving")}
          </>
        )}
      </Button>
      {submitMessage && (
        <Text color="red" as="p">
          {submitMessage}
        </Text>
      )}
    </>
  );
}

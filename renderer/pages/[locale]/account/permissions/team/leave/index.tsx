"use client";

import { useState, useEffect, type KeyboardEvent } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/lib/AuthContext";
import {
  Button,
  Flex,
  TextField,
  Text,
  RadioGroup,
  TextArea,
  Checkbox,
  Spinner,
} from "@radix-ui/themes";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PreventExit from "@/components/common/prevent-exit";
import MultiLineText from "@/components/common/multi-line-text";
import { useLocale, useTranslations } from "next-intl";
import type { MembershipLeaveRequest } from "@/lib/types";
import { leaveMembership } from "@/lib/permissions";

export default function BitmapQuit() {
  const router = useRouter();
  const locale = useLocale();
  const { t } = useTranslation("BitmapTeammate");
  const { isLoading, bIsTeammate, uid } = useAuth();
  const [bIsAlertRead, setIsAlertRead] = useState(false);

  const [leaveReason, setLeaveReason] = useState("");
  const [satisfaction, setSatisfaction] = useState<string>("");

  const [bIsSubmitting, setIsSubmitting] = useState(false);
  const [submitFailMessage, setSubmitFailMessage] = useState("0");

  async function handleLeaving() {
    try {
      setIsSubmitting(true);
      const form: MembershipLeaveRequest = {
        leaveReason,
        satisfaction,
        uid,
        locale,
      };
      const token = localStorage.getItem("accessToken");
      if (token) {
        const res = await leaveMembership(token, form);
        if (res && typeof res === "object") {
          setSubmitFailMessage(res.message);
          // router.push("/account");
        } else {
          setSubmitFailMessage("unknown-error");
        }
      }
    } catch (error: any) {
      setSubmitFailMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  useEffect(
    function () {
      if (!isLoading) {
        if (!bIsTeammate) {
          router.push("/account/permissions");
        }
      }
    },
    [isLoading, bIsTeammate],
  );

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <PreventExit />
      <Flex direction="column" gap="3">
        <MultiLineText size="7" as="p" weight="bold">
          {t("leave-title")}
        </MultiLineText>
        <MultiLineText as="span" color="gray">
          BMP_QUITREVISION_200315_v01
        </MultiLineText>
        <Card>
          <CardHeader>
            <CardTitle>{t("leave-reason")}</CardTitle>
          </CardHeader>
          <CardContent>
            <TextArea
              placeholder={t("leave-reason")}
              resize="vertical"
              value={leaveReason}
              onChange={(e) => setLeaveReason(e.target.value)}
            />
          </CardContent>
        </Card>
        <Separator />
        <Card>
          <CardHeader>
            <CardTitle>{t("bitmap-satisfaction")}</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup.Root
              defaultValue="5"
              name="example"
              value={satisfaction}
              onValueChange={setSatisfaction}
            >
              <RadioGroup.Item value="1">{t("satisfaction-1")}</RadioGroup.Item>
              <RadioGroup.Item value="2">{t("satisfaction-2")}</RadioGroup.Item>
              <RadioGroup.Item value="3">{t("satisfaction-3")}</RadioGroup.Item>
              <RadioGroup.Item value="4">{t("satisfaction-4")}</RadioGroup.Item>
              <RadioGroup.Item value="5">{t("satisfaction-5")}</RadioGroup.Item>
            </RadioGroup.Root>
          </CardContent>
        </Card>
        <Separator />
        <MultiLineText>{t("leave-alert")}</MultiLineText>

        <Text as="label" size="2">
          <Flex gap="2">
            <Checkbox
              checked={bIsAlertRead}
              onCheckedChange={(checked) => setIsAlertRead(checked as boolean)}
            />
            {t("leave-alert-checkbox")}
          </Flex>
        </Text>
        <Button disabled={!bIsAlertRead} onClick={handleLeaving}>
          {bIsSubmitting ? <Spinner /> : t("submit")}
        </Button>
        <Text color="red" as="p">
          {t(submitFailMessage)}
        </Text>
      </Flex>
    </div>
  );
}

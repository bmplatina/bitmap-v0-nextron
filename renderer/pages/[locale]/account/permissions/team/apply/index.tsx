"use client";

import { useState, useEffect, type KeyboardEvent } from "react";
import {
  CheckboxGroup,
  Button,
  Flex,
  Spinner,
  Text,
  TextField,
  TextArea,
} from "@radix-ui/themes";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardTitle,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Link as LinkIcon, User, Youtube, Building2 } from "lucide-react";
import type { MembershipApplyRequest } from "@/lib/types";
import { applyMembership } from "@/lib/permissions";
import { useAuth } from "@/lib/AuthContext";
import { Link, useRouter } from "next/router";
import { useTranslations, useLocale } from "next-intl";
import MultiLineText from "@/components/common/multi-line-text";
import PreventExit from "@/components/common/prevent-exit";

export default function BitmapApply() {
  const { t } = useTranslation("BitmapTeammate");
  const router = useRouter();
  const locale = useLocale();

  const { isLoading, bIsTeammate, uid, avatarUri } = useAuth();

  const [name, setName] = useState("");
  const [alias, setAlias] = useState("");
  const [age, setAge] = useState(17);
  const [introduction, setIntroduction] = useState("");
  const [motivation, setMotivation] = useState("");
  const [affiliation, setAffiliation] = useState("");
  const [workingField, setWorkingField] = useState<Array<string>>([]);
  const [prodTools, setProdTools] = useState("");
  const [workSubmission, setWorkSubmission] = useState("");
  const [ytChannelHandle, setYtChannelHandle] = useState("");
  const [position, setPosition] = useState("");

  const [bIsSubmitting, setIsSubmitting] = useState(false);
  const [submitFailMessage, setSubmitFailMessage] = useState("");

  function getIsSubmittable(): boolean {
    const verifyName = name.length > 0;
    const verifyAlias = alias.length > 0;
    const verifyAge = age >= 17;
    const verifyIntroduction = introduction.length > 0;
    const verifyMotivation = motivation.length > 0;
    const verifyAffiliation = affiliation.length > 0;
    const verifyWorkingField = workingField.length > 0;
    const verifyProdTools = prodTools.length > 0;
    const verifyWorkSubmission = workSubmission.length > 0;
    const verifyYtChannelHandle = ytChannelHandle.length > 0;
    const verifyPosition = position.length > 0;

    return (
      verifyName &&
      verifyAlias &&
      verifyAge &&
      verifyIntroduction &&
      verifyMotivation &&
      verifyAffiliation &&
      verifyWorkingField &&
      verifyProdTools &&
      verifyWorkSubmission &&
      verifyYtChannelHandle &&
      verifyPosition
    );
  }

  async function handleApplication() {
    try {
      setIsSubmitting(true);
      const form: MembershipApplyRequest = {
        name,
        alias,
        age,
        introduction,
        motivation,
        affiliate: affiliation,
        field: workingField,
        prodTools,
        portfolio: workSubmission,
        youtubeHandle: ytChannelHandle,
        position,
        uid,
        locale,
        avatarUri: avatarUri || "",
      };
      const token = localStorage.getItem("accessToken");
      if (token) {
        const res = await applyMembership(token, form);
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
        if (bIsTeammate) {
          router.push("/account/permissions");
        }
      }
    },
    [isLoading, bIsTeammate],
  );

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <PreventExit />
      <Flex direction="column" gap="5">
        <MultiLineText size="7" as="p" weight="bold">
          {t("apply-title")}
        </MultiLineText>
        <MultiLineText as="span" color="gray">
          BMP_JOINREVISION_260129_v08
        </MultiLineText>
        <Card>
          <CardHeader>
            <CardTitle>{t("personal-info")}</CardTitle>
          </CardHeader>
          <CardContent>
            <Flex direction="column" gap="5">
              <Flex direction="column" gap="2">
                <Text as="label" weight="bold" size="5">
                  {t("name")}
                </Text>
                <TextField.Root
                  placeholder={t("name")}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                >
                  <TextField.Slot>
                    <User height="16" width="16" />
                  </TextField.Slot>
                </TextField.Root>
              </Flex>
              <Separator />
              <Flex direction="column" gap="2">
                <Text as="label" weight="bold" size="5">
                  {t("alias")}
                </Text>
                <TextField.Root
                  placeholder={t("alias")}
                  value={alias}
                  onChange={(e) => setAlias(e.target.value)}
                >
                  <TextField.Slot>
                    <User height="16" width="16" />
                  </TextField.Slot>
                </TextField.Root>
              </Flex>
              <Separator />
              <Flex direction="column" gap="2">
                <Text as="label" weight="bold" size="5">
                  {t("age")}
                </Text>
                <TextField.Root
                  placeholder={t("age")}
                  type="number"
                  min="17"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                >
                  <TextField.Slot>
                    <User height="16" width="16" />
                  </TextField.Slot>
                </TextField.Root>
              </Flex>
            </Flex>
          </CardContent>
        </Card>

        <Separator />

        <Card>
          <CardHeader>
            <CardTitle>{t("self-promotion")}</CardTitle>
          </CardHeader>
          <CardContent>
            <Flex direction="column" gap="5">
              <Flex direction="column" gap="2">
                <Text as="label" weight="bold" size="5">
                  {t("introduction")}
                </Text>
                <TextArea
                  placeholder={t("introduction")}
                  resize="vertical"
                  value={introduction}
                  onChange={(e) => setIntroduction(e.target.value)}
                />
              </Flex>

              <Separator />

              <Flex direction="column" gap="2">
                <Text as="label" weight="bold" size="5">
                  {t("motivation")}
                </Text>
                <TextArea
                  placeholder={t("motivation")}
                  resize="vertical"
                  value={motivation}
                  onChange={(e) => setMotivation(e.target.value)}
                />
              </Flex>

              <Separator />

              <Flex direction="column" gap="2">
                <Text as="label" weight="bold" size="5">
                  {t("affiliation")}
                </Text>
                <TextArea
                  placeholder={t("affiliation")}
                  value={affiliation}
                  onChange={(e) => setAffiliation(e.target.value)}
                />
              </Flex>
            </Flex>
          </CardContent>
        </Card>

        <Separator />

        <Card>
          <CardHeader>
            <CardTitle>{t("field")}</CardTitle>
          </CardHeader>
          <CardContent>
            <Flex direction="column" gap="5">
              <Flex direction="column" gap="2">
                <Text as="label" weight="bold" size="5">
                  {t("working-field")}
                </Text>
                <CheckboxGroup.Root
                  name="Working Fields"
                  value={workingField}
                  onValueChange={setWorkingField}
                >
                  <CheckboxGroup.Item value="1">
                    {t("vp-post")}
                  </CheckboxGroup.Item>
                  <CheckboxGroup.Item value="2">
                    {t("vp-mograph")}
                  </CheckboxGroup.Item>
                  <CheckboxGroup.Item value="3">
                    {t("illustration")}
                  </CheckboxGroup.Item>
                  <CheckboxGroup.Item value="4">
                    {t("music-produce")}
                  </CheckboxGroup.Item>
                  <CheckboxGroup.Item value="5">
                    {t("dev-web")}
                  </CheckboxGroup.Item>
                  <CheckboxGroup.Item value="6">
                    {t("dev-app")}
                  </CheckboxGroup.Item>
                  <CheckboxGroup.Item value="7">
                    {t("dev-game")}
                  </CheckboxGroup.Item>
                </CheckboxGroup.Root>
              </Flex>

              <Separator />

              <Flex direction="column" gap="2">
                <Text as="label" weight="bold" size="5">
                  {t("prod-tools")}
                </Text>
                <TextArea
                  placeholder={t("prod-tools")}
                  resize="vertical"
                  value={prodTools}
                  onChange={(e) => setProdTools(e.target.value)}
                />
              </Flex>

              <Separator />

              <Flex direction="column" gap="2">
                <Text as="label" weight="bold" size="5">
                  {t("work-submission")}
                </Text>
                <TextField.Root
                  placeholder={t("work-submission")}
                  type="text"
                  value={workSubmission}
                  onChange={(e) => setWorkSubmission(e.target.value)}
                >
                  <TextField.Slot>
                    <LinkIcon height="16" width="16" />
                  </TextField.Slot>
                </TextField.Root>
              </Flex>
            </Flex>
          </CardContent>
        </Card>

        <Separator />

        <Card>
          <CardHeader>
            <CardTitle>{t("bitmap-about-expose")}</CardTitle>
          </CardHeader>
          <CardContent>
            <Flex direction="column" gap="5">
              <Flex direction="column" gap="2">
                <Text as="label" weight="bold" size="5">
                  {t("yt-channel-handle")}
                </Text>
                <Text>{t("yt-channel-handle-desc")}</Text>
                <TextField.Root
                  placeholder={t("yt-channel-handle")}
                  value={ytChannelHandle}
                  onChange={(e) => setYtChannelHandle(e.target.value)}
                >
                  <TextField.Slot>
                    <Youtube height="16" width="16" />
                  </TextField.Slot>
                </TextField.Root>
              </Flex>

              <Separator />

              <Flex direction="column" gap="2">
                <Text as="label" weight="bold" size="5">
                  {t("position")}
                </Text>
                <TextField.Root
                  placeholder={t("position")}
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                >
                  <TextField.Slot>
                    <Building2 height="16" width="16" />
                  </TextField.Slot>
                </TextField.Root>
              </Flex>
            </Flex>
          </CardContent>
        </Card>

        <Separator />

        <Button
          onClick={handleApplication}
          disabled={bIsSubmitting || !getIsSubmittable()}
        >
          {bIsSubmitting ? <Spinner /> : t("submit")}
        </Button>
        <Text color="red" as="p">
          {t(submitFailMessage)}
        </Text>
      </Flex>
    </div>
  );
}

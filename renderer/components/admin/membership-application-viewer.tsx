import {
  CheckboxGroup,
  Flex,
  Text,
  TextField,
  TextArea,
  RadioGroup,
} from "@radix-ui/themes";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardTitle,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { User, Youtube, Building2 } from "lucide-react";
import type { MembershipApplies, MembershipLeaves } from "@/lib/types";
import LocalizedLink from "@/components/common/localized-link";
import { useTranslation } from "next-i18next";
import MultiLineText from "@/components/common/multi-line-text";
import GrantButton from "./membership-approve-btn";

interface MembershipApplicationProps {
  applyContent: MembershipApplies;
}

export default function MembershipApplicationViewer({
  applyContent,
}: MembershipApplicationProps) {
  const { t, i18n } = useTranslation("BitmapTeammate");
  const locale = i18n.language;

  return (
    <div className="container mx-auto p-6 max-w-4xl">
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
                <Text as="p">{}</Text>
                <TextField.Root
                  placeholder={t("name")}
                  value={applyContent.name}
                  disabled
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
                  value={applyContent.alias}
                  disabled
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
                  value={applyContent.age}
                  disabled
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
                  value={applyContent.introduction}
                  disabled
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
                  value={applyContent.motivation}
                  disabled
                />
              </Flex>

              <Separator />

              <Flex direction="column" gap="2">
                <Text as="label" weight="bold" size="5">
                  {t("affiliation")}
                </Text>
                <TextArea
                  placeholder={t("affiliation")}
                  value={applyContent.affiliate}
                  disabled
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
                  value={applyContent.field}
                  disabled
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
                  value={applyContent.prodTools}
                  disabled
                />
              </Flex>

              <Separator />

              <Flex direction="column" gap="2">
                <Text as="label" weight="bold" size="5">
                  {t("work-submission")}
                </Text>
                <LocalizedLink
                  href={applyContent.portfolio}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Text>{applyContent.portfolio}</Text>
                </LocalizedLink>
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
                  value={applyContent.youtubeHandle}
                  disabled
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
                  value={applyContent.position}
                  disabled
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

        <GrantButton
          uid={applyContent.uid}
          action="apply"
          bIsApproved={applyContent.isApproved}
        />
      </Flex>
    </div>
  );
}

interface MembershipLeavingProps {
  leaveContent: MembershipLeaves;
}

function MembershipLeaveViewer({ leaveContent }: MembershipLeavingProps) {
  const { t, i18n } = useTranslation("BitmapTeammate");
  const locale = i18n.language;

  return (
    <div className="container mx-auto p-6 max-w-4xl">
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
              value={leaveContent.leaveReason}
              disabled
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
              value={leaveContent.satisfaction}
              disabled
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
        <GrantButton uid={leaveContent.uid} action="leave" />
      </Flex>
    </div>
  );
}

export { MembershipApplicationViewer, MembershipLeaveViewer };

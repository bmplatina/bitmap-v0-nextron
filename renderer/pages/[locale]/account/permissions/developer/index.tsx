import { getStaticPaths, makeStaticProperties } from "@/lib/get-static";
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
import { Link as LinkIcon, User } from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/lib/AuthContext";
import { Link, useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import MultiLineText from "@/components/common/multi-line-text";

export default function BitmapDeveloperApply() {
  const { t } = useTranslation("BitmapTeammate");
  const router = useRouter();

  const { isLoading, bIsDeveloper } = useAuth();

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
    }
  };

  useEffect(
    function () {
      if (!isLoading) {
        if (bIsDeveloper) {
          router.push("/auth");
        }
      }
    },
    [isLoading, bIsDeveloper],
  );

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Flex direction="column" gap="3">
        <MultiLineText size="7" as="p" weight="bold">
          {t("apply-title")}
        </MultiLineText>
        <MultiLineText as="span" color="gray">
          BMP_JOINREVISION_260129_v08
        </MultiLineText>
        <Card>
          <CardHeader>
            <CardTitle>{t("name")}</CardTitle>
          </CardHeader>
          <CardContent>
            <TextField.Root placeholder={t("name")}>
              <TextField.Slot>
                <User height="16" width="16" />
              </TextField.Slot>
            </TextField.Root>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t("age")}</CardTitle>
          </CardHeader>
          <CardContent>
            <TextField.Root placeholder={t("age")} type="number" min="17">
              <TextField.Slot>
                <User height="16" width="16" />
              </TextField.Slot>
            </TextField.Root>
          </CardContent>
        </Card>
        <Separator />
        <Card>
          <CardHeader>
            <CardTitle>{t("introduction")}</CardTitle>
          </CardHeader>
          <CardContent>
            <TextArea placeholder="Reply to comment…" resize="vertical" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t("motivation")}</CardTitle>
          </CardHeader>
          <CardContent>
            <TextArea placeholder="Reply to comment…" resize="vertical" />
          </CardContent>
        </Card>
        <Separator />
        <Card>
          <CardHeader>
            <CardTitle>{t("working-field")}</CardTitle>
          </CardHeader>
          <CardContent>
            <CheckboxGroup.Root name="Working Fields">
              <CheckboxGroup.Item value="1">{t("vp-post")}</CheckboxGroup.Item>
              <CheckboxGroup.Item value="2">
                {t("vp-mograph")}
              </CheckboxGroup.Item>
              <CheckboxGroup.Item value="3">
                {t("illustration")}
              </CheckboxGroup.Item>
              <CheckboxGroup.Item value="4">
                {t("music-produce")}
              </CheckboxGroup.Item>
              <CheckboxGroup.Item value="5">{t("dev-web")}</CheckboxGroup.Item>
              <CheckboxGroup.Item value="6">{t("dev-app")}</CheckboxGroup.Item>
              <CheckboxGroup.Item value="7">{t("dev-game")}</CheckboxGroup.Item>
            </CheckboxGroup.Root>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t("prod-tools")}</CardTitle>
          </CardHeader>
          <CardContent>
            <TextArea placeholder="Reply to comment…" />
          </CardContent>
        </Card>
        <Separator />
        <Card>
          <CardHeader>
            <CardTitle>{t("affiliation")}</CardTitle>
          </CardHeader>
          <CardContent>
            <TextArea placeholder="Reply to comment…" />
          </CardContent>
        </Card>
        <Separator />
        <Card>
          <CardHeader>
            <CardTitle>{t("work-submission")}</CardTitle>
          </CardHeader>
          <CardContent>
            <TextField.Root
              placeholder="Search the docs…"
              type="number"
              min="17"
            >
              <TextField.Slot>
                <LinkIcon height="16" width="16" />
              </TextField.Slot>
            </TextField.Root>
          </CardContent>
        </Card>
        <Separator />
        <Button>{t("submit")}</Button>
      </Flex>
    </div>
  );
}

export const getStaticProps = makeStaticProperties(["BitmapTeammate","Sidebar","common"]);
export { getStaticPaths };

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
import Link from "next/link";
import { useTranslation } from "next-i18next";
import MultiLineText from "@/components/common/multi-line-text";
import { ProfileList } from "@/components/accounts/profile";

export default function AccountEdit() {
  const { t } = useTranslation("AccountPermissions");

  const { isLoading, bIsTeammate, bIsDeveloper } = useAuth();

  if (isLoading) return <Spinner />;

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Flex direction="column" gap="3">
        {!!bIsTeammate ? (
          <Card>
            <CardHeader>
              <CardTitle>{t("bitmap-quit")}</CardTitle>
            </CardHeader>
            <CardContent>
              <MultiLineText>{t("bitmap-quit-desc")}</MultiLineText>
            </CardContent>
            <CardFooter>
              <Button asChild>
                <Link href="/account/permissions/team/leave">{t("quit")}</Link>
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>{t("bitmap-apply")}</CardTitle>
            </CardHeader>
            <CardContent>
              <MultiLineText>{t("bitmap-apply-desc")}</MultiLineText>
            </CardContent>
            <CardFooter>
              <Button asChild>
                <Link href="/account/permissions/team/apply">{t("apply")}</Link>
              </Button>
            </CardFooter>
          </Card>
        )}

        {!!!bIsDeveloper && (
          <>
            <Separator />
            <Card>
              <CardHeader>
                <CardTitle>{t("bitmap-developer-enable")}</CardTitle>
              </CardHeader>
              <CardContent>
                <MultiLineText>
                  {t("bitmap-developer-enable-desc")}
                </MultiLineText>
              </CardContent>
              <CardFooter>
                <Button asChild>
                  <Link href="/account/permissions/developer/apply">
                    {t("apply")}
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </>
        )}
      </Flex>
    </div>
  );
}

export const getStaticProps = makeStaticProperties(["AccountPermissions","Sidebar","common"]);
export { getStaticPaths };

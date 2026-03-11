"use client";

import { useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/lib/AuthContext";
import { sendVerifyEmail, verifyEmail } from "@/lib/auth";
import {
  AlertDialog,
  Button,
  Spinner,
  Flex,
  Text,
  TextField,
} from "@radix-ui/themes";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useTranslation } from "next-i18next";

interface EmailVerificationDialogProps {
  open?: boolean;
  openHandle?: (bIsOpened: boolean) => void;
}

export default function EmailVerificationDialog({
  open = true,
  openHandle,
}: EmailVerificationDialogProps) {
  const router = useRouter();

  const { login, logout, email, fetchUser } = useAuth();
  const [verificationCode, setVerificationCode] = useState("");
  const [bIsVerificationMailSending, setIsVerificationMailSending] =
    useState(false);
  const [bIsVerifying, setIsVerifying] = useState(false);
  const [bIsVerificationMailSent, setIsVerificationMailSent] = useState(false);
  const [verificationFailMessage, setVerificationFailMessage] = useState("");
  const {
    i18n: { language: locale },
    t,
  } = useTranslation(["Authentication", "Common"]);

  async function handleSendVerificationEmail() {
    try {
      setIsVerificationMailSending(true);
      const token = await window.bitmapApi.getToken();

      if (!token) throw new Error("token-required");
      const response = await sendVerifyEmail(
        window.bitmapApi,
        locale ?? "en",
        token,
      );
      if (response !== "email-sent") {
        throw Error(response);
      }
      console.log("로그인 이메일 인증 번호 발송 성공");
      setVerificationFailMessage(t(response));
      setIsVerificationMailSent(true);
    } catch (error: any) {
      console.error(error);
      setVerificationFailMessage(t(error.message));
      setIsVerificationMailSent(false);
    } finally {
      setIsVerificationMailSending(false);
    }
  }

  async function handleVerification() {
    try {
      setIsVerifying(true);
      const token = await window.bitmapApi.getToken();

      if (!token) throw new Error("token-required");
      const verifyResult = await verifyEmail(
        window.bitmapApi,
        token,
        verificationCode,
      );
      if (verifyResult !== "verified") {
        throw Error(verifyResult);
      }

      console.log("인증 성공:", verifyResult);

      await fetchUser(token);
      router.push("/");

      // router.push("/");
    } catch (error: any) {
      setVerificationFailMessage(t(error.message));
      alert(t(error.message)); // "username-exists" 등의 메시지 출력
    } finally {
      setIsVerifying(false);
    }
  }

  function enableVerifyButton(): boolean {
    return verificationCode.length === 6;
  }

  return (
    <AlertDialog.Root open={open} onOpenChange={openHandle}>
      <AlertDialog.Content maxWidth="450px">
        <AlertDialog.Title>
          {t("email-verification-incomplete")}
        </AlertDialog.Title>
        <AlertDialog.Description size="2">
          {t("email-verification-incomplete-desc")}
        </AlertDialog.Description>

        <Flex direction="column" gap="3" mt="3">
          <Flex gap="3" width="100%">
            <InputOTP
              disabled={!bIsVerificationMailSent}
              maxLength={6}
              onComplete={(value) => setVerificationCode(value)}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>

            <Button style={{ flex: 4 }} onClick={handleSendVerificationEmail}>
              {bIsVerificationMailSending ? (
                <Spinner />
              ) : (
                <Text wrap="pretty">{t("send-verification-email")}</Text>
              )}
            </Button>
          </Flex>
          {verificationFailMessage && (
            <Text color="red" size="2">
              {verificationFailMessage}
            </Text>
          )}
        </Flex>
        <Flex gap="3" mt="4" justify="end">
          {openHandle && (
            <AlertDialog.Action>
              <Button
                variant="surface"
                color="gray"
                onClick={() => openHandle(false)}
              >
                {t("Common", "cancel")}
              </Button>
            </AlertDialog.Action>
          )}
          <AlertDialog.Action>
            <Button variant="surface" color="gray" onClick={logout}>
              {t("logout")}
            </Button>
          </AlertDialog.Action>
          <AlertDialog.Action>
            <Button
              variant="solid"
              disabled={!enableVerifyButton()}
              onClick={handleVerification}
            >
              {bIsVerifying ? (
                <Spinner />
              ) : (
                <Text wrap="pretty">{t("verify")}</Text>
              )}
            </Button>
          </AlertDialog.Action>
        </Flex>
      </AlertDialog.Content>
    </AlertDialog.Root>
  );
}

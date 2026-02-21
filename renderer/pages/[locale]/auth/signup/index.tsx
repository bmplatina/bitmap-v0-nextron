"use client";

import { useState, useEffect } from "react";
import {
  Avatar,
  Checkbox,
  Code,
  Button,
  Box,
  Flex,
  Spinner,
  Text,
  DataList,
  IconButton,
} from "@radix-ui/themes";
import {
  Card,
  CardTitle,
  CardHeader,
  CardContent,
  CardFooter,
  CardDescription,
} from "@/components/ui/card";
import { ProfileList } from "@/components/accounts/profile";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { TextField, AlertDialog } from "@radix-ui/themes";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { getEula } from "@/lib/general";
import { signup, checkIsEmailDuplicated } from "@/lib/auth";
import { useAuth } from "@/lib/AuthContext";
import ClientMarkdown from "@/components/common/markdown/client-markdown";
import { Separator } from "@radix-ui/themes";
import ProfilePicsEditor from "@/components/accounts/profile-pics-editor";
import EmailVerificationDialog from "@/components/accounts/email-verification";
import { getStaticPaths, makeStaticProperties } from "@/lib/get-static";

export default function Signup() {
  const router = useRouter();
  const { i18n, t } = useTranslation("Authentication");
  const { t: t_common } = useTranslation("common");
  const locale = i18n.language;

  // terms 0 -> idpw 1 -> other-info 2 -> register 3
  const [currentView, setCurrentView] = useState<number>(0);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [avatarUri, setAvatarUri] = useState<string>("");

  const [signupFailMessage, setSignupFailMsg] = useState<string>("");
  const { bIsLoggedIn, login } = useAuth();
  const [eula, setEula] = useState<string>("");
  const [bIsEmailDuplicated, setIsEmailDuplicated] = useState<boolean>(false);
  const [bIsSignupProcessing, setIsSignupProcessing] = useState<boolean>(false);
  const [bIsEmailVerificationDialogOpen, setEmailVerificationDialogOpen] =
    useState<boolean>(false);

  function validateEmail(): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  function validateUsername(): boolean {
    return username.length >= 3 && username.length <= 15;
  }

  function validatePassword(): boolean {
    return password.length >= 8;
  }

  function validatePasswordConfirm(): boolean {
    return passwordConfirm === password;
  }

  function validateUserInfo(setView: boolean): boolean {
    if (
      validateEmail() &&
      validateUsername() &&
      validatePassword() &&
      validatePasswordConfirm() &&
      !bIsEmailDuplicated
    ) {
      if (setView) setCurrentView(2);
      return true;
    }
    return false;
  }

  async function handleSignup() {
    try {
      setIsSignupProcessing(true);
      const signupResult = await signup(
        locale,
        username,
        email,
        password,
        avatarUri,
      );
      console.log("회원가입 성공:", signupResult.username);

      setEmailVerificationDialogOpen(true);

      // const loginResult = await loginPost(email, password);

      // if (loginResult.success) {
      //   await login(loginResult.token);
      // } else {
      //   setSignupFailMsg(t(loginResult.token));
      // }

      // router.push("/");
    } catch (error: any) {
      setSignupFailMsg(t(error.message));
      alert(t(error.message)); // "username-exists" 등의 메시지 출력
    } finally {
      setIsSignupProcessing(false);
    }
  }

  async function handleEmailDuplication(): Promise<boolean> {
    try {
      const result: boolean = await checkIsEmailDuplicated(email);
      return result;
    } catch (error: any) {
      console.log(t(error.message));
      return false;
    }
  }

  useEffect(() => {
    if (bIsLoggedIn) {
      router.push("/account");
    }
    getEula("BitmapEULA").then((payload) => {
      console.log(payload);
      setEula(locale === "ko" ? payload.ko : payload.en);
    });
  }, [bIsLoggedIn, locale]);

  return (
    <div>
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <h1 className="text-4xl font-bold mb-6">Bitmap ID</h1>
        <p className="text-xl mb-8 max-w-2xl">{t("bitmap-id-desc")}</p>
      </div>
      <Box px="4" py="2">
        <Card className="w-full max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>
              <Flex gap="3" align="center">
                {currentView == 0 && (
                  <Text weight={currentView == 0 ? "bold" : "light"}>
                    {t("eula")}
                  </Text>
                )}
                {currentView >= 0 && currentView <= 1 && (
                  <Flex align="center" gap="2">
                    {currentView != 1 && <Separator orientation="vertical" />}
                    <Text weight={currentView == 1 ? "bold" : "light"}>
                      {t("general-info")}
                    </Text>
                  </Flex>
                )}
                {currentView >= 1 && currentView <= 2 && (
                  <Flex align="center" gap="2">
                    {currentView != 2 && <Separator orientation="vertical" />}
                    <Text weight={currentView == 2 ? "bold" : "light"}>
                      {t("personalization")}
                    </Text>
                  </Flex>
                )}
                {currentView >= 2 && (
                  <Flex align="center" gap="2">
                    {currentView != 3 && <Separator orientation="vertical" />}
                    <Text weight={currentView == 3 ? "bold" : "light"}>
                      {t("register")}
                    </Text>
                  </Flex>
                )}
              </Flex>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentView == 0 && (
              <ScrollArea type="always" style={{ height: 300 }}>
                <Box p="2" pr="8">
                  <ScrollBar orientation="horizontal" />
                  <ClientMarkdown content={eula} />
                </Box>
              </ScrollArea>
            )}
            {currentView == 1 && (
              <Flex direction="column" gap="2">
                <Text>{t("email")} *</Text>
                <TextField.Root
                  color={validateEmail() ? undefined : "red"}
                  variant={validateEmail() ? undefined : "soft"}
                  placeholder={t("email")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={async () => {
                    if (validateEmail()) {
                      const isAvailable = await handleEmailDuplication();
                      // 서버에서 사용 가능(true)을 반환하면 중복이 아님(!isAvailable)
                      setIsEmailDuplicated(isAvailable);
                    }
                  }}
                />
                {!validateEmail() && (
                  <Text as="span" color="red">
                    {t("email-rules")}
                  </Text>
                )}
                {bIsEmailDuplicated && (
                  <Text as="span" color="red">
                    {t("email-duplicate")}
                  </Text>
                )}
                <Text>{t("id")} *</Text>
                <TextField.Root
                  color={validateUsername() ? undefined : "red"}
                  variant={validateUsername() ? undefined : "soft"}
                  placeholder={t("id")}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                {!validateUsername() && (
                  <Text as="span" color="red">
                    {t("username-rules")}
                  </Text>
                )}
                <Text>{t("password")} *</Text>
                <TextField.Root
                  color={validatePassword() ? undefined : "red"}
                  variant={validatePassword() ? undefined : "soft"}
                  placeholder={t("password")}
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <TextField.Root
                  color={validatePasswordConfirm() ? undefined : "red"}
                  variant={validatePasswordConfirm() ? undefined : "soft"}
                  placeholder={`${t("password")} ${t("again")}`}
                  type="password"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                />
                {!validatePassword() && (
                  <Text as="span" color="red">
                    {t("password-rules")}
                  </Text>
                )}
                {!validatePasswordConfirm() && (
                  <Text as="span" color="red">
                    {t("password-mismatch")}
                  </Text>
                )}
              </Flex>
            )}
            {currentView == 2 && (
              <div className="space-y-6">
                <ProfilePicsEditor
                  username={username}
                  profileUri={setAvatarUri}
                />
              </div>
            )}
            {currentView == 3 && (
              <ProfileList username={username} email={email} />
            )}
          </CardContent>
          <CardFooter>
            {currentView == 0 && (
              <div>
                <Text as="label" size="3">
                  <Flex as="span" gap="2">
                    <Checkbox
                      checked={agreeTerms}
                      onCheckedChange={(checked) =>
                        setAgreeTerms(checked === true)
                      }
                    />
                    {t("agree-terms")} *
                  </Flex>
                </Text>
                <Button
                  disabled={!agreeTerms}
                  onClick={() => setCurrentView(1)}
                  className="mt-2"
                >
                  {t_common("next")}
                </Button>
              </div>
            )}
            {currentView == 1 && (
              <Flex gap="2">
                <Button onClick={() => setCurrentView(0)} variant="surface">
                  {t_common("back")}
                </Button>
                <Button
                  onClick={() => validateUserInfo(true)}
                  disabled={!validateUserInfo(false)}
                >
                  {t_common("next")}
                </Button>
              </Flex>
            )}
            {currentView == 2 && (
              <Flex gap="2">
                <Button onClick={() => setCurrentView(1)} variant="surface">
                  {t_common("back")}
                </Button>
                <Button onClick={() => setCurrentView(3)}>
                  {t_common("next")}
                </Button>
              </Flex>
            )}
            {currentView == 3 && (
              <div className="flex justify-end space-x-2 pt-4">
                <Flex gap="2">
                  <Button onClick={() => setCurrentView(2)} variant="surface">
                    {t_common("back")}
                  </Button>
                  <Button onClick={handleSignup}>
                    {bIsSignupProcessing ? <Spinner /> : t("register")}
                  </Button>
                  <EmailVerificationDialog
                    open={bIsEmailVerificationDialogOpen}
                    openHandle={setEmailVerificationDialogOpen}
                  />
                </Flex>
              </div>
            )}
            {signupFailMessage && (
              <Text color="red" size="2" className="mt-2">
                {signupFailMessage}
              </Text>
            )}
          </CardFooter>
        </Card>
      </Box>
    </div>
  );
}

export const getStaticProps = makeStaticProperties([
  "Authentication",
  "Sidebar",
  "common",
]);
export { getStaticPaths };

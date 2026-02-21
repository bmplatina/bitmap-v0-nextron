"use client";

import { useState, useEffect, type KeyboardEvent } from "react";
import { Checkbox, Button, Flex, Spinner, Text } from "@radix-ui/themes";
import { TextField } from "@radix-ui/themes";
import { useAuth } from "@/lib/AuthContext";
import { login as loginPost } from "@/lib/auth";
import { useRouter } from "next/router";
import LocalizedLink from "@/components/common/localized-link";
import { useTranslation } from "next-i18next";

export default function LoginElements() {
  const { t } = useTranslation("Authentication");
  const router = useRouter();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [bRequestAutoLogin, setAutoLogin] = useState<boolean>(false);
  const [bIsRequestingLogin, setIsRequestingLogin] = useState<boolean>(false);
  const [loginFailMessage, setLoginFailMsg] = useState<string>("");
  const { isLoading, bIsLoggedIn, login } = useAuth();

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleLogin();
    }
  };

  async function handleLogin() {
    setIsRequestingLogin(true);
    const loginResult = await loginPost(
      email,
      password,
      bRequestAutoLogin,
      window.bitmapApi,
    );
    if (loginResult.success) {
      await login(loginResult.token);
    } else {
      setLoginFailMsg(t(loginResult.token));
    }
    setIsRequestingLogin(false);
  }

  useEffect(
    function () {
      if (!isLoading) {
        if (bIsLoggedIn) {
          router.push("/");
        }
      }
    },
    [isLoading, bIsLoggedIn],
  );

  if (bIsLoggedIn) return null;

  return (
    <Flex direction="column" gap="2">
      <TextField.Root
        placeholder={t("email")}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <TextField.Root
        placeholder={t("password")}
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <Text as="label" size="2">
        <Flex as="span" gap="2">
          <Checkbox
            size="1"
            checked={bRequestAutoLogin}
            onCheckedChange={(checked) => setAutoLogin(checked as boolean)}
          />{" "}
          {t("keep-login")}
        </Flex>
      </Text>
      {loginFailMessage !== "" && (
        <Text color="red" size="3">
          {loginFailMessage}
        </Text>
      )}
      <Button size="3" onClick={handleLogin}>
        {bIsRequestingLogin ? <Spinner /> : <Text>{t("login")}</Text>}
      </Button>

      <LocalizedLink href="/auth/signup">
        <Button variant="ghost">{t("register")}</Button>
      </LocalizedLink>

      <LocalizedLink href="/auth/troubleshoot">
        <Button variant="ghost">{t("troubleshoot-auth")}</Button>
      </LocalizedLink>
    </Flex>
  );
}

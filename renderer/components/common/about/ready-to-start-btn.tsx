"use client";

import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";
import { Button, Flex, Spinner } from "@radix-ui/themes";

export default function ReadyToStartNavigations() {
  const { bIsLoggedIn, bIsTeammate, bIsDeveloper, isLoading } = useAuth();

  return (
    <>
      {isLoading ? (
        <Spinner />
      ) : (
        <>
          {bIsLoggedIn ? (
            <Flex direction="column" gap="2" align="stretch">
              {!bIsTeammate && (
                <Button asChild size="3">
                  <Link href="/account/permissions/team/apply">
                    Apply to Bitmap
                  </Link>
                </Button>
              )}
              {!bIsDeveloper && (
                <Button asChild size="3">
                  <Link href="/account/permissions/developer/apply">
                    Bitmap Developer
                  </Link>
                </Button>
              )}
            </Flex>
          ) : (
            <Flex direction="column" gap="2" align="stretch">
              <Button asChild size="3">
                <Link href="/auth">Signin or Signup</Link>
              </Button>
            </Flex>
          )}
        </>
      )}
    </>
  );
}

import LocalizedLink from "@/components/common/localized-link";
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
                  <LocalizedLink href="/account/permissions/team/apply">
                    Apply to Bitmap
                  </LocalizedLink>
                </Button>
              )}
              {!bIsDeveloper && (
                <Button asChild size="3">
                  <LocalizedLink href="/account/permissions/developer/apply">
                    Bitmap Developer
                  </LocalizedLink>
                </Button>
              )}
            </Flex>
          ) : (
            <Flex direction="column" gap="2" align="stretch">
              <Button asChild size="3">
                <LocalizedLink href="/auth">Signin or Signup</LocalizedLink>
              </Button>
            </Flex>
          )}
        </>
      )}
    </>
  );
}

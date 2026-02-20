import { Button, Flex, Spinner, Text } from "@radix-ui/themes";
import { Card, CardTitle, CardHeader, CardContent } from "@/components/ui/card";
import { useTranslation } from "next-i18next";
import { ProfileList } from "@/components/accounts/profile";
import { getMembers } from "@/lib/general";
import { MembershipApplicationListElement } from "@/components/admin/membership-application-list";

export default function AccountPage() {
  const { t } = useTranslation("Admin");
  const members = await getMembers("approved");

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-160px)] p-4 md:p-6 text-center">
      <Flex direction="column" gap="4" className="w-full max-w-md">
        {members.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>{t("members-list")}</CardTitle>
            </CardHeader>
            <CardContent>
              {members.map((application) => (
                <MembershipApplicationListElement
                  key={application.id}
                  content={application}
                />
              ))}
            </CardContent>
          </Card>
        )}
      </Flex>
    </div>
  );
}

import { getStaticPaths, makeStaticProperties } from "@/lib/get-static";
import {
  Button,
  Flex,
  Text,
  Tabs,
  Badge,
  Grid,
  Heading,
} from "@radix-ui/themes";
import {
  Card,
  CardTitle,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { useTranslation } from "next-i18next";
import { getMembers } from "@/lib/general";
import { getMembershipLeaveReqs } from "@/lib/permissions";
import type { MembershipApplies, MembershipLeaves } from "@/lib/types";
import {
  MembershipApplicationListElement,
  MembershipLeavingRequestListElement,
} from "@/components/admin/membership-application-list";
import { Users, UserPlus, UserMinus } from "lucide-react";

export default function AllMembers() {
  const { t } = useTranslation("Admin");

  const memberRows: MembershipApplies[] = await getMembers("all");
  const approvedMembers = memberRows.filter(
    (g): g is MembershipApplies => g.isApproved,
  );
  const pendingMembers = memberRows.filter(
    (g): g is MembershipApplies => !g.isApproved,
  );

  const leavingReqs: MembershipLeaves[] =
    await getMembershipLeaveReqs(undefined);

  return (
    <div className="container mx-auto p-6 max-w-6xl min-h-[85vh]">
      <Flex direction="column" gap="6">
        <Flex justify="between" align="center">
          <Flex direction="column" gap="1">
            <Text size="8" weight="bold">
              {t("member-manage")}
            </Text>
            <Text color="gray">{t("dashboard")}</Text>
          </Flex>
        </Flex>

        <Grid columns={{ initial: "1", md: "3" }} gap="4">
          <Card>
            <CardContent className="pt-6">
              <Flex align="center" gap="4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full text-blue-600">
                  <Users size={24} />
                </div>
                <div>
                  <Text size="1" color="gray" weight="bold">
                    {t("members-list")}
                  </Text>
                  <Heading size="6">{approvedMembers.length}</Heading>
                </div>
              </Flex>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <Flex align="center" gap="4">
                <div className="p-3 bg-amber-100 dark:bg-amber-900 rounded-full text-amber-600">
                  <UserPlus size={24} />
                </div>
                <div>
                  <Text size="1" color="gray" weight="bold">
                    {t("membership-application")}
                  </Text>
                  <Heading size="6">{pendingMembers.length}</Heading>
                </div>
              </Flex>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <Flex align="center" gap="4">
                <div className="p-3 bg-red-100 dark:bg-red-900 rounded-full text-red-600">
                  <UserMinus size={24} />
                </div>
                <div>
                  <Text size="1" color="gray" weight="bold">
                    {t("membership-leaving-req")}
                  </Text>
                  <Heading size="6">{leavingReqs.length}</Heading>
                </div>
              </Flex>
            </CardContent>
          </Card>
        </Grid>

        <Tabs.Root defaultValue="approved">
          <Card>
            <CardHeader className="pb-0">
              <Tabs.List size="2">
                <Tabs.Trigger value="approved">
                  {t("members-list")}
                  <Badge variant="soft" ml="2">
                    {approvedMembers.length}
                  </Badge>
                </Tabs.Trigger>
                <Tabs.Trigger value="pending">
                  {t("pending")}
                  <Badge variant="soft" color="amber" ml="2">
                    {pendingMembers.length}
                  </Badge>
                </Tabs.Trigger>
                <Tabs.Trigger value="leaving">
                  {t("membership-leaving-req")}
                  <Badge variant="soft" color="red" ml="2">
                    {leavingReqs.length}
                  </Badge>
                </Tabs.Trigger>
              </Tabs.List>
            </CardHeader>
            <CardContent className="p-0">
              <Tabs.Content value="approved">
                <div className="divide-y divide-border">
                  {approvedMembers.length > 0 ? (
                    approvedMembers.map((member) => (
                      <MembershipApplicationListElement
                        key={member.id}
                        content={member}
                      />
                    ))
                  ) : (
                    <Flex align="center" justify="center" p="9">
                      <Text color="gray">{t("unknown-game")}</Text>
                    </Flex>
                  )}
                </div>
              </Tabs.Content>
              <Tabs.Content value="pending">
                <div className="divide-y divide-border">
                  {pendingMembers.length > 0 ? (
                    pendingMembers.map((member) => (
                      <MembershipApplicationListElement
                        key={member.id}
                        content={member}
                      />
                    ))
                  ) : (
                    <Flex align="center" justify="center" p="9">
                      <Text color="gray">{t("unknown-game")}</Text>
                    </Flex>
                  )}
                </div>
              </Tabs.Content>
              <Tabs.Content value="leaving">
                <div className="divide-y divide-border">
                  {leavingReqs.length > 0 ? (
                    leavingReqs.map((req) => (
                      <MembershipLeavingRequestListElement
                        key={req.id}
                        content={req}
                      />
                    ))
                  ) : (
                    <Flex align="center" justify="center" p="9">
                      <Text color="gray">{t("unknown-game")}</Text>
                    </Flex>
                  )}
                </div>
              </Tabs.Content>
            </CardContent>
          </Card>
        </Tabs.Root>
      </Flex>
    </div>
  );
}

export const getStaticProps = makeStaticProperties(["Admin","Sidebar","common"]);
export { getStaticPaths };

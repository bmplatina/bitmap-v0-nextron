import { useEffect, useState } from "react";
import { useTranslation } from "next-i18next";
import LocalizedLink from "@/components/common/localized-link"
import { Avatar, Flex, IconButton, Text } from "@radix-ui/themes";
import type {
  MembershipApplies,
  MembershipLeaves,
  UserQueriedByUid,
} from "@/lib/types";
import { Badge } from "../ui/badge";
import { Edit, Trash2 } from "lucide-react";
import { getMembershipApplicationById } from "@/lib/permissions";
import { getProfile } from "@/lib/auth";

interface ApplicationProps {
  content: MembershipApplies;
}

function MembershipApplicationListElement({ content }: ApplicationProps) {
  const { t } = useTranslation("Admin");

  return (
    <Flex align="center" gap="1">
      <LocalizedLink
        key={content.id}
        href={
          content.isApproved ? "#" : `/admin/members/action?apply=${content.id}`
        }
        className="flex-1 min-w-0 flex items-center gap-3 px-4 py-2 hover:bg-muted transition-colors"
      >
        <div className="relative w-10 h-10 shrink-0 rounded overflow-hidden bg-muted">
          <Avatar
            src={content.avatarUri || "/placeholder.svg?height=40&width=40"}
            alt={content.alias}
            fallback={content.alias.charAt(0).toUpperCase()}
            radius="full"
          />
        </div>
        <div className="flex-1 min-w-0">
          <Text as="p" size="2" weight="medium" truncate>
            {content.alias}
          </Text>
          <Text as="p" size="1" color="gray" truncate>
            {content.name}
          </Text>
        </div>
      </LocalizedLink>
      <Flex align="center" gap="3" className="pr-4">
        {content.isApproved ? (
          <IconButton radius="full" variant="ghost" asChild>
            <LocalizedLink href={`/admin/members/action?kick=${content.uid}`}>
              <Trash2 color="red" size={18} />
            </LocalizedLink>
          </IconButton>
        ) : (
          <>
            <IconButton radius="full" variant="ghost" asChild>
              <LocalizedLink href={`/admin/members/action?edit=${content.id}`}>
                <Edit size={18} />
              </LocalizedLink>
            </IconButton>
            <Badge>{t("pending")}</Badge>
          </>
        )}
      </Flex>
    </Flex>
  );
}

interface LeavingProps {
  content: MembershipLeaves;
}

function MembershipLeavingRequestListElement({ content }: LeavingProps) {
  const { t } = useTranslation("Admin");
  const [user, setUser] = useState<UserQueriedByUid | null>(null);

  useEffect(() => {
    getProfile(undefined, content.uid).then((res) => {
      setUser(res as UserQueriedByUid);
    });
  }, [content.uid]);

  if (!user) return null;

  return (
    <Flex align="center" gap="1">
      <LocalizedLink
        key={content.id}
        href={`/admin/members/action?leave=${content.id}`}
        className="flex-1 min-w-0 flex items-center gap-3 px-4 py-2 hover:bg-muted transition-colors"
      >
        <div className="relative w-10 h-10 shrink-0 rounded overflow-hidden bg-muted">
          <Avatar
            src={user.avatarUri || "/placeholder.svg?height=40&width=40"}
            alt={user.username}
            fallback={user.username.charAt(0).toUpperCase()}
            radius="full"
          />
        </div>
        <div className="flex-1 min-w-0">
          <Text as="p" size="2" weight="medium" truncate>
            {user.username}
          </Text>
          <Text as="p" size="1" color="gray" truncate>
            {user.email}
          </Text>
        </div>
      </LocalizedLink>
      <Flex align="center" gap="3" className="pr-4">
        <IconButton radius="full" variant="ghost" asChild>
          <LocalizedLink href={`/admin/members/action?leave=${content.id}`}>
            <Trash2 color="red" size={18} />
          </LocalizedLink>
        </IconButton>
      </Flex>
    </Flex>
  );
}

export {
  MembershipApplicationListElement,
  MembershipLeavingRequestListElement,
};

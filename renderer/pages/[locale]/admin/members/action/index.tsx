import { Button, Flex, Spinner, Text } from "@radix-ui/themes";
import { Card, CardTitle, CardHeader, CardContent } from "@/components/ui/card";
import { useTranslation } from "next-i18next";
import {
  getMembershipApplicationById,
  getMembershipLeaveReqById,
} from "@/lib/permissions";
import type { searchParamsPropsSSR } from "@/lib/types";
import {
  MembershipApplicationViewer,
  MembershipLeaveViewer,
} from "@/components/admin/membership-application-viewer";
import MembershipKickHandler from "@/components/admin/membership-kick-handler";

export default function AllMembers({ searchParams }: searchParamsPropsSSR) {
  const { t } = useTranslation("Admin");

  const { leave, apply, edit, kick } = await searchParams;

  if (leave) {
    const leaveReq = await getMembershipLeaveReqById(
      undefined,
      leave as string,
    );
    return <MembershipLeaveViewer leaveContent={leaveReq} />;
  } else if (apply) {
    const applicationReq = await getMembershipApplicationById(
      undefined,
      apply as string,
    );
    return <MembershipApplicationViewer applyContent={applicationReq} />;
  } else if (edit) {
    return null;
  } else if (kick) {
    return <MembershipKickHandler uid={kick as string} />;
  }

  return null;
}

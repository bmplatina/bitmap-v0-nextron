import * as React from "react";
import Image from "next/image";
import { cn, pretendard } from "@/lib/utils";
import { useTranslation } from "next-i18next";
import { useIsMobile } from "@/hooks/use-mobile";
import { getNotifications } from "@/lib/notifications";
import type { Notification } from "@/lib/types";
import {
  Spinner,
  Popover,
  Flex,
  Text,
  Button,
  Separator,
  Box,
  Dialog,
} from "@radix-ui/themes";
import { useRouter } from "next/router";
import LocalizedLink from "@/components/common/localized-link";
import { BellOff, X } from "lucide-react";

interface NotificationCenterProps {
  children?: React.ReactNode;
  // open?: boolean;
  // setOpen?: (open: boolean) => void;
}

export default function NotificationCenter({
  children,
}: NotificationCenterProps) {
  const bIsMobile = useIsMobile();
  return (
    <>
      {bIsMobile ? (
        <NotificationCollectionMobile>{children}</NotificationCollectionMobile>
      ) : (
        <Popover.Root>
          <Popover.Trigger>{children}</Popover.Trigger>
          <Popover.Content minWidth="400px">
            <NotificationListContent />
          </Popover.Content>
        </Popover.Root>
      )}
    </>
  );
}

function NotificationCollectionMobile({
  children,
}: {
  children: React.ReactNode;
}) {
  const { t } = useTranslation("Notifications");

  return (
    <Dialog.Root>
      <Dialog.Trigger>{children}</Dialog.Trigger>
      <Dialog.Content
        style={{
          padding: 0,
          margin: 0,
          maxWidth: "100vw",
          height: "100dvh",
          borderRadius: 0,
        }}
      >
        <Flex direction="column" height="100%">
          <Flex
            align="center"
            justify="between"
            px="4"
            py="3"
            style={{ borderBottom: "1px solid var(--gray-5)" }}
          >
            <Text size="3" weight="bold">
              {t("notifications")}
            </Text>
            <Dialog.Close>
              <Button
                variant="ghost"
                color="gray"
                style={{ cursor: "pointer" }}
              >
                <X size={20} />
              </Button>
            </Dialog.Close>
          </Flex>
          <Box style={{ flexGrow: 1, overflowY: "auto" }}>
            <NotificationListContent />
          </Box>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}

function NotificationListContent() {
  const { t } = useTranslation("Notifications");
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [scope, setScope] = React.useState<"unread" | "read" | "all">("unread");
  const [bIsFetching, setIsFetching] = React.useState(true);

  React.useEffect(() => {
    async function fetchNotifications() {
      const token = await window.bitmapApi.getToken();
      try {
        setIsFetching(true);
        const data = await getNotifications(window.bitmapApi, token, scope);
        setNotifications(data || []);
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      } finally {
        setIsFetching(false);
      }
    }

    fetchNotifications();
  }, []);

  return (
    <Flex direction="column" minHeight="150px">
      {bIsFetching ? (
        <Flex justify="center" align="center" flexGrow="1">
          <Spinner />
        </Flex>
      ) : (
        <>
          <Flex direction="column" flexGrow="1">
            {notifications.length > 0 ? (
              notifications.map((content, index) => (
                <NotificationListView key={index} content={content} />
              ))
            ) : (
              <Flex
                direction="column"
                align="center"
                justify="center"
                py="6"
                gap="2"
                style={{ flexGrow: 1 }}
              >
                <BellOff size={32} style={{ opacity: 0.3 }} />
                <Text
                  size="2"
                  color="gray"
                  weight="medium"
                  className={cn(pretendard.className)}
                >
                  {t("all-read")}
                </Text>
              </Flex>
            )}
          </Flex>
          <Separator size="4" />
          <Box p="2">
            <Button
              variant="ghost"
              color="gray"
              highContrast
              size="2"
              style={{ width: "100%", cursor: "pointer" }}
              onClick={() => setScope("all")}
            >
              <Text className={cn(pretendard.className)}>{t("view-read")}</Text>
            </Button>
          </Box>
        </>
      )}
    </Flex>
  );
}

interface NotificationListViewProp {
  content: Notification;
}

function NotificationListView({ content }: NotificationListViewProp) {
  const { t } = useTranslation("Notifications");

  return (
    <LocalizedLink
      href={content.redirectionUri || "#"}
      className="flex items-center gap-3 px-4 py-2 hover:bg-muted transition-colors w-full"
    >
      {/*<div className="relative w-10 h-10 flex-shrink-0 rounded overflow-hidden bg-muted">
        <Image
          src={content.redirectionUri || "/placeholder.svg?height=40&width=40"}
          alt={content.title}
          fill
          className="object-cover"
        />
      </div>*/}
      <div className="flex-1 min-w-0">
        <Text
          as="p"
          size="2"
          weight={content.isRead ? "regular" : "bold"}
          truncate
          color={content.isRead ? "gray" : undefined}
        >
          {t(content.title)}
        </Text>
        <Text as="p" size="1" color="gray" truncate>
          {t(content.content)}
        </Text>
      </div>
    </LocalizedLink>
  );
}

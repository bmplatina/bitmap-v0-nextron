"use client";

import Image from "next/image";
import { useTranslation } from "next-i18next";
import LocalizedLink from "@/components/common/localized-link";
import { Flex, IconButton, Text } from "@radix-ui/themes";
import { Edit } from "lucide-react";
import { Badge } from "../ui/badge";
import type { Game, GameList } from "@/lib/types";

interface GameProp {
  game: GameList;
  bIsPublishingMode: boolean;
}

export default function GameListView({ game, bIsPublishingMode }: GameProp) {
  const { t } = useTranslation("Publish");

  return (
    <Flex align="center" gap="1">
      <LocalizedLink
        key={game.gameId}
        href={`/games/detail?id=${game.gameId}`}
        className="flex-1 min-w-0 flex items-center gap-3 px-4 py-2 hover:bg-muted transition-colors"
      >
        <div className="relative w-10 h-10 flex-shrink-0 rounded overflow-hidden bg-muted">
          <Image
            src={
              game.gameImageURL[2] ||
              game.gameImageURL[0] ||
              "/placeholder.svg?height=40&width=40"
            }
            alt={game.gameTitle}
            fill
            className="object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <Text as="p" size="2" weight="medium" truncate>
            {game.gameTitle}
          </Text>
          <Text as="p" size="1" color="gray" truncate>
            {game.gameDeveloper}
          </Text>
        </div>
      </LocalizedLink>
      {bIsPublishingMode && (
        <Flex align="center" gap="3" className="pr-4">
          <Badge>
            {game.isApproved ? t("approved") : t("waiting-for-approval")}
          </Badge>
          <IconButton radius="full" variant="ghost" asChild>
            <LocalizedLink href={`/publish/games?edit=${game.gameId}`}>
              <Edit size={18} />
            </LocalizedLink>
          </IconButton>
        </Flex>
      )}
    </Flex>
  );
}

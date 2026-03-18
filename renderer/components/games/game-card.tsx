import type { Game } from "@/lib/types";
import { getLocalizedString, formatDate } from "@/lib/utils";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import Image from "next/image";
import LocalizedLink from "@/components/common/localized-link";
import { Calendar, Code, Tag, User } from "lucide-react";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";

interface GameCardProps {
  game: Game;
}

export default function GameCard({ game }: GameCardProps) {
  const router = useRouter();
  const {
    i18n: { language: locale },
    t,
  } = useTranslation("GamesView");

  return (
    <Card className="overflow-hidden flex flex-col h-full transition-all hover:shadow-lg">
      <LocalizedLink href={`/games/detail?id=${game.gameId}`} className="block">
        <div className="relative aspect-[1/1.414] w-full cursor-pointer hover:opacity-90 transition-opacity">
          <Image
            src={
              game.gameImageURL[0] || "/placeholder.svg?height=400&width=283"
            }
            alt={game.gameTitle}
            fill
            className="object-cover"
            priority
          />
          {game.isApproved && game.isEarlyAccess && (
            <Badge className="absolute top-2 right-2 bg-amber-500">
              {t("early-access")}
            </Badge>
          )}
          {!game.isApproved && (
            <Badge className="absolute top-2 right-2 bg-orange-500">
              {t("waiting-for-approval")}
            </Badge>
          )}
        </div>
      </LocalizedLink>

      <CardContent className="flex-1 p-4">
        <h3 className="text-xl font-bold mb-2 line-clamp-1">
          {game.gameTitle}
        </h3>

        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            <span>{game.gameDeveloper}</span>
          </div>

          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>{game.gamePublisher}</span>
          </div>

          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            <span>{getLocalizedString(locale, game.gameGenre)}</span>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(locale, game.gameReleasedDate)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

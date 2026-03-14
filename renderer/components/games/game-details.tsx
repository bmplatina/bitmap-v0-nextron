import { Suspense, useEffect, useState } from "react";
import type { Game, GameRating, UserProfile } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import {
  Clock,
  Calendar,
  User,
  Tag,
  Globe,
  Monitor,
  Code,
  Star,
} from "lucide-react";
import { formatDate, imageUriRegExp } from "@/lib/utils";
import { getProfile } from "@/lib/auth";
import { useTranslation } from "next-i18next";
import { getLocalizedString } from "@/lib/utils";
import SmartMarkdown from "@/components/common/markdown/client-markdown";
import { Box, Flex, ScrollArea, Tabs, Text } from "@radix-ui/themes";
import { Separator } from "../ui/separator";
import GameRateSubmitter from "./game-rate-submitter";
import GameRateViewer from "./game-rate-viewer";
import LocalizedLink from "@/components/common/localized-link";
import GameInteractableButtons from "./bitmapapp_game-interactable-buttons";

type GameDetailProps = {
  game: Game;
  gameRates: GameRating[];
};

export default function GameDetail({ game, gameRates }: GameDetailProps) {
  const {
    t,
    i18n: { language: locale },
  } = useTranslation("GamesView");
  const [author, setAuthor] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (game?.uid) {
      getProfile(window.bitmapApi, undefined, game.uid).then((res) => {
        setAuthor(res as UserProfile);
      });
    }
  }, [game?.uid]);

  let rateAvg: number = 0;

  for (const rate of gameRates) {
    rateAvg += rate.rating;
  }
  rateAvg /= gameRates.length;

  if (!game) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <div className="text-center">
          <p className="text-xl mb-2">{t("unknown-game")}</p>
          <p className="text-sm text-muted-foreground">{t("unknown-game")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 w-full">
      {!game.isApproved && (
        <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
            <Clock className="h-5 w-5" />
            <span className="font-medium">
              이 게임은 현재 승인 대기 중입니다.
            </span>
          </div>
          <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
            관리자 검토 후 정식 게임 라이브러리에 추가됩니다.
          </p>
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 왼쪽 컬럼 - 이미지 */}
        <div className="lg:col-span-1 lg:sticky lg:top-6 self-start">
          <Suspense
            fallback={
              <div className="aspect-[1/1.414] w-full rounded-lg bg-muted"></div>
            }
          >
            <div className="relative aspect-[1/1.414] w-full rounded-lg overflow-hidden">
              <Image
                src={
                  game.gameImageURL[0] ||
                  "/placeholder.svg?height=600&width=424"
                }
                alt={game.gameTitle}
                fill
                className="object-cover"
                priority
              />
            </div>
          </Suspense>

          <GameInteractableButtons
            game={game}
          />
        </div>

        {/* 오른쪽 컬럼 - 상세 정보 */}
        <div className="lg:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <h1 className="text-3xl font-bold">{game.gameTitle}</h1>
            {!game.isApproved && (
              <Badge className="bg-amber-500">
                {t("waiting-for-approval")}
              </Badge>
            )}
            {!!game.isEarlyAccess && (
              <Badge className="bg-amber-500">{t("early-access")}</Badge>
            )}
          </div>

          <h2 className="text-xl text-muted-foreground mb-6">
            {getLocalizedString(locale, game.gameHeadline)}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="flex items-center gap-2">
              <Code className="h-5 w-5 text-muted-foreground" />
              <span>
                {t("developer")}: <strong>{game.gameDeveloper}</strong>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-muted-foreground" />
              <span>
                {t("publisher")}: <strong>{game.gamePublisher}</strong>
                <br />
                {author && `${t("author")}: `}
                <strong>{author?.username}</strong>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-muted-foreground" />
              <span>
                {t("genre")}:{" "}
                <strong>{getLocalizedString(locale, game.gameGenre)}</strong>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <span>
                {t("released-date")}:{" "}
                <strong>{formatDate(locale, game.gameReleasedDate)}</strong>
              </span>
            </div>
          </div>

          {(game.gameVideoURL || game.gameImageURL.length > 1) && (
            <div className="mb-8">
              <Text as="label" size="7" weight="bold" className="mb-4">
                {t("preview")}
              </Text>
              <ScrollArea type="always" scrollbars="horizontal">
                <div className="flex gap-4 pb-4">
                  {game.gameVideoURL && (
                    <div className="shrink-0 w-[85vw] md:w-[500px] aspect-video relative rounded-lg overflow-hidden bg-muted">
                      <iframe
                        src={`https://www.youtube.com/embed/${game.gameVideoURL}?origin=https://www.youtube.com`}
                        className="absolute inset-0 w-full h-full"
                        allowFullScreen
                      />
                    </div>
                  )}
                  {game.gameImageURL.slice(3).map(
                    (url, index) =>
                      imageUriRegExp.test(url) && (
                        <div
                          key={index}
                          className="shrink-0 w-[85vw] md:w-[500px] aspect-video relative rounded-lg overflow-hidden bg-muted"
                        >
                          <Image
                            src={url}
                            alt={`${game.gameTitle} screenshot ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ),
                  )}
                </div>
              </ScrollArea>
            </div>
          )}

          <div className="my-8">
            <Text as="label" size="7" weight="bold" className="mb-4">{`${t(
              "information-of",
            )} ${game.gameTitle}`}</Text>
            <SmartMarkdown
              content={getLocalizedString(locale, game.gameDescription)}
            />
          </div>
          <Separator />
          <div className="my-8">
            <Text as="label" size="7" weight="bold" className="mb-4">
              {t("system-requirements")}
            </Text>
            <Tabs.Root defaultValue="windows">
              <Tabs.List>
                {!!game.gamePlatformWindows && (
                  <Tabs.Trigger value="windows">Windows</Tabs.Trigger>
                )}

                {!!game.gamePlatformMac && (
                  <Tabs.Trigger value="macos">macOS</Tabs.Trigger>
                )}
              </Tabs.List>

              <Box pt="3">
                {!!game.gamePlatformWindows && (
                  <Tabs.Content value="windows">
                    <SmartMarkdown content={game.requirementsWindows ?? ""} />
                  </Tabs.Content>
                )}

                {!!game.gamePlatformMac && (
                  <Tabs.Content value="macos">
                    <SmartMarkdown content={game.requirementsMac ?? ""} />
                  </Tabs.Content>
                )}
              </Box>
            </Tabs.Root>
          </div>
          <Separator />
          <div className="my-8">
            <Text as="label" size="7" weight="bold" className="mb-4">
              {t("rating")}
            </Text>
            {rateAvg > 0 && (
              <Flex>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    color="orange"
                    key={i + 1}
                    fill={i + 1 <= rateAvg ? "yellow" : "none"}
                  />
                ))}
              </Flex>
            )}
            <div className="mt-2">
              <GameRateSubmitter
                gameId={game.gameId}
                bIsEditing={false}
                rates={gameRates}
              />
              <GameRateViewer gameRates={gameRates} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

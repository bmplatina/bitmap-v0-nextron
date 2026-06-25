"use client";

import { useState, useEffect, Suspense } from "react";
import type { Game } from "@/lib/types";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import Image from "next/image";
import { Calendar, User, Tag, Globe, Monitor, Code } from "lucide-react";
import { formatDate, getLocalizedString, imageUriRegExp } from "@/lib/utils";
import { getProfile } from "@/lib/auth";
import { useTranslation } from "next-i18next";
import ClientMarkdown from "@/components/common/markdown/client-markdown";
import { Box, ScrollArea, Tabs, Text } from "@radix-ui/themes";
import { Separator } from "../ui/separator";

interface AuthorInfo {
  username: string;
  email: string;
}

type GameDetailProps = {
  game: Game;
  uid: string;
  submitState: "editExisting" | "submitNew";
};

export default function GameDetail({
  game,
  uid,
  submitState,
}: GameDetailProps) {
  const { i18n, t } = useTranslation("GamesView");
  const { t: t_gameSubmit } = useTranslation("GameSubmit");
  const locale = i18n.language;
  const [author, setAuthor] = useState<AuthorInfo | null>(null);

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

  useEffect(() => {
    getProfile(window.bitmapApi, undefined, uid).then(
      (payload: AuthorInfo | null) => {
        setAuthor(payload);
      },
    );
  }, [author]);

  return (
    <div className="container mx-auto p-6 w-full">
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

          <div className="mt-6 space-y-4">
            {game.gameWebsite && (
              <Button variant="outline" className="w-full" asChild>
                <a
                  href={game.gameWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Globe className="mr-2 h-4 w-4" />
                  {t("official-website")}
                </a>
              </Button>
            )}

            <Button className="w-full" variant="default" asChild>
              <a
                href={`/download?gameId=${game.gameId}`}
                rel="noopener noreferrer"
              >
                <Monitor className="mr-2 h-4 w-4" />
                {t("view-in-bitmap-app")}
              </a>
            </Button>

            {/*game.gameDownloadWinURL && (
                  <Button className="w-full">
                    <Monitor className="mr-2 h-4 w-4" />
                    Windows 다운로드
                  </Button>
              )*/}

            {/*game.gameDownloadMacURL && (
                  <Button className="w-full" variant="secondary">
                    <Apple className="mr-2 h-4 w-4" />
                    Mac 다운로드
                  </Button>
              )*/}
          </div>
        </div>

        {/* 오른쪽 컬럼 - 상세 정보 */}
        <div className="lg:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <h1 className="text-3xl font-bold">{game.gameTitle}</h1>
            {submitState === "submitNew" && (
              <Badge className="bg-amber-500">
                {t_gameSubmit("waiting-for-approval")}
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
              <Text as="span">
                {t("developer")}: <strong>{game.gameDeveloper}</strong>
              </Text>
            </div>

            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-muted-foreground" />
              <Text as="span">
                {t("publisher")}: <strong>{game.gamePublisher}</strong>
                <br />
                {author && (
                  <>
                    {t("author")}: <strong>{author.username}</strong>
                  </>
                )}
              </Text>
            </div>

            <div className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-muted-foreground" />
              <Text as="span">
                {t("genre")}:{" "}
                <strong>{getLocalizedString(locale, game.gameGenre)}</strong>
              </Text>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <Text as="span">
                {t("released-date")}:{" "}
                <strong>{formatDate(locale, game.gameReleasedDate)}</strong>
              </Text>
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
                    <div className="shrink-0 w-[500px] aspect-video relative rounded-lg overflow-hidden bg-muted">
                      <iframe
                        src={`https://www.youtube.com/embed/${game.gameVideoURL}?origin=http://localhost`}
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
                          className="shrink-0 w-[500px] aspect-video relative rounded-lg overflow-hidden bg-black"
                        >
                          <Image
                            src={url}
                            alt={`${game.gameTitle} screenshot ${index + 1}`}
                            fill
                            className="object-contain"
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
            <ClientMarkdown
              content={getLocalizedString(locale, game.gameDescription)}
            />
          </div>
          <Separator />
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
                    <ClientMarkdown content={game.requirementsWindows ?? ""} />
                  </Tabs.Content>
                )}

                {game.gamePlatformMac && (
                  <Tabs.Content value="macos">
                    <ClientMarkdown content={game.requirementsMac ?? ""} />
                  </Tabs.Content>
                )}
              </Box>
            </Tabs.Root>
          </div>
        </div>
      </div>
    </div>
  );
}

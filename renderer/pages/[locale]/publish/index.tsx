"use client";

import { useTranslation } from "next-i18next";
import { Button, Skeleton, Flex } from "@radix-ui/themes";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { useAuth } from "@/lib/AuthContext";
import { useEffect, useState } from "react";
import { Link, useRouter } from "next/router";
import { getGamesByUid } from "@/lib/games";
import GameListView from "@/components/games/game-listview";
import { Game } from "@/lib/types";

export default function SubmitGames() {
  const { t } = useTranslation("Publish");
  const router = useRouter();
  const { bIsLoggedIn, bIsDeveloper, bIsTeammate, isLoading } = useAuth();

  const [games, setGames] = useState<Game[]>([]);
  const [bIsLoading, setIsLoading] = useState(true);

  useEffect(
    function () {
      if (!isLoading) {
        if (!bIsLoggedIn || !bIsDeveloper || !bIsTeammate) {
          router.push("/auth");
        }
      }
    },
    [bIsLoggedIn, bIsDeveloper, bIsTeammate, router, isLoading],
  );

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setIsLoading(false);
      return;
    }

    getGamesByUid(token)
      .then((data) => {
        setGames(data);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="space-y-6">
        {bIsDeveloper && (
          <Card>
            <CardHeader>
              <CardTitle>{t("game")}</CardTitle>
            </CardHeader>
            <CardContent>
              {bIsLoading ? (
                <Flex direction="column" gap="4" py="2">
                  {[1, 2, 3].map((i) => (
                    <Flex key={i} align="center" gap="3" px="4">
                      <Skeleton width="40px" height="40px" />
                      <Flex direction="column" gap="1">
                        <Skeleton width="120px" height="16px" />
                        <Skeleton width="80px" height="12px" />
                      </Flex>
                    </Flex>
                  ))}
                </Flex>
              ) : games.length > 0 ? (
                games.map((game) => (
                  <GameListView
                    key={game.gameId}
                    game={game}
                    bIsPublishingMode={true}
                  />
                ))
              ) : (
                <p className="text-center py-6 text-muted-foreground text-sm">
                  등록된 게임이 없습니다.
                </p>
              )}
            </CardContent>
            <CardFooter>
              <Flex gap="2">
                <Button asChild>
                  <Link href="/publish/games">{t("publish-new")}</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/legal?license=BitmapGameDistributionAgreement">
                    {t("distribution-agreement")}
                  </Link>
                </Button>
              </Flex>
            </CardFooter>
          </Card>
        )}

        {bIsTeammate && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>{t("project-file")}</CardTitle>
              </CardHeader>
              <CardContent>준비 중인 기능</CardContent>
              <CardFooter>
                <Button disabled asChild={false}>
                  {true ? (
                    t("publish-new")
                  ) : (
                    <Link href="/publish/projectfiles">{t("publish-new")}</Link>
                  )}
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("lecture")}</CardTitle>
              </CardHeader>
              <CardContent>준비 중인 기능</CardContent>
              <CardFooter>
                <Button disabled asChild={false}>
                  {true ? (
                    t("publish-new")
                  ) : (
                    <Link href="/publish/lectures">{t("publish-new")}</Link>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

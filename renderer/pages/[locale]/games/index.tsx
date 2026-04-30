import { getStaticPaths, makeStaticProperties } from "@/lib/get-static";
import type { GameList } from "@/lib/types";
import { Suspense, useEffect, useState } from "react";
import {
  Box,
  Flex,
  IconButton,
  Skeleton,
  TabNav,
  Text,
} from "@radix-ui/themes";
import { getGames } from "@/lib/games";
import { useTranslation } from "next-i18next";
import { z } from "zod";
import { useRouter } from "next/router";
import GameCard from "@/components/games/game-card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import LocalizedLink from "@/components/common/localized-link";

const gamesSearchParamsSchema = z.object({
  state: z.enum(["all", "released", "pending"]).catch("released"),
  page: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().min(0))
    .catch(0),
});

export default function GamesPage() {
  const router = useRouter();
  const { state, page } = gamesSearchParamsSchema.parse(router.query);

  // 서버 컴포넌트에서 직접 데이터 가져오기
  const [games, setGames] = useState<GameList[]>([]);
  const [nextGames, setNextGames] = useState<GameList[]>([]);
  const {
    t,
    i18n: { language: locale },
  } = useTranslation("GamesView");

  function getHref(href: string): string {
    if (href === "/") return `/${locale}`;
    else if (href.startsWith("http")) return href;
    else if (href.startsWith("/ko") || href.startsWith("/en")) return href;
    else return `/${locale}${href}`;
  }

  useEffect(() => {
    const fetchGames = async () => {
      const gamesData = await getGames(window.bitmapApi, state, page);
      setGames(gamesData);
      const nextGamesData = await getGames(window.bitmapApi, state, page + 1);
      setNextGames(nextGamesData);
    };
    fetchGames();
  }, [state, page]);

  return (
    <Flex direction="column" gap="3" justify="center">
      <TabNav.Root className="sticky top-0 z-10 bg-background border-b-0">
        <TabNav.Link asChild active={state === "all"}>
          <LocalizedLink href="/games?state=all">{t("all")}</LocalizedLink>
        </TabNav.Link>
        <TabNav.Link asChild active={state === "released"}>
          <LocalizedLink href="/games?state=released">
            {t("released")}
          </LocalizedLink>
        </TabNav.Link>
        <TabNav.Link asChild active={state === "pending"}>
          <LocalizedLink href="/games?state=pending">
            {t("pending")}
          </LocalizedLink>
        </TabNav.Link>
      </TabNav.Root>
      <Box pt="3">
        <GameCardCollection>
          {games.map((game) => (
            <Suspense key={game.gameId} fallback={<GameCardSkeleton />}>
              <GameCard game={game} />
            </Suspense>
          ))}
        </GameCardCollection>
      </Box>
      <Flex justify="center" align="center" gap="2">
        <IconButton variant="ghost" radius="full" disabled={page === 0}>
          {page === 0 ? (
            <ChevronLeft />
          ) : (
            <LocalizedLink href={`/games?state=${state}&page=${page - 1}`}>
              <ChevronLeft />
            </LocalizedLink>
          )}
        </IconButton>
        <Text as="p" weight="bold">
          {page + 1}
        </Text>
        <IconButton
          variant="ghost"
          radius="full"
          disabled={nextGames.length === 0}
        >
          {nextGames.length === 0 ? (
            <ChevronRight />
          ) : (
            <LocalizedLink href={`/games?state=${state}&page=${page + 1}`}>
              <ChevronRight />
            </LocalizedLink>
          )}
        </IconButton>
      </Flex>
    </Flex>
  );
}

export function GameCardCollection({
  children,
}: {
  children?: React.ReactNode;
}) {
  const { t } = useTranslation("GamesView");

  return (
    <div className="p-6 w-full">
      <h1 className="text-3xl font-bold mb-6">{t("explore")}</h1>

      {children ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {children}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-xl text-muted-foreground">
            현재 사용 가능한 게임이 없습니다.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            게임 데이터를 불러오는 중 문제가 발생했거나 등록된 게임이 없습니다.
          </p>
        </div>
      )}
    </div>
  );
}

// 로딩 중 표시할 스켈레톤 UI
function GameCardSkeleton() {
  return (
    <div className="overflow-hidden flex flex-col h-full rounded-lg border bg-card text-card-foreground shadow">
      <div className="relative aspect-[1/1.414] w-full bg-muted animate-pulse" />
      <div className="p-4 flex-1">
        <Skeleton className="h-6 bg-muted rounded w-3/4 mb-4" />
        <div className="space-y-3">
          <Skeleton className="h-4 bg-muted rounded w-1/2" />
          <Skeleton className="h-4 bg-muted rounded w-2/3" />
          <Skeleton className="h-4 bg-muted rounded w-1/3" />
          <Skeleton className="h-4 bg-muted rounded w-1/3" />
        </div>
      </div>
    </div>
  );
}

export const getStaticProps = makeStaticProperties(["GamesView"]);
export { getStaticPaths };

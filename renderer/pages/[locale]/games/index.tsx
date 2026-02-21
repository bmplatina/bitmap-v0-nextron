import { getStaticPaths, makeStaticProperties } from "@/lib/get-static";
import type { Game } from "@/lib/types";
import { useEffect, useState } from "react";
import GameCardCollection from "@/components/games/game-card-collection";
import { Box, Tabs, Text } from "@radix-ui/themes";
import { getGames } from "@/lib/games";
import { useTranslation } from "next-i18next";

export default function GamesPage() {
  // 서버 컴포넌트에서 직접 데이터 가져오기
  const [allGames, setAllGames] = useState<Game[]>([]);
  const { t } = useTranslation("GamesView");

  useEffect(() => {
    const fetchGames = async () => {
      const gamesData = await getGames("all");
      setAllGames(gamesData);
    };
    fetchGames();
  }, []);

  return (
    <Tabs.Root defaultValue="released">
      <Tabs.List className="sticky top-0 z-10 bg-background border-b-0">
        <Tabs.Trigger value="all">{t("all")}</Tabs.Trigger>
        <Tabs.Trigger value="released">{t("released")}</Tabs.Trigger>
        <Tabs.Trigger value="pending">{t("pending")}</Tabs.Trigger>
      </Tabs.List>

      <Box pt="3">
        <Tabs.Content value="released">
          <GameCardCollection
            games={allGames.filter((game) => game.isApproved)}
          />
        </Tabs.Content>

        <Tabs.Content value="pending">
          <GameCardCollection
            games={allGames.filter((game) => !game.isApproved)}
          />
        </Tabs.Content>

        <Tabs.Content value="all">
          <GameCardCollection games={allGames} />
        </Tabs.Content>
      </Box>
    </Tabs.Root>
  );
}

export const getStaticProps = makeStaticProperties(["GamesView"]);
export { getStaticPaths };

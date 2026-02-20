import { useTranslation } from "next-i18next";
import { getGameById, getGameRatesById } from "@/lib/games";
import { useEffect, useState } from "react";
import GameDetail from "@/components/games/game-details";
import { observer } from "mobx-react";
import { addManager } from "@/lib/slices/dl-slice";
import { useRouter } from "next/router";
import { Game, GameRating } from "@/lib/types";

export default observer(function GameDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = router.query;
  const { t } = useTranslation("GamesView");
  // const game = await getGameById(id);
  // const gameRates = await getGameRatesById(id);
  const [game, setGame] = useState<Game | null>();
  const [gameRates, setGameRates] = useState<GameRating[]>([]);

  useEffect(() => {
    const fetchGame = async () => {
      if (typeof id === "string") {
        const gameData = await getGameById(id);
        const gameRatesData = (await getGameRatesById(id)) ?? [];
        setGameRates(gameRatesData);
        setGame(gameData);
      }
    };
    fetchGame();
  }, [id]);

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

  return <GameDetail game={game} gameRates={gameRates ?? []} />;
});

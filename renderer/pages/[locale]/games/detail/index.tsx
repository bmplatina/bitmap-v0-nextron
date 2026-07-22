import { getStaticPaths, makeStaticProperties } from "@/lib/get-static";
import { Spinner } from "@radix-ui/themes";
import { getGameById, getGameRatesById } from "@/lib/games";
import { useCallback, useEffect, useState } from "react";
import GameDetail from "@/components/games/game-details";
import { useRouter } from "next/router";
import { GameRating, GameWithSize } from "@/lib/types";

export default function GameDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [game, setGame] = useState<GameWithSize | null>();
  const [gameRates, setGameRates] = useState<GameRating[]>([]);

  const fetchGame = useCallback(async () => {
    if (typeof id === "string") {
      const gameData = await getGameById(window.bitmapApi, id);
      const gameRatesData =
        (await getGameRatesById(window.bitmapApi, id)) ?? [];
      setGameRates(gameRatesData);
      setGame(gameData);
    }
  }, [id]);

  useEffect(() => {
    fetchGame();
  }, [fetchGame]);

  if (!game) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        {/* <div className="text-center">
          <p className="text-xl mb-2">{t("unknown-game")}</p>
          <p className="text-sm text-muted-foreground">{t("unknown-game")}</p>
        </div> */}
        <Spinner />
      </div>
    );
  }

  return <GameDetail game={game} gameRates={gameRates ?? []} onRatesChanged={fetchGame} />;
}


export const getStaticProps = makeStaticProperties(["GamesView"]);
export { getStaticPaths };

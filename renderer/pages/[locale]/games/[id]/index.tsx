import { useTranslation } from "next-i18next";
import { getGameById, getGameRatesById } from "@/lib/games";
import { Metadata } from "@/lib/types";
import GameDetail from "@/components/games/game-details";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const { t } = useTranslation("GamesView");
  const game = await getGameById(id);

  if (!game) {
    return {
      title: `Bitmap Store: ${t("unknown-game")}`,
    };
  }

  return {
    title: `Bitmap Store: ${game.gameTitle}`,
  };
}

export default function GameDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { t } = useTranslation("GamesView");
  const game = await getGameById(id);
  const gameRates = await getGameRatesById(id);

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
}

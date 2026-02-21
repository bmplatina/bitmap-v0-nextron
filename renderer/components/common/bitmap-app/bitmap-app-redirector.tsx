import { useEffect, useState } from "react";
import { Button, Spinner, Text } from "@radix-ui/themes";
import { getGameById } from "@/lib/games";
import type { Game } from "@/lib/types";
import { useTranslation } from "next-i18next";
import LocalizedLink from "@/components/common/localized-link";
import { Download } from "lucide-react";

interface GameProps {
  gameId: string;
}

export default function BitmapAppRedirector({ gameId }: GameProps) {
  const { t } = useTranslation("Sidebar");
  const [game, setGame] = useState<Game | null>(null);
  const [bIsFetching, setIsFetching] = useState<boolean>(true);

  useEffect(() => {
    async function fetchGame() {
      try {
        setIsFetching(true);
        const game = await getGameById(window.bitmapApi, gameId);
        setGame(game);
      } catch (err: any) {
      } finally {
        setIsFetching(false);
      }
    }

    fetchGame();
    if (gameId) window.location.href = `bitmap://games/${gameId}`;
  }, [gameId]);

  if (!gameId) return null;

  return (
    <Button
      variant="outline"
      className="w-full cursor-pointer"
      asChild
      disabled={bIsFetching}
    >
      <LocalizedLink
        href={`bitmap://games/${gameId}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        {bIsFetching ? (
          <Spinner />
        ) : (
          <>
            <Download className="mr-2 h-4 w-4" />
            <Text>Bitmap App에서 {game?.gameTitle} 보기</Text>
          </>
        )}
      </LocalizedLink>
    </Button>
  );
}

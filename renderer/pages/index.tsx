import { Box, Button, ScrollArea } from "@radix-ui/themes";
import { useState, useEffect } from "react";
import { getGames } from "@/lib/games";
import type { Game, Carousel } from "@/lib/types";
import { useTranslation } from "next-i18next";
import GameRedirectButton from "@/components/games/game-redirect-button";
import AutoSliderCarousel from "@/components/common/main-page-carousel";
import { Suspense } from "react";
import YouTubeWorksList from "@/components/common/youtube-works-list";
import Link from "next/link";

export default function Home() {
  // 서버에서 직접 데이터 페칭
  const [games, setGames] = useState<Game[]>([]);
  const { t } = useTranslation("MainPage");

  useEffect(() => {
    const fetchGames = async () => {
      const gamesData = await getGames("released");
      setGames(gamesData);
    };
    fetchGames();
  }, []);

  return (
    <>
      <Suspense fallback={<TitleFallback />}>
        <AutoSliderCarousel bFetchFromClient />
      </Suspense>
      <div className="flex flex-col items-center w-full p-6 pt-10 text-center space-y-12">
        {/* 유튜브 영상 가로 스크롤 섹션 */}
        <div className="w-full max-w-6xl">
          <Link href="/about">
            <h2 className="text-2xl font-bold mb-4 text-left">{t("works")}</h2>
          </Link>
          <YouTubeWorksList
            bFetchFromClient
            youTubeChannelId_Client="UCL137ZWChauNFsma6ifhNdA"
          />
        </div>

        <div className="w-full max-w-6xl">
          <Link href="/games">
            <h2 className="text-2xl font-bold mb-4 text-left">{t("games")}</h2>
          </Link>
          <ScrollArea type="always" scrollbars="horizontal">
            <div className="flex gap-4 pb-4">
              {games.length > 0 ? (
                games.map((game) => (
                  <GameRedirectButton
                    key={game.gameId}
                    disabled={false}
                    gameId={game.gameId}
                    gameImageURL={game.gameImageURL[1] || game.gameImageURL[0]}
                    gameTitle={game.gameTitle}
                    gameDeveloper={game.gameDeveloper}
                  />
                ))
              ) : (
                <p className="text-gray-500 w-full text-center py-10">
                  {t("api-error")}
                </p>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </>
  );
}

function TitleFallback() {
  const { t } = useTranslation("MainPage");

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-4xl font-bold mb-6">{t("welcome-bitmap")}</h1>
      <p className="text-xl mb-8 max-w-2xl">{t("welcome-bitmap-desc")}</p>
    </div>
  );
}

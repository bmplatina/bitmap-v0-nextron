import { useTranslation } from "next-i18next";
import { useEffect, useState } from "react";
import { formatDate } from "@/lib/utils";
import { getProfile } from "@/lib/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Star } from "lucide-react";
import GameRateSubmitter from "./game-rate-submitter";
import { Flex, Text } from "@radix-ui/themes";
import { GameRating, UserProfile } from "@/lib/types";

interface GameRateViewerProp {
  gameRates: GameRating[];
}

export default function GameRateViewer({ gameRates }: GameRateViewerProp) {
  return (
    <>
      {gameRates.length > 0 ? (
        gameRates.map(
          (rate) => rate && <GameRateSingle key={rate.id} rate={rate} />,
        )
      ) : (
        <GameRateEmpty />
      )}
    </>
  );
}

interface GameRateProp {
  rate: GameRating;
}

function GameRateSingle({ rate }: GameRateProp) {
  const { i18n } = useTranslation();
  const locale = i18n.language;
  const [author, setAuthor] = useState<UserProfile | null>(null);

  useEffect(() => {
    getProfile(undefined, rate.uid).then((res) => {
      setAuthor(res as UserProfile);
    });
  }, [rate.uid]);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{rate.title}</CardTitle>
          <CardDescription>
            <Text>
              {author?.username} ({formatDate(locale, rate.createdAt)})
            </Text>
            <Flex className="mt-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i + 1}
                  color="orange"
                  fill={i + 1 <= rate.rating ? "yellow" : "none"}
                />
              ))}
            </Flex>
          </CardDescription>
        </CardHeader>
        <CardContent>{rate.content}</CardContent>
        <CardFooter>
          <GameRateSubmitter
            gameId={rate.gameId}
            bIsEditing={true}
            rates={[rate]}
          />
        </CardFooter>
      </Card>
    </>
  );
}

function GameRateEmpty() {
  const { t } = useTranslation("GamesView");

  return (
    <>
      <Card className="text-center">
        <CardHeader>
          <CardTitle>{t("rate-empty")}</CardTitle>
        </CardHeader>
        <CardContent>{t("rate-empty-desc")}</CardContent>
      </Card>
    </>
  );
}

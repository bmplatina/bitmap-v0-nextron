"use client";

import GameDetail from "@/components/games/game-details-pending";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { useGameForm } from "@/lib/GamePublishContext";
import { useAuth } from "@/lib/AuthContext";
import { Button, Text, Spinner } from "@radix-ui/themes";
import { Clock } from "lucide-react";
import { submitGame } from "@/lib/games";
import { formatDateToMySQL } from "@/lib/utils";
import { useEffect, useState } from "react";

export default function gamePublishSubmitter() {
  const { t } = useTranslation("GameSubmit");
  const { gameData: game, bIsEditingExisting, updateField } = useGameForm();
  const { uid } = useAuth();
  const router = useRouter();
  const [token, setToken] = useState<string>("");
  const [postMessage, setPostMessage] = useState<string>("");
  const [bIsPosting, setIsPosting] = useState<boolean>(false);
  const [bIsPostSucceed, setIsPostSucceed] = useState<boolean>(false);

  async function submitHandler() {
    try {
      setIsPosting(true);
      if (token.length === 0) {
        throw Error("No token found");
      }
      const result = await submitGame(
        window.bitmapApi,
        token,
        game,
        bIsEditingExisting,
      );
      setPostMessage(result.message as string);
      setIsPostSucceed(true);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || error.code;
      setPostMessage(errorMessage);
      setIsPostSucceed(false);
    } finally {
      setIsPosting(false);
    }
  }

  useEffect(() => {
    // You can add any side effects or subscriptions here if needed
    if (!bIsEditingExisting) {
      updateField("uid", uid);
    }
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      setToken(accessToken);
    }

    if (game.gameReleasedDate) {
      updateField(
        "gameReleasedDate",
        formatDateToMySQL(new Date(game.gameReleasedDate)),
      );
    }
  }, [bIsEditingExisting, uid, game.gameReleasedDate]);

  return (
    <>
      <div className="container mx-auto p-6 w-full">
        <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
              <Clock className="h-5 w-5" />
              <Text className="font-medium" as="span">
                {bIsEditingExisting ? t("editing") : t("submitting")}{" "}
                {game.gameTitle}
              </Text>
            </div>
            <Text
              as="p"
              className="text-sm text-amber-700 dark:text-amber-300 mt-1"
            >
              {bIsEditingExisting ? t("edit-warning") : t("submit-warning")}
            </Text>
            {postMessage.length !== 0 && (
              <Text
                as="p"
                className="text-sm text-amber-700 dark:text-amber-300 mt-1"
                color={bIsPostSucceed ? undefined : "red"}
              >
                {t(postMessage)}
              </Text>
            )}
          </div>
          {bIsPostSucceed ? (
            <Button
              onClick={() => router.push(`/games/${game.gameId}`)}
              size="3"
              variant="solid"
              color="amber"
            >
              {t("view-gamepage")}
            </Button>
          ) : (
            <Button
              onClick={submitHandler}
              disabled={bIsPosting}
              size="3"
              variant="solid"
              color="amber"
            >
              {bIsPosting ? (
                <Spinner className="h-4 w-4" />
              ) : (
                <>{bIsEditingExisting ? t("edit") : t("submit")}</>
              )}
            </Button>
          )}
        </div>
      </div>

      <GameDetail
        game={game}
        uid={uid}
        submitState={bIsEditingExisting ? "editExisting" : "submitNew"}
      />
    </>
  );
}

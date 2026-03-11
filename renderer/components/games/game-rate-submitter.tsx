"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { useAuth } from "@/lib/AuthContext";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
  CardDescription,
} from "../ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Button,
  AlertDialog,
  Flex,
  IconButton,
  Spinner,
  Text,
  TextArea,
  TextField,
  Theme,
} from "@radix-ui/themes";
import { submitGameRate, deleteGameRate } from "@/lib/games";
import type { GameRating, GameRatingRequest } from "@/lib/types";
import { Star } from "lucide-react";

type GameIdProps = {
  gameId: number;
  bIsEditing: boolean;
  rates: GameRating[];
};

export default function GameRateSubmitter({
  gameId,
  bIsEditing,
  rates,
}: GameIdProps) {
  const { t } = useTranslation("GamesView");
  const router = useRouter();
  const { bIsLoggedIn, uid } = useAuth();

  const [bIsAlreadySubmitted, setIsAlreadySubmitted] = useState(false);
  const [bIsDeleting, setIsDeleting] = useState(false);
  const [postFailMessage, setPostFailMessage] = useState<string>("");

  async function rateDeleteHandler() {
    try {
      setIsDeleting(true);
      const token = await window.bitmapApi.getToken();
      if (!token) throw Error("login-required");
      const response = await deleteGameRate(window.bitmapApi, token, gameId);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsDeleting(false);
      router.replace(router.asPath);
    }
  }

  useEffect(() => {
    const existingRate = rates.find(
      (rate) => rate.uid === uid && rate.gameId === gameId,
    );
    if (existingRate) {
      if (!bIsEditing) {
        setIsAlreadySubmitted(true);
      }
    }
  }, [bIsEditing, rates, gameId]);

  if (!bIsLoggedIn || bIsAlreadySubmitted) return null;

  return (
    <>
      {bIsEditing ? (
        <Flex gap="3" mt="4" justify="end">
          <Popover>
            <PopoverTrigger asChild>
              <Button>
                <Text>{t("rate-edit")}</Text>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[calc(100vw-32px)] sm:w-[480px]">
              <GameRateCard
                gameId={gameId}
                bIsEditing={bIsEditing}
                rates={rates}
              ></GameRateCard>
            </PopoverContent>
          </Popover>
          <AlertDialog.Root>
            <AlertDialog.Trigger>
              <Button color="red">{t("rate-delete-btn")}</Button>
            </AlertDialog.Trigger>
            <AlertDialog.Content maxWidth="450px">
              <AlertDialog.Title>{t("rate-delete")}</AlertDialog.Title>
              <AlertDialog.Description size="2">
                {t("rate-delete-desc")}
              </AlertDialog.Description>

              <Flex gap="3" mt="4" justify="end">
                <AlertDialog.Cancel>
                  <Button variant="soft" color="gray">
                    {t("rate-delete-cancel-btn")}
                  </Button>
                </AlertDialog.Cancel>
                <AlertDialog.Action>
                  <Button
                    variant="solid"
                    color="red"
                    onClick={rateDeleteHandler}
                  >
                    {bIsDeleting ? (
                      <Spinner />
                    ) : (
                      <Text>{t("rate-delete-btn")}</Text>
                    )}
                  </Button>
                </AlertDialog.Action>
              </Flex>
            </AlertDialog.Content>
          </AlertDialog.Root>
        </Flex>
      ) : (
        <div className="my-2">
          <GameRateCard gameId={gameId} bIsEditing={bIsEditing} rates={rates} />
        </div>
      )}
    </>
  );
}

function GameRateCard({ gameId, bIsEditing, rates }: GameIdProps) {
  const { t } = useTranslation("GamesView");
  const router = useRouter();
  const { uid } = useAuth();
  const [rating, setRating] = useState<number>(5);
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [postFailMessage, setPostFailMessage] = useState<string>("");
  const [bIsSubmitting, setIsSubmitting] = useState<boolean>(false);

  async function submitHandler() {
    try {
      setIsSubmitting(true);
      const storageToken = await window.bitmapApi.getToken();
      if (!storageToken) throw Error("login-required");

      if (title.length === 0) throw Error("title-required");
      if (content.length === 0) throw Error("content-required");
      if (rating <= 0 || rating > 5) throw Error("rating-required");

      const newRate: GameRatingRequest = {
        gameId: gameId,
        uid: uid,
        rating: rating,
        title: title,
        content: content,
      };

      await submitGameRate(window.bitmapApi, storageToken, newRate, bIsEditing);
      router.replace(router.asPath);
    } catch (err: any) {
      setPostFailMessage(err.message || String(err));
      console.error(err);
    } finally {
      setIsSubmitting(false);
      router.replace(router.asPath);
    }
  }

  useEffect(() => {
    const existingRate = rates.find(
      (rate) => rate.uid === uid && rate.gameId === gameId,
    );
    if (existingRate) {
      if (bIsEditing) {
        setTitle(existingRate.title ?? "");
        setContent(existingRate.content);
        setRating(existingRate.rating);
      }
    }
  }, [bIsEditing, rates, uid, gameId]);

  return (
    <Theme>
      <Card>
        <CardHeader>
          <CardTitle>
            <Text>{bIsEditing ? t("rate-edit") : t("new-rate")}</Text>
            <TextField.Root
              placeholder={t("rate-title")}
              onChange={(e) => setTitle(e.target.value)}
              value={title}
            >
              <TextField.Slot></TextField.Slot>
            </TextField.Root>
          </CardTitle>
          <CardDescription>
            <Flex gap="2" className="mt-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <IconButton
                  key={i + 1}
                  variant="ghost"
                  radius="full"
                  onClick={() => setRating(i + 1)}
                >
                  <Star
                    color="orange"
                    fill={i + 1 <= rating ? "yellow" : "none"}
                  />
                </IconButton>
              ))}
            </Flex>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TextArea
            placeholder={t("rate-description")}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          ></TextArea>
          {postFailMessage && (
            <Text color="red" as="p">
              {t(postFailMessage)}
            </Text>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={() => submitHandler()}>
            {bIsSubmitting ? (
              <Spinner />
            ) : (
              <Text>{bIsEditing ? t("rate-edit") : t("rate-submit")}</Text>
            )}
          </Button>
        </CardFooter>
      </Card>
    </Theme>
  );
}

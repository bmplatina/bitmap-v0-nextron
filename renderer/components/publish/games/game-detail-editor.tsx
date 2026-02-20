"use client";

import { useState, useEffect } from "react";
import { Callout, Checkbox, Spinner, Text } from "@radix-ui/themes";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Clock } from "lucide-react";
import type { Game } from "@/lib/types";
import { toast } from "@/hooks/use-toast";
import { getGames } from "@/lib/games";
import { useTranslation } from "next-i18next";
import { useGameForm } from "@/lib/GamePublishContext";

export default function GameDetailEditor() {
  const { t } = useTranslation("GameSubmit");
  const {
    gameData: game,
    updateField,
    bIsEditingExisting,
    getIsDetailEditorFieldAllValid,
  } = useGameForm();

  // 로딩 상태
  const [isLoadingGameId, setIsLoadingGameId] = useState(false);

  function setGameId(value: number) {
    updateField("gameId", value);
  }

  function setGameLatestVersion(value: number) {
    updateField("gameLatestRevision", value);
  }

  function setGameEngine(value: string) {
    updateField("gameEngine", value);
  }

  function setGameWebsite(value: string) {
    updateField("gameWebsite", value);
  }

  function setGameDownloadMacURL(value: string) {
    updateField("gameDownloadMacURL", value);
  }

  function setGameDownloadWinURL(value: string) {
    updateField("gameDownloadWinURL", value);
  }

  function setGameBinaryName(value: string) {
    updateField("gameBinaryName", value);
  }

  function setGamePlatformWindows(value: boolean) {
    updateField("gamePlatformWindows", value);
  }

  function setGamePlatformMac(value: boolean) {
    updateField("gamePlatformMac", value);
  }

  function setIsEarlyAccess(value: boolean) {
    updateField("isEarlyAccess", value);
  }

  function setIsReleased(value: boolean) {
    updateField("isReleased", value);
  }

  // 게임 ID 자동 생성 - API에서 기존 게임 수를 가져와서 계산
  useEffect(() => {
    async function fetchGames() {
      try {
        setIsLoadingGameId(true);

        const fetchedGames: Game[] = await getGames("all");

        setGameId(fetchedGames.length);
      } catch (error) {
        console.error("게임 데이터를 가져오는 중 오류가 발생했습니다:", error);

        // API 오류 시 현재 시간을 기반으로 임시 ID 생성
        const fallbackId = Date.now();
        setGameId(fallbackId);

        toast({
          title: "경고",
          description:
            "게임 ID 생성 중 오류가 발생했습니다. 임시 ID가 할당되었습니다.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingGameId(false);
      }
    }
    if (!bIsEditingExisting) {
      fetchGames();
    }
  }, [bIsEditingExisting, game.gameId]);

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {!getIsDetailEditorFieldAllValid() && (
        <Callout.Root className="mb-4" color="red">
          <Callout.Icon>
            <Clock />
          </Callout.Icon>
          <Callout.Text>{t("stored-view-required-context-alert")}</Callout.Text>
        </Callout.Root>
      )}
      <div className="space-y-6">
        {/* 게임 ID */}
        <Card>
          <CardHeader>
            <CardTitle>
              {t("gameId")}
              <Text color="red"> *</Text>
            </CardTitle>
            <CardDescription>{t("gameIdDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingGameId ? (
              <div className="flex items-center space-x-2">
                <Spinner className="h-4 w-4" />
                <Text as="span" className="text-muted-foreground">
                  {t("gameIdAutoGen")}
                </Text>
              </div>
            ) : (
              <Input value={game.gameId} disabled />
            )}
          </CardContent>
        </Card>

        <Separator />

        {/* 최신 리비전 */}
        <Card>
          <CardHeader>
            <CardTitle>
              {t("gameLatestRevision")}
              <Text color="red"> *</Text>
            </CardTitle>
            <CardDescription>{t("gameLatestRevisionDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              type="number"
              value={game.gameLatestRevision}
              onChange={(e) => setGameLatestVersion(Number(e.target.value))}
              placeholder="1"
              min="1"
            />
          </CardContent>
        </Card>

        <Separator />

        {/* 플랫폼 지원 */}
        <Card>
          <CardHeader>
            <CardTitle>
              {t("gamePlatform")}
              <Text color="red"> *</Text>
            </CardTitle>
            <CardDescription>{t("gamePlatformDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="windows"
                checked={game.gamePlatformWindows}
                onCheckedChange={(checked) =>
                  setGamePlatformWindows(checked as boolean)
                }
              />
              <Label htmlFor="windows">{t("gamePlatformWindows")}</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="mac"
                checked={game.gamePlatformMac}
                onCheckedChange={(checked) =>
                  setGamePlatformMac(checked as boolean)
                }
              />
              <Label htmlFor="mac">{t("gamePlatformMac")}</Label>
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* 게임 엔진 */}
        <Card>
          <CardHeader>
            <CardTitle>
              {t("gameEngine")}
              <Text color="red"> *</Text>
            </CardTitle>
            <CardDescription>{t("gameEngineDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              value={game.gameEngine}
              onChange={(e) => setGameEngine(e.target.value)}
              placeholder="Unity, Unreal Engine 등"
            />
          </CardContent>
        </Card>

        <Separator />

        {/* 얼리 액세스 */}
        <Card>
          <CardHeader>
            <CardTitle>
              {t("isEarlyAccess")}
              <Text color="red"> *</Text>
            </CardTitle>
            <CardDescription>{t("isEarlyAccessDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="earlyAccess"
                checked={game.isEarlyAccess}
                onCheckedChange={(checked) =>
                  setIsEarlyAccess(checked as boolean)
                }
              />
              <Label htmlFor="earlyAccess">{t("isEarlyAccess")}</Label>
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* 출시 여부 */}
        <Card>
          <CardHeader>
            <CardTitle>
              {t("isReleased")}
              <Text color="red"> *</Text>
            </CardTitle>
            <CardDescription>{t("isReleasedDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="released"
                checked={game.isReleased}
                onCheckedChange={(checked) => setIsReleased(checked as boolean)}
              />
              <Label htmlFor="released">정식 출시됨</Label>
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* 웹사이트 */}
        <Card>
          <CardHeader>
            <CardTitle>
              {t("gameWebsite")}
              <Text color="red"> *</Text>
            </CardTitle>
            <CardDescription>{t("gameWebsiteDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              value={game.gameWebsite}
              onChange={(e) => setGameWebsite(e.target.value)}
              placeholder="https://example.com"
              type="url"
            />
          </CardContent>
        </Card>

        {/* 다운로드 URL */}
        <Card>
          <CardHeader>
            <CardTitle>
              {t("gameDownloadURL")}
              <Text color="red"> *</Text>
            </CardTitle>
            <CardDescription>{t("gameDownloadURLDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {game.gamePlatformMac && (
              <div>
                <Label htmlFor="macDownload">{t("gameDownloadMacURL")}</Label>
                <Input
                  id="macDownload"
                  value={game.gameDownloadMacURL || ""}
                  onChange={(e) => setGameDownloadMacURL(e.target.value)}
                  placeholder="https://example.com/download/mac"
                  type="url"
                />
              </div>
            )}
            {game.gamePlatformWindows && (
              <div>
                <Label htmlFor="winDownload">{t("gameDownloadWinURL")}</Label>
                <Input
                  id="winDownload"
                  value={game.gameDownloadWinURL || ""}
                  onChange={(e) => setGameDownloadWinURL(e.target.value)}
                  placeholder="https://example.com/download/windows"
                  type="url"
                />
              </div>
            )}
          </CardContent>
        </Card>

        <Separator />

        {/* 바이너리 이름 */}
        <Card>
          <CardHeader>
            <CardTitle>
              {t("gameBinaryName")}
              <Text color="red"> *</Text>
            </CardTitle>
            <CardDescription>{t("gameBinaryNameDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              value={game.gameBinaryName}
              onChange={(e) => setGameBinaryName(e.target.value)}
              placeholder="Game.exe, Game.app, Game"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

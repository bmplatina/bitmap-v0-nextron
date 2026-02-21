"use client";

import React, { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { ScrollArea, Skeleton, Text } from "@radix-ui/themes"; // @radix-ui/themes 사용
import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { useTranslation } from "next-i18next";
import { useGameForm } from "@/lib/GamePublishContext";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { extractYoutubeId, imageUriRegExp } from "@/lib/utils";
import { uploadGameImage } from "@/lib/games";

const GameRedirectButton = dynamic(
  () => import("@/components/games/game-redirect-button"),
  {
    ssr: false,
    loading: () => <Skeleton />,
  },
);

export default function GameAssetsUploader() {
  const { t } = useTranslation("GameSubmit");
  const { t: t_common } = useTranslation("common");
  const {
    gameData: game,
    updateField,
    setImage,
    updateImages,
    bIsEditingExisting,
  } = useGameForm();

  const [tempYouTubeVideoId, setTempYouTubeVideoId] = useState<string>("");

  // 통합된 파일 및 미리보기 상태 관리 타입 정의
  type ImageType = "poster" | "gameListBanner" | "gameIcon" | "gameImage";

  const [selectedFiles, setSelectedFiles] = useState<
    Record<ImageType, File | null>
  >({
    poster: null,
    gameListBanner: null,
    gameIcon: null,
    gameImage: null,
  });

  const [previewUrls, setPreviewUrls] = useState<
    Record<ImageType, string | null>
  >({
    poster: null,
    gameListBanner: null,
    gameIcon: null,
    gameImage: null,
  });

  // 개별 Ref 생성 (버그 수정: 하나의 Ref 공유 문제 해결)
  const fileInputRefs = {
    poster: useRef<HTMLInputElement>(null),
    gameListBanner: useRef<HTMLInputElement>(null),
    gameIcon: useRef<HTMLInputElement>(null),
    gameImage: useRef<HTMLInputElement>(null),
  };

  // 컴포넌트 마운트 시 로컬 스토리지에서 캐시된 미리보기(Base64)가 있는지 확인
  useEffect(() => {
    const types: ImageType[] = [
      "poster",
      "gameListBanner",
      "gameIcon",
      "gameImage",
    ];
    types.forEach((type) => {
      const cached = localStorage.getItem(
        `${type}Preview_${game.gameBinaryName}`,
      );
      // gameListBanner의 경우, 기존 로직상 배너 미리보기가 없으면 포스터나 기존 이미지를 보여주지 않도록 null 체크를 신중히 함
      if (cached) {
        setPreviewUrls((prev) => ({ ...prev, [type]: cached }));
      }
    });

    if (bIsEditingExisting) {
      setTempYouTubeVideoId(game.gameVideoURL);
    }
  }, [bIsEditingExisting, game.gameBinaryName, game.gameVideoURL]);

  function handleFileChange(
    e: React.ChangeEvent<HTMLInputElement>,
    imageType: ImageType,
  ) {
    const file = e.target.files?.[0];
    if (file) {
      const objectUrl: string = URL.createObjectURL(file);

      setSelectedFiles((prev) => ({ ...prev, [imageType]: file }));
      setPreviewUrls((prev) => ({ ...prev, [imageType]: objectUrl }));

      // 로컬 스토리지 캐싱
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        localStorage.setItem(
          `${imageType}Preview_${game.gameBinaryName}`,
          base64String,
        );
      };
      reader.readAsDataURL(file);
    }
  }

  async function handleUpload(imageType: ImageType) {
    const token = localStorage.getItem("accessToken");
    const selectedFile = selectedFiles[imageType];

    if (token && selectedFile && game.gameBinaryName.trim().length !== 0) {
      const result = await uploadGameImage(
        selectedFile,
        token,
        game.gameBinaryName,
        (percent) => {},
      );
      if (result.includes("dl")) {
        switch (imageType) {
          case "poster":
            setImage(0, result);
            break;
          case "gameListBanner":
            setImage(1, result);
            break;
          case "gameIcon":
            setImage(2, result);
            break;
          case "gameImage":
            // 0: poster, 1: banner, 2: icon, 3+: previews
            const newImages = [...game.gameImageURL];
            // 3번 인덱스(미리보기)부터 사용하기 위해 앞쪽이 비어있으면 채움
            while (newImages.length < 3) {
              newImages.push("");
            }

            // 3번 인덱스 이상에서 빈 문자열("")인 슬롯이 있다면 그곳에 삽입
            let inserted = false;
            for (let i = 3; i < newImages.length; i++) {
              if (newImages[i] === "") {
                newImages[i] = result;
                inserted = true;
                break;
              }
            }

            // 빈 슬롯을 찾지 못했다면 맨 뒤에 추가
            if (!inserted) {
              newImages.push(result);
            }

            updateImages(newImages);
            break;
        }
        // alert(`${imageType} 업로드 성공`);
      }
    } else {
      alert("파일을 먼저 선택해주세요.");
    }
  }

  function setYouTubeTrailerId(id: string) {
    updateField("gameVideoURL", extractYoutubeId(id));
  }

  return (
    <>
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="space-y-6">
          {/* 유튜브 트레일러 섹션 (기존 유지) */}
          <Card>
            <CardHeader>
              <CardTitle>
                {t("gameVideoURL")}
                <Text color="red"> *</Text>
              </CardTitle>
              <CardDescription className="whitespace-pre-wrap">
                {t("gameVideoURLDesc")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                value={tempYouTubeVideoId}
                onChange={(e) => setTempYouTubeVideoId(e.target.value)}
                placeholder="https://youtu.be/..."
              />
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => setYouTubeTrailerId(tempYouTubeVideoId)}
                disabled={extractYoutubeId(tempYouTubeVideoId).length !== 11}
              >
                {t_common("apply")}
              </Button>
            </CardFooter>
          </Card>

          <Separator />

          {/* 게임 포스터 */}
          <Card>
            <CardHeader>
              <CardTitle>
                {t("gamePoster")}
                <Text color="red"> *</Text>
              </CardTitle>
              <CardDescription className="whitespace-pre-wrap">
                {t("gamePosterDesc")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  readOnly
                  placeholder={t("select-file-placeholder")}
                  value={selectedFiles.poster?.name || ""}
                  onClick={() => fileInputRefs.poster.current?.click()}
                  className="cursor-pointer"
                />
                <input
                  type="file"
                  ref={fileInputRefs.poster}
                  onChange={(e) => handleFileChange(e, "poster")}
                  className="hidden"
                  accept="image/*"
                />
                <Button
                  variant="outline"
                  onClick={() => fileInputRefs.poster.current?.click()}
                >
                  {t("select-file")}
                </Button>
              </div>

              {(previewUrls.poster || game.gameImageURL[0]) && (
                <div className="relative w-48 aspect-[1/1.414] rounded-lg overflow-hidden border bg-muted">
                  <Image
                    src={previewUrls.poster || game.gameImageURL[0]}
                    alt="Poster Preview"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                    {previewUrls.poster
                      ? t("local-preview")
                      : t("server-image")}
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => handleUpload("poster")}
                disabled={!selectedFiles.poster}
              >
                {t("upload")}
              </Button>
            </CardFooter>
          </Card>

          <Separator />

          {/* 게임 배너 이미지 */}
          <Card>
            <CardHeader>
              <CardTitle>
                {t("gameBannerImage")}
                <Text color="red"> *</Text>
              </CardTitle>
              <CardDescription className="whitespace-pre-wrap">
                {t("gameBannerImageDesc")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  readOnly
                  placeholder={t("select-file-placeholder")}
                  value={selectedFiles.gameListBanner?.name || ""}
                  onClick={() => fileInputRefs.gameListBanner.current?.click()}
                  className="cursor-pointer"
                />
                <input
                  type="file"
                  ref={fileInputRefs.gameListBanner}
                  onChange={(e) => handleFileChange(e, "gameListBanner")}
                  className="hidden"
                  accept="image/*"
                />
                <Button
                  variant="outline"
                  onClick={() => fileInputRefs.gameListBanner.current?.click()}
                >
                  {t("select-file")}
                </Button>
              </div>

              {/*(previewUrl || game.gameImageURL[0]) && (
                <div className="relative w-48 aspect-[1/1.414] rounded-lg overflow-hidden border bg-muted">
                  <Image
                    src={previewUrl || game.gameImageURL[0]}
                    alt="Poster Preview"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                    {previewUrl ? " {t("local-preview")}" : "서버 이미지"}
                  </div>
                </div>
              )*/}
              {/* 미리보기 영역: 업로드 전/후 상태를 시각적으로 보여줌 */}
              <div className="flex gap-4 pb-4">
                <GameRedirectButton
                  disabled={true}
                  gameId={game.gameId}
                  gameImageURL={
                    previewUrls.gameListBanner ||
                    game.gameImageURL[1] ||
                    game.gameImageURL[0] ||
                    ""
                  }
                  gameTitle={game.gameTitle}
                  gameDeveloper={game.gameDeveloper}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => handleUpload("gameListBanner")}
                disabled={!selectedFiles.gameListBanner}
              >
                {t("upload")}
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                {t("gamePreviewImage")}
                <Text color="red"> *</Text>
              </CardTitle>
              <CardDescription className="whitespace-pre-wrap">
                {t("gamePreviewImageDesc")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  readOnly
                  placeholder={t("select-file-placeholder")}
                  value={selectedFiles.gameImage?.name || ""}
                  onClick={() => fileInputRefs.gameImage.current?.click()}
                  className="cursor-pointer"
                />
                <input
                  type="file"
                  ref={fileInputRefs.gameImage}
                  onChange={(e) => handleFileChange(e, "gameImage")}
                  className="hidden"
                  accept="image/*"
                />
                <Button
                  variant="outline"
                  onClick={() => fileInputRefs.gameImage.current?.click()}
                >
                  {t("select-file")}
                </Button>
              </div>

              {previewUrls.gameImage && (
                <div className="relative w-48 aspect-video rounded-lg overflow-hidden border bg-muted">
                  <Image
                    src={previewUrls.gameImage}
                    alt="Preview Image"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                    {t("local-preview")}
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => handleUpload("gameImage")}
                disabled={!selectedFiles.gameImage}
              >
                {t("upload-append")}
              </Button>
            </CardFooter>
          </Card>

          <Separator />

          <Card>
            <CardHeader>
              <CardTitle>{t("preview")}</CardTitle>
            </CardHeader>
            <CardContent>
              {/* 하단 전체 미리보기 (기존 유지 및  {t("local-preview")} 반영) */}
              <div className="space-y-6">
                <ScrollArea type="always" scrollbars="horizontal">
                  <div className="flex gap-4 pb-4">
                    {/*  {t("local-preview")}가 있으면 가장 앞에 표시 */}
                    {game.gameVideoURL && (
                      <div className="shrink-0 w-[85vw] md:w-[500px] aspect-video relative rounded-lg overflow-hidden bg-muted">
                        <iframe
                          src={`https://www.youtube.com/embed/${game.gameVideoURL}`}
                          className="absolute inset-0 w-full h-full"
                          allowFullScreen
                        />
                      </div>
                    )}
                    {/*{game.gameImageURL[0] === "" && previewUrl && (
                      <div className="shrink-0 w-[85vw] md:w-[500px] aspect-video relative rounded-lg overflow-hidden ring-4 ring-primary">
                        <Image
                          src={previewUrl}
                          alt="Local Preview"
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center text-white font-bold text-lg">
                          업로드 대기 중
                        </div>
                      </div>
                    )}*/}
                    {/* 기존 서버 이미지들 */}
                    {game.gameImageURL.slice(3).map(
                      (url, index) =>
                        imageUriRegExp.test(url) && (
                          <div
                            key={index}
                            className="shrink-0 w-[85vw] md:w-[500px] aspect-video relative rounded-lg overflow-hidden bg-muted"
                          >
                            <Image
                              src={url}
                              alt={`Screenshot ${index}`}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ),
                    )}
                  </div>
                </ScrollArea>
              </div>
              <Separator />
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

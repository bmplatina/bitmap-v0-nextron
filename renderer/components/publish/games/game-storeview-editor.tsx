"use client";

import { useGameForm } from "@/lib/GamePublishContext";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { cn, formatDate, formatDateToMySQL, imageUriRegExp } from "@/lib/utils";
import {
  Globe,
  Monitor,
  Code,
  User,
  Tag,
  Calendar as LucideCalendar,
  CalendarIcon,
  Clock,
  Pencil,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useLocale, useTranslations } from "next-intl";
import {
  Box,
  Callout,
  IconButton,
  ScrollArea,
  Text,
  TextField,
  Tabs,
  Flex,
} from "@radix-ui/themes";
import { useState, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/AuthContext";
import ClientMarkdown from "@/components/common/markdown/client-markdown";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import MarkdownEditor from "@/components/common/markdown/markdown-editor";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function GameStoreViewEditor() {
  const locale = useLocale();
  const { t } = useTranslation("GamesView");
  const t_gameSubmit = useTranslations("GameSubmit");
  const {
    gameData: game,
    updateField,
    updateLocalizedField,
    getIsStoreviewEditorFieldAllValid,
  } = useGameForm();
  const { username } = useAuth();

  // 게임 설명 모달 상태
  const [isDescriptionKoModalOpen, setIsDescriptionKoModalOpen] =
    useState(false);
  const [isDescriptionEnModalOpen, setIsDescriptionEnModalOpen] =
    useState(false);
  const [tempDescriptionKo, setTempDescriptionKo] = useState<string>("");
  const [tempDescriptionEn, setTempDescriptionEn] = useState<string>("");

  // 게임 요구 사양 모달 상태
  const [isRequirementsWindowsModalOpen, setIsRequirementsWindowsModalOpen] =
    useState(false);
  const [isRequirementsMacModalOpen, setIsRequirementsMacModalOpen] =
    useState(false);
  const [tempRequirementsWindows, setTempRequirementsWindows] =
    useState<string>("");
  const [tempRequirementsMac, setTempRequirementsMac] = useState<string>("");

  // 게임 제목 핸들링
  function setTitle(value: string) {
    updateField("gameTitle", value);
  }
  function getIsTitleWritten(): boolean {
    return game.gameTitle.length > 0;
  }

  // 게임 헤드라인 핸들링
  function setGameHeadline(locale: "ko" | "en", value: string) {
    updateLocalizedField("gameHeadline", locale, value);
  }
  function getIsGameHeadlineWritten(locale: "ko" | "en"): boolean {
    const localeLocal: string =
      locale === "ko" ? game.gameHeadline.ko : game.gameHeadline.en;
    return localeLocal.length > 0;
  }

  // 게임 개발자 핸들링
  function setDeveloper(value: string) {
    updateField("gameDeveloper", value);
  }
  function getIsDeveloperWritten(): boolean {
    return game.gameDeveloper.length > 0;
  }

  // 게임 개발자 핸들링
  function setPublisher(value: string) {
    updateField("gamePublisher", value);
  }
  function getIsPublisherWritten(): boolean {
    return game.gamePublisher.length > 0;
  }

  // 게임 장르 핸들링
  function setGenre(locale: "ko" | "en", value: string) {
    updateLocalizedField("gameGenre", locale, value);
  }
  function getIsGenreWritten(locale: "ko" | "en"): boolean {
    const localeLocal: string =
      locale === "ko" ? game.gameGenre.ko : game.gameGenre.en;
    return localeLocal.length > 0 && localeLocal.length > 0;
  }

  // 게임 출시일 핸들링
  function setReleasedDate(value: Date | undefined) {
    if (value) {
      updateField("gameReleasedDate", formatDateToMySQL(value));
    }
  }
  function getIsReleasedDateSelected(): boolean {
    return game.gameReleasedDate.length > 0;
  }

  // 게임 설명 마크다운 편집 모달 열기
  const openDescriptionModalKo = () => {
    setTempDescriptionKo(game.gameDescription.ko);
    setIsDescriptionKoModalOpen(true);
  };

  const openDescriptionModalEn = () => {
    setTempDescriptionEn(game.gameDescription.en);
    setIsDescriptionEnModalOpen(true);
  };

  // 게임 설명 마크다운 편집 저장
  const saveDescriptionKo = () => {
    updateLocalizedField("gameDescription", "ko", tempDescriptionKo);
    setIsDescriptionKoModalOpen(false);
  };

  const saveDescriptionEn = () => {
    updateLocalizedField("gameDescription", "en", tempDescriptionEn);
    setIsDescriptionEnModalOpen(false);
  };

  // 게임 설명 마크다운 편집 취소
  const cancelDescriptionKo = () => {
    setTempDescriptionKo(game.gameDescription.ko);
    setIsDescriptionKoModalOpen(false);
  };

  const cancelDescriptionEn = () => {
    setTempDescriptionEn(game.gameDescription.en);
    setIsDescriptionEnModalOpen(false);
  };

  // 게임 요구 사양 마크다운 편집 모달 열기
  const openRequirementsWindowsModal = () => {
    setTempRequirementsWindows(game.requirementsWindows ?? "");
    setIsRequirementsWindowsModalOpen(true);
  };

  const openRequirementsMacModal = () => {
    setTempRequirementsMac(game.requirementsMac ?? "");
    setIsRequirementsMacModalOpen(true);
  };

  // 게임 요구 사양 마크다운 편집 저장
  const saveRequirementsWindows = () => {
    updateField("requirementsWindows", tempRequirementsWindows);
    setIsRequirementsWindowsModalOpen(false);
  };

  const saveRequirementsMac = () => {
    updateField("requirementsMac", tempRequirementsMac);
    setIsRequirementsMacModalOpen(false);
  };

  // 게임 설명 마크다운 편집 취소
  const cancelRequirementsWindows = () => {
    setTempRequirementsWindows(game.requirementsWindows ?? "");
    setIsRequirementsWindowsModalOpen(false);
  };

  const cancelRequirementsMac = () => {
    setTempRequirementsMac(game.requirementsMac ?? "");
    setIsRequirementsMacModalOpen(false);
  };

  return (
    <div className="container mx-auto p-6 w-full">
      {!getIsStoreviewEditorFieldAllValid() && (
        <Callout.Root className="mb-4" color="red">
          <Callout.Icon>
            <Clock />
          </Callout.Icon>
          <Callout.Text>
            {t_gameSubmit("stored-view-required-context-alert")}
          </Callout.Text>
        </Callout.Root>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 왼쪽 컬럼 - 이미지 */}
        <div className="lg:col-span-1 lg:sticky lg:top-6 self-start">
          <Suspense
            fallback={
              <div className="aspect-[1/1.414] w-full rounded-lg bg-muted"></div>
            }
          >
            <div className="relative aspect-[1/1.414] w-full rounded-lg overflow-hidden">
              <Image
                src={
                  game.gameImageURL[0] ||
                  "/placeholder.svg?height=600&width=424"
                }
                alt={game.gameTitle}
                fill
                className="object-cover"
                priority
              />
            </div>
          </Suspense>

          <div className="mt-6 space-y-4">
            {game.gameWebsite && (
              <Button variant="outline" className="w-full" asChild>
                <a
                  href={game.gameWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Globe className="mr-2 h-4 w-4" />
                  {t("official-website")}
                </a>
              </Button>
            )}

            <Button className="w-full" asChild>
              <a
                href={`/download?gameId=${game.gameId}`}
                rel="noopener noreferrer"
              >
                <Monitor className="mr-2 h-4 w-4" />
                {t("view-in-bitmap-app")}
              </a>
            </Button>
          </div>
        </div>

        {/* 오른쪽 컬럼 - 상세 정보 */}
        <div className="lg:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <div className="mr-1">
              <Flex gap="2">
                <TextField.Root
                  value={
                    getIsTitleWritten()
                      ? game.gameTitle
                      : t_gameSubmit("gameTitle")
                  }
                  size="3"
                  disabled
                ></TextField.Root>
                <Text size="7" color="red" weight="bold">
                  *
                </Text>
              </Flex>
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <IconButton size="2">
                  <Pencil width="60%" />
                </IconButton>
              </PopoverTrigger>
              <PopoverContent>
                <Card>
                  <CardHeader>
                    <CardTitle>{t_gameSubmit("gameTitle")}</CardTitle>
                    <CardDescription>
                      {t_gameSubmit("gameTitleDesc")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Input
                      value={game.gameTitle}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder={t_gameSubmit("gameTitle")}
                      required
                    />
                  </CardContent>
                </Card>
              </PopoverContent>
            </Popover>
            {!!game.isEarlyAccess && (
              <Badge className="bg-amber-500">{t("early-access")}</Badge>
            )}
          </div>

          <h2 className="text-xl text-muted-foreground mb-6">
            <div className="mr-1">
              <Flex gap="2">
                <Text as="span">{`${t_gameSubmit(
                  "gameHeadline",
                )} (한국어): `}</Text>
                <TextField.Root
                  value={
                    getIsGameHeadlineWritten("ko")
                      ? game.gameHeadline.ko
                      : t_gameSubmit("gameHeadline")
                  }
                  disabled
                ></TextField.Root>
                <Text color="red" weight="bold">
                  *
                </Text>
              </Flex>
              <Flex gap="2">
                <Text as="span">{`${t_gameSubmit(
                  "gameHeadline",
                )} (English): `}</Text>
                <TextField.Root
                  value={
                    getIsGameHeadlineWritten("en")
                      ? game.gameHeadline.en
                      : t_gameSubmit("gameHeadline")
                  }
                  disabled
                ></TextField.Root>
                <Text color="red" weight="bold">
                  *
                </Text>
              </Flex>
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <IconButton size="1">
                  <Pencil width="60%" />
                </IconButton>
              </PopoverTrigger>
              <PopoverContent>
                <Card>
                  <CardHeader>
                    <CardTitle>{t_gameSubmit("gameHeadline")}</CardTitle>
                    <CardDescription>
                      {t_gameSubmit("gameHeadlineDesc")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Input
                      className="mr-2"
                      value={game.gameHeadline.ko}
                      onChange={(e) => setGameHeadline("ko", e.target.value)}
                      placeholder="KO: 게임을 나타내는 한 문장을 입력하십시오."
                    />
                    <Input
                      className="mt-2"
                      value={game.gameHeadline.en}
                      onChange={(e) => setGameHeadline("en", e.target.value)}
                      placeholder="EN: Please enter a one-liner that represents the game."
                    />
                  </CardContent>
                </Card>
              </PopoverContent>
            </Popover>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="flex items-center gap-2">
              <Code className="h-5 w-5 text-muted-foreground" />
              <div className="mr-1">
                <Flex gap="2">
                  <Text as="span">{`${t("developer")}: `}</Text>
                  <TextField.Root
                    value={
                      getIsDeveloperWritten()
                        ? game.gameDeveloper
                        : t_gameSubmit("gameDeveloper")
                    }
                    disabled
                  ></TextField.Root>
                  <Text color="red" weight="bold">
                    *
                  </Text>
                </Flex>
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <IconButton size="1">
                    <Pencil width="60%" />
                  </IconButton>
                </PopoverTrigger>
                <PopoverContent>
                  <Card>
                    <CardHeader>
                      <CardTitle>{t_gameSubmit("gameDeveloper")}</CardTitle>
                      <CardDescription>
                        {t_gameSubmit("gameDeveloperDesc")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Input
                        value={game.gameDeveloper}
                        onChange={(e) => setDeveloper(e.target.value)}
                        placeholder={t_gameSubmit("gameDeveloper")}
                        required
                      />
                    </CardContent>
                  </Card>
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-muted-foreground" />
              <div className="mr-1">
                <Flex gap="2">
                  <Text as="span">{`${t("publisher")}: `}</Text>
                  <TextField.Root
                    value={
                      getIsPublisherWritten()
                        ? game.gamePublisher
                        : t_gameSubmit("gamePublisher")
                    }
                    disabled
                  ></TextField.Root>
                  <Text color="red" weight="bold">
                    *
                  </Text>
                </Flex>
                {username && (
                  <div>
                    <Text as="span">{`${t("author")}: `}</Text>
                    <Text as="span" weight="bold">
                      {username}
                    </Text>
                  </div>
                )}
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <IconButton size="1">
                    <Pencil width="60%" />
                  </IconButton>
                </PopoverTrigger>
                <PopoverContent>
                  <Card>
                    <CardHeader>
                      <CardTitle>{t_gameSubmit("gamePublisher")}</CardTitle>
                      <CardDescription>
                        {t_gameSubmit("gamePublisherDesc")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Input
                        value={game.gamePublisher}
                        onChange={(e) => setPublisher(e.target.value)}
                        placeholder={t_gameSubmit("gamePublisher")}
                        required
                      />
                    </CardContent>
                  </Card>
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-muted-foreground" />
              <div>
                <Flex gap="2">
                  <Text as="span">{`${t("genre")} (한국어): `}</Text>
                  <TextField.Root
                    value={
                      getIsGenreWritten("ko")
                        ? game.gameGenre.ko
                        : t_gameSubmit("gameGenre")
                    }
                    disabled
                  ></TextField.Root>
                  <Text color="red" weight="bold">
                    *
                  </Text>
                </Flex>

                <Flex gap="2">
                  <Text as="span">{`${t("genre")} (English): `}</Text>
                  <TextField.Root
                    value={
                      getIsGenreWritten("en")
                        ? game.gameGenre.en
                        : t_gameSubmit("gameGenre")
                    }
                    disabled
                  ></TextField.Root>
                  <Text color="red" weight="bold">
                    *
                  </Text>
                </Flex>
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <IconButton size="1">
                    <Pencil width="60%" />
                  </IconButton>
                </PopoverTrigger>
                <PopoverContent>
                  <Card>
                    <CardHeader>
                      <CardTitle>{t_gameSubmit("gameGenre")}</CardTitle>
                      <CardDescription>
                        {t_gameSubmit("gameGenreDesc")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Input
                        className="mr-2"
                        value={game.gameGenre.ko}
                        onChange={(e) => setGenre("ko", e.target.value)}
                        placeholder="KO: 액션, RPG, 퍼즐 등"
                        required
                      />
                      <Input
                        className="mt-2"
                        value={game.gameGenre.en}
                        onChange={(e) => setGenre("en", e.target.value)}
                        placeholder="EN: Action, RPG, Puzzle, etc."
                        required
                      />
                    </CardContent>
                  </Card>
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex items-center gap-2">
              <LucideCalendar className="h-5 w-5 text-muted-foreground" />
              <div className="mr-1">
                <Text as="span">{`${t("released-date")}: `}</Text>
                <Text
                  as="span"
                  color={getIsPublisherWritten() ? undefined : "indigo"}
                  weight="bold"
                >
                  {getIsReleasedDateSelected()
                    ? formatDate(locale, game.gameReleasedDate)
                    : t_gameSubmit("gameReleasedDate")}
                </Text>
                <Text as="span" color="red" weight="bold">
                  *
                </Text>
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <IconButton size="1">
                    <Pencil width="60%" />
                  </IconButton>
                </PopoverTrigger>
                <PopoverContent>
                  <Card>
                    <CardHeader>
                      <CardTitle>{t_gameSubmit("gameReleasedDate")}</CardTitle>
                      <CardDescription>
                        {t_gameSubmit("gameReleasedDateDesc")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !game.gameReleasedDate && "text-muted-foreground",
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {game.gameReleasedDate
                              ? format(new Date(game.gameReleasedDate), "PPP", {
                                  locale: ko,
                                })
                              : "날짜를 선택하세요"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={new Date(game.gameReleasedDate)}
                            onSelect={setReleasedDate}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </CardContent>
                  </Card>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {(game.gameVideoURL || game.gameImageURL.length > 1) && (
            <div className="mb-8">
              <Text as="label" size="7" weight="bold" className="mb-4">
                {t("preview")}
              </Text>
              <ScrollArea type="always" scrollbars="horizontal">
                <div className="flex gap-4 pb-4">
                  {game.gameVideoURL && (
                    <div className="shrink-0 w-[500px] aspect-video relative rounded-lg overflow-hidden bg-muted">
                      <iframe
                        src={`https://www.youtube.com/embed/${game.gameVideoURL}`}
                        className="absolute inset-0 w-full h-full"
                        allowFullScreen
                      />
                    </div>
                  )}
                  {game.gameImageURL.slice(3).map(
                    (url, index) =>
                      imageUriRegExp.test(url) && ( // 빈 문자열("") 체크: url이 있을 때만 렌더링
                        <div
                          key={index}
                          className="shrink-0 w-[500px] aspect-video relative rounded-lg overflow-hidden bg-muted"
                        >
                          <Image
                            src={url}
                            alt={`${game.gameTitle} screenshot ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ),
                  )}
                </div>
              </ScrollArea>
            </div>
          )}

          <div className="mb-8">
            <Text as="label" size="7" weight="bold" className="mb-4">{`${t(
              "information-of",
            )} ${
              getIsTitleWritten() ? game.gameTitle : t_gameSubmit("gameTitle")
            }`}</Text>
            <Tabs.Root defaultValue={locale}>
              <Tabs.List>
                <Tabs.Trigger value="ko">한국어</Tabs.Trigger>
                <Tabs.Trigger value="en">English</Tabs.Trigger>
              </Tabs.List>

              <Box pt="3">
                <Tabs.Content value="ko">
                  <ClientMarkdown content={game.gameDescription.ko} />
                  <Dialog
                    open={isDescriptionKoModalOpen}
                    onOpenChange={setIsDescriptionKoModalOpen}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        onClick={openDescriptionModalKo}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        {t_gameSubmit("edit-md")}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-6xl max-h-[80vh]">
                      <DialogHeader>
                        <DialogTitle>{t_gameSubmit("edit-md")}</DialogTitle>
                        <DialogDescription>
                          {t_gameSubmit("edit-md-desc")}
                        </DialogDescription>
                      </DialogHeader>
                      <MarkdownEditor
                        value={tempDescriptionKo}
                        onChange={setTempDescriptionKo}
                        onSave={saveDescriptionKo}
                        onCancel={cancelDescriptionKo}
                      />
                    </DialogContent>
                  </Dialog>
                </Tabs.Content>

                <Tabs.Content value="en">
                  <ClientMarkdown content={game.gameDescription.en} />
                  <Dialog
                    open={isDescriptionEnModalOpen}
                    onOpenChange={setIsDescriptionEnModalOpen}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        onClick={openDescriptionModalEn}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        {t_gameSubmit("edit-md")}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-6xl max-h-[80vh]">
                      <DialogHeader>
                        <DialogTitle>{t_gameSubmit("edit-md")}</DialogTitle>
                        <DialogDescription>
                          {t_gameSubmit("edit-md-desc")}
                        </DialogDescription>
                      </DialogHeader>
                      <MarkdownEditor
                        value={tempDescriptionEn}
                        onChange={setTempDescriptionEn}
                        onSave={saveDescriptionEn}
                        onCancel={cancelDescriptionEn}
                      />
                    </DialogContent>
                  </Dialog>
                </Tabs.Content>
              </Box>
            </Tabs.Root>
          </div>
          <div className="mb-8">
            <Text as="label" size="7" weight="bold" className="mb-4">
              {t("system-requirements")}
            </Text>
            <Tabs.Root defaultValue="windows">
              <Tabs.List>
                <Tabs.Trigger value="windows">Windows</Tabs.Trigger>
                <Tabs.Trigger value="macos">macOS</Tabs.Trigger>
              </Tabs.List>

              <Box pt="3">
                <Tabs.Content value="windows">
                  <ClientMarkdown content={game.requirementsWindows ?? ""} />
                  <Dialog
                    open={isRequirementsWindowsModalOpen}
                    onOpenChange={setIsRequirementsWindowsModalOpen}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        onClick={openRequirementsWindowsModal}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        {t_gameSubmit("edit-md")}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-6xl max-h-[80vh]">
                      <DialogHeader>
                        <DialogTitle>{t_gameSubmit("edit-md")}</DialogTitle>
                        <DialogDescription>
                          {t_gameSubmit("edit-md-desc")}
                        </DialogDescription>
                      </DialogHeader>
                      <MarkdownEditor
                        value={tempRequirementsWindows}
                        onChange={setTempRequirementsWindows}
                        onSave={saveRequirementsWindows}
                        onCancel={cancelRequirementsWindows}
                      />
                    </DialogContent>
                  </Dialog>
                </Tabs.Content>

                <Tabs.Content value="macos">
                  <ClientMarkdown content={game.requirementsMac ?? ""} />
                  <Dialog
                    open={isRequirementsMacModalOpen}
                    onOpenChange={setIsRequirementsMacModalOpen}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        onClick={openRequirementsMacModal}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        {t_gameSubmit("edit-md")}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-6xl max-h-[80vh]">
                      <DialogHeader>
                        <DialogTitle>{t_gameSubmit("edit-md")}</DialogTitle>
                        <DialogDescription>
                          {t_gameSubmit("edit-md-desc")}
                        </DialogDescription>
                      </DialogHeader>
                      <MarkdownEditor
                        value={tempRequirementsMac}
                        onChange={setTempRequirementsMac}
                        onSave={saveRequirementsMac}
                        onCancel={cancelRequirementsMac}
                      />
                    </DialogContent>
                  </Dialog>
                </Tabs.Content>
              </Box>
            </Tabs.Root>
          </div>
        </div>
      </div>
    </div>
  );
}

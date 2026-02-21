import LocalizedLink from "@/components/common/localized-link";
import Image from "next/image";
import type { Game } from "@/lib/types";
import { AspectRatio } from "@radix-ui/themes";
import { useTranslation } from "next-i18next";

interface GameProp {
  gameId: number;
  gameImageURL: string;
  gameTitle: string;
  gameDeveloper: string;
  disabled: boolean;
}

export default function GameRedirectButton({
  gameId,
  gameImageURL,
  gameTitle,
  gameDeveloper,
  disabled,
}: GameProp) {
  const {
    i18n: { language: locale },
    t,
  } = useTranslation();

  return (
    <>
      <LocalizedLink
        key={gameId}
        href={disabled ? "#" : `/${locale}/games/detail?id=${gameId}`}
        className="flex-none w-[85vw] md:w-[300px] aspect-video relative rounded-lg overflow-hidden shadow-md group"
      >
        <AspectRatio ratio={16 / 9}>
          <Image
            src={gameImageURL || "/placeholder.svg?height=400&width=283"}
            alt={gameTitle}
            fill
            className="object-cover object-top transition-transform duration-300 group-hover:scale-105"
          />
          {/* 하단 텍스트 오버레이 */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-4 text-left">
            <h3 className="text-white text-2xl font-bold leading-tight">
              {gameTitle}
            </h3>
            <p className="text-white/80 text-sm font-medium">{gameDeveloper}</p>
          </div>
        </AspectRatio>
      </LocalizedLink>
    </>
  );
}

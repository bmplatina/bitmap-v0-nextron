"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { Button, Text } from "@radix-ui/themes";
import { getCarousel, getLocalizedString, imageUriRegExp } from "@/lib/utils";
import type { Carousel } from "@/lib/types";

const swipeConfidenceThreshold = 10000;
const swipePower = (offset: number, velocity: number) => {
  return Math.abs(offset) * velocity;
};

interface CarouselProps {
  carousels_Server?: Carousel[];
  bFetchFromClient?: boolean;
}

export default function AutoSliderCarousel({
  carousels_Server = [],
  bFetchFromClient,
}: CarouselProps) {
  const router = useRouter();
  const locale = router.locale ?? "en";
  const [[page, direction], setPage] = useState([0, 0]);
  const [carousel, setCarousel] = useState<Carousel[]>([]);

  // 인덱스 계산 (무한 루프)
  const index =
    carousel.length > 0
      ? ((page % carousel.length) + carousel.length) % carousel.length
      : 0;

  useEffect(() => {
    async function fetchCarousel() {
      try {
        const payloads = await getCarousel();
        setCarousel(payloads);
      } catch (err: any) {
        console.error(err);
      }
    }
    if (bFetchFromClient) fetchCarousel();
    else setCarousel(carousels_Server);
  }, [bFetchFromClient]);

  const paginate = (newDirection: number) => {
    setPage((prev) => [prev[0] + newDirection, newDirection]);
  };

  // 1. 자동 재생 로직
  useEffect(() => {
    if (carousel.length > 1) {
      const timer = setInterval(() => {
        paginate(1);
      }, 4000); // 4초마다 전환
      return () => clearInterval(timer);
    }
  }, [carousel.length, page]);

  if (carousel.length === 0) {
    return <div className="w-full h-[500px] bg-gray-100 animate-pulse" />; // 로딩 상태 표시
  }

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? "100%" : "-100%",
      opacity: 1,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? "100%" : "-100%",
      opacity: 1,
    }),
  };

  return (
    <div className="relative w-full h-[500px] overflow-hidden bg-black">
      {/* 2. 사진/텍스트 영역 */}
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={page}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 },
          }}
          drag={carousel.length > 1 ? "x" : false}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={1}
          onDragEnd={(e, { offset, velocity }) => {
            const swipe = swipePower(offset.x, velocity.x);

            if (swipe < -swipeConfidenceThreshold) {
              paginate(1);
            } else if (swipe > swipeConfidenceThreshold) {
              paginate(-1);
            }
          }}
          className="absolute inset-0 flex items-center justify-center"
        >
          {carousel[index].image &&
            imageUriRegExp.test(carousel[index].image) && (
              <Image
                src={carousel[index].image}
                alt="collection"
                className="w-full h-full object-cover"
                fill={true}
                draggable={false}
              />
            )}

          <div className="absolute bottom-24 left-10 right-10 text-center">
            <div className="mb-auto">
              <Text className="text-white text-2xl md:text-4xl font-bold filter drop-shadow-[0_0_15px_black]">
                {getLocalizedString(locale, carousel[index].title)}
              </Text>
              {getLocalizedString(locale, carousel[index].description) !==
                "" && (
                <>
                  <br />
                  <Text className="text-white text-lg md:text-2xl font-light filter drop-shadow-[0_0_15px_black]">
                    {getLocalizedString(locale, carousel[index].description)}
                  </Text>
                </>
              )}
            </div>
            <br />
            {carousel[index].href !== "#" && (
              <Button radius="full" asChild>
                <Link href={carousel[index].href ?? "#"}>
                  {getLocalizedString(locale, carousel[index].button)}
                </Link>
              </Button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* 3. 인디케이터 영역 */}
      {carousel.length > 1 && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {carousel.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                const newDirection = i - index;
                setPage((prev) => [prev[0] + newDirection, newDirection]);
              }}
              className={`h-2 rounded-full transition-all ${
                i === index ? "w-8 bg-white" : "w-2 bg-white/50"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { Flex, Text } from "@radix-ui/themes";
import { motion, Variants } from "framer-motion";
import Lottie from "lottie-react";
import { useIsMobile } from "@/hooks/use-mobile";
import BitmapAnim from "@/public/lottie/BitmapSquare.json";

interface ShowTextProps {
  bHideText?: boolean;
  text?: string;
  size?: "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";
}

export default function BitmapAppAnim({
  bHideText = false,
  text = "BITMAP",
  size = "8",
}: ShowTextProps) {
  const bIsMobile = useIsMobile();

  function getLiteralSize():
    | "1"
    | "2"
    | "3"
    | "4"
    | "5"
    | "6"
    | "7"
    | "8"
    | "9" {
    if (bIsMobile) {
      const sz = Number(size) - 2;
      if (Number(size) >= 1 && Number(size) <= 3) return size;
      else return sz.toString() as "4" | "5" | "6" | "7" | "8" | "9";
    }
    return size;
  }

  // Variants를 정의하면 코드가 훨씬 깔끔해집니다.
  const charVariants: Variants = {
    hidden: {
      opacity: 0,
    },
    visible: (i: number) => ({
      opacity: [0, 1, 0, 0.8, 0, 1], // 불투명도가 변하며 깜빡임 유도
      transition: {
        duration: 0.5,
        delay: 1 + Math.random() * 0.5,
        // 무작위성을 더하고 싶다면 Math.random()을 섞을 수도 있습니다.
        times: [0, 0.2, 0.4, 0.6, 0.8, 1],
      },
    }),
  };

  return (
    <Flex align="center" justify="center" gap="3" mb="2">
      <div
        style={{
          width: Number(getLiteralSize()) * 8,
          height: Number(getLiteralSize()) * 8,
        }}
        className="shrink-0"
      >
        <Lottie
          animationData={BitmapAnim}
          loop={false}
          autoplay={true}
          className="invert dark:invert-0 shrink-0"
        />
      </div>
      <motion.div className="flex" initial="hidden" animate="visible">
        {!bHideText &&
          text.split("").map((char, i) => (
            <motion.span
              key={i}
              custom={i}
              variants={charVariants}
              style={{ display: "inline-block" }}
            >
              <Text
                as="span"
                weight="bold"
                className="whitespace-nowrap tracking-tighter"
                style={{ fontSize: `${Number(getLiteralSize()) * 7}px` }} // style로 직접 주입
              >
                {char === " " ? "\u00A0" : char}
              </Text>
            </motion.span>
          ))}
      </motion.div>
    </Flex>
  );
}

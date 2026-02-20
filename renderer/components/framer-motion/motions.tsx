"use client";

import { motion, Variants } from "framer-motion";
import { ReactNode } from "react";

// Fade In
interface FadeInProps {
  children: ReactNode;
  delay?: number; // 선택적 프롭 (기본값 설정 가능)
  duration?: number;
  className?: string;
}

function FadeIn({
  children,
  delay = 1.5,
  duration = 1,
  className = "",
}: FadeInProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay, duration }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface FadeInWithScaleProps {
  children: ReactNode;
  initialScale?: number;
  duration?: number;
  className?: string;
}

function FadeInWithScale({
  children,
  initialScale = 0.95,
  duration = 0.8,
  className = "",
}: FadeInWithScaleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: initialScale }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Fade In Up
function getFadeInUpVariants(
  opacity = 0,
  y = 50,
  duration = 0.8,
  delay = 0,
): Variants {
  return {
    hidden: { opacity, y },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration, delay, ease: "easeOut" },
    },
  };
}

interface FadeInUpProps {
  children: ReactNode;
  opacity?: number;
  y?: number;
  duration?: number;
  delay?: number;
  viewportMargin?: number;
  className?: string;
}

function FadeInUp({
  children,
  opacity = 0,
  y = 50,
  duration = 0.8,
  delay = 0,
  viewportMargin = -100,
  className = "",
}: FadeInUpProps) {
  const fadeInUp: Variants = getFadeInUpVariants(opacity, y, duration, delay);

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: `${viewportMargin}px` }}
      variants={fadeInUp}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function FadeInUpNoInit({ children }: { children: ReactNode }) {
  const fadeInUp = getFadeInUpVariants();

  return <motion.div variants={fadeInUp}>{children}</motion.div>;
}

// Stagger Container
function getStaggerContainer(staggerChildren = 0.2): Variants {
  return {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren,
      },
    },
  };
}

interface StaggerContainerProps {
  children: ReactNode;
  staggerChildren?: number;
}

function StaggerContainer({
  children,
  staggerChildren = 0.2,
}: StaggerContainerProps) {
  const staggerContainer: Variants = getStaggerContainer(staggerChildren);
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={staggerContainer}
    >
      {children}
    </motion.div>
  );
}

export { FadeIn, FadeInUp, FadeInWithScale, StaggerContainer, FadeInUpNoInit };

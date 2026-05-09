import { useEffect, useState } from "react";
import BitmapAppAnim from "./bitmap-app/bitmap-app-anim";
import { Flex, Spinner, Text } from "@radix-ui/themes";
import { useAuth } from "@/lib/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginSplash() {
  const { isLoading: authLoading } = useAuth();
  const [isExiting, setIsExiting] = useState(false);
  const [isComponentVisible, setIsComponentVisible] = useState(true);

  useEffect(() => {
    // authLoading이 true(로딩 중)에서 false(로딩 완료)가 되면 사라짐 시작
    if (!authLoading) {
      setIsExiting(true);
    }
  }, [authLoading]);

  if (!isComponentVisible) return null;

  return (
    <AnimatePresence onExitComplete={() => setIsComponentVisible(false)}>
      {!isExiting && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] bg-background flex flex-col items-center justify-center electron-drag"
        >
          <BitmapAppAnim text="BITMAP APP" />
          <Flex justify="center" align="center" gap="2" className="mt-4">
            <Text size="2" weight="medium" color="gray">
              Loading…
            </Text>
            <Spinner size="2" />
          </Flex>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

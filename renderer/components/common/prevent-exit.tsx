"use client";

import { useEffect } from "react";

export default function PreventExit() {
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      // 현대 브라우저에서는 이 메시지 대신 시스템 기본 메시지가 출력됩니다.
      // e.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  return null;
}

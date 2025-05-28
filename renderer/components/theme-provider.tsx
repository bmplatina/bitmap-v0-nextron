"use client"

import { useEffect, useState } from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ThemeProviderProps } from "next-themes"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const [mounted, setMounted] = useState(false)

  // useEffect는 클라이언트 사이드에서만 실행됩니다
  useEffect(() => {
    setMounted(true)
  }, [])

  // 마운트되기 전에는 테마 관련 속성을 적용하지 않습니다
  if (!mounted) {
    return <>{children}</>
  }

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

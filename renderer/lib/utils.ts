import axios from "axios";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Carousel, YouTubeQuery, stringLocalized } from "@/lib/types";
import dayjs from "dayjs";
import localFont from "next/font/local";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const imageUriRegExp: RegExp = /^https?:\/\/.*\.(jpg|jpeg|png)$/i;

const pretendard = localFont({
  src: "../pages/[locale]/fonts/Pretendard/PretendardVariable.woff2", // 경로 확인 필요
  display: "swap",
  variable: "--font-pretendard", // CSS 변수 선언
  weight: "45 920",
});

async function ssrAxiosGet<T>(
  uriSubstring: string,
  token?: string,
): Promise<T> {
  const response = await axios.get<T>(getApiLinkByPurpose(uriSubstring), {
    timeout: 30000,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
  return response.data;
}

async function ssrAxiosPost<T>(
  uriSubstring: string,
  body: object,
  token: string,
): Promise<T> {
  const response = await axios.post<T>(
    getApiLinkByPurpose(uriSubstring),
    body,
    {
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return response.data;
}

/**
 * 숫자를 지정된 범위 내로 제한합니다.
 * @param value 제한할 숫자
 * @param min 최소값
 * @param max 최대값
 */
function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function getLocalizedString(locale: string, t: stringLocalized): string {
  return locale === "ko" ? t.ko : t.en;
}

const formatDateToMySQL = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatDate = (locale: string, dateString: string) => {
  if (!dateString) return "미정";
  const format: string = locale === "ko" ? "YYYY/MM/DD" : "MM/DD/YYYY";
  return dayjs(dateString).format(format);
};

// 간단한 마크다운 렌더링 함수
const renderMarkdown = (text: string | null | undefined) => {
  if (!text || typeof text !== "string") return "";

  let html = text.replace(/\\n/g, "\n");

  // --- 인용문 처리 ---
  html = html.replace(
    /^> (.*$)/gim,
    '<Quote class="mt-4 mb-2 pl-4 border-l-4 border-muted-foreground italic text-muted-foreground">$1</Quote>',
  );

  // --- 헤더 처리 (크기 Up!) ---
  html = html
    // H3: text-lg -> text-xl (조금 더 크게)
    .replace(
      /^### (.*$)/gim,
      '<h3 class="text-xl font-bold mt-6 mb-2 text-foreground">$1</h3>',
    )
    // H2: text-xl -> text-3xl (확실히 크게)
    .replace(
      /^## (.*$)/gim,
      '<h2 class="text-3xl font-extrabold mt-10 mb-3 tracking-tight text-foreground">$1</h2>',
    )
    // H1: text-2xl -> text-4xl (가장 크게)
    .replace(
      /^# (.*$)/gim,
      '<h1 class="text-4xl font-black mt-12 mb-4 tracking-tight text-foreground">$1</h1>',
    );

  // --- 인라인 스타일 ---
  html = html
    .replace(
      /\*\*(.*?)\*\*/gim,
      '<strong class="font-bold text-foreground">$1</strong>',
    )
    .replace(/\*(.*?)\*/gim, '<em class="italic">$1</em>')
    .replace(
      /`([^`]+)`/gim,
      '<code class="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-foreground">$1</code>',
    );

  // --- 줄바꿈 정리 ---
  html = html.replace(/(<\/h[1-3]>|<\/Quote>)\n/g, "$1");
  html = html.replace(/\n/g, "<br />");

  return html;
};

function extractYoutubeId(input: string): string {
  // 1. 이미 ID 형태(11자리, 특수문자 포함 가능)만 입력되었는지 확인하는 정규식
  // 유튜브 ID는 보통 11자리이며 영문 대소문자, 숫자, -, _ 로 구성됩니다.
  const idOnlyRegex = /^[a-zA-Z0-9_-]{11}$/;

  // 2. 다양한 유튜브 URL 패턴에서 ID를 추출하는 정규식
  // - youtube.com/watch?v=ID
  // - youtu.be/ID
  // - youtube.com/embed/ID
  // - youtube.com/v/ID
  const urlRegex =
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;

  // 먼저 입력값이 이미 11자리 ID인지 확인
  if (idOnlyRegex.test(input)) {
    return input;
  }

  // URL에서 ID 추출 시도
  const match = input.match(urlRegex);

  if (match && match[1]) {
    return match[1];
  }

  // 매칭되는 것이 없다면 빈 문자열 또는 원본 반환 (에러 처리에 따라 선택)
  return input;
}

/**
 * API 링크 생성
 * @param substring 도메인 뒤 링크
 */
function getApiLinkByPurpose(substring: string): string {
  const API_DOMAIN: string = "https://api.prodbybitmap.com/";

  // // 클라이언트 환경(브라우저)에서는 CORS 방지를 위해 Next.js Rewrite 프록시 사용
  // if (typeof window !== "undefined") {
  //   const basePath = "/absproxy/3000";
  //   if (window.location.pathname.startsWith(basePath)) {
  //     return `${basePath}/api-proxy/${substring}`;
  //   }
  //   return `/api-proxy/${substring}`;
  // }
  return `${API_DOMAIN}${substring}`;
}

// 서버 사이드에서 데이터를 가져오는 함수
async function getYouTubeVideos(channelId: string): Promise<string[]> {
  try {
    const data = await ssrAxiosGet<YouTubeQuery>(
      `youtube/get-videos/${channelId}`,
    );

    if (data?.success) {
      return data.videoIds;
    }
    return [];
  } catch (error) {
    console.error("비디오 ID 가져오는 중 오류 발생:", error);
    return [];
  }
}

async function getCarousel(): Promise<Carousel[]> {
  try {
    const data = await ssrAxiosGet<Carousel[]>("general/carousel");

    return data;
  } catch (err: any) {
    return [];
  }
}

export {
  cn,
  clamp,
  extractYoutubeId,
  formatDate,
  formatDateToMySQL,
  getApiLinkByPurpose,
  getCarousel,
  getLocalizedString,
  getYouTubeVideos,
  imageUriRegExp,
  pretendard,
  renderMarkdown,
  ssrAxiosGet,
  ssrAxiosPost,
};

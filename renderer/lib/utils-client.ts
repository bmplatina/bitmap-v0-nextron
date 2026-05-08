import type {
  bitmapApi as BitmapAPI,
  tools as ElectronTools,
} from "@/types/electron";
import { MouseEvent } from "react";

const BitmapInternalLink: RegExp = /^\/(auth|games|legal)/;

async function csrAxiosGet<T>(
  bitmapApi: BitmapAPI,
  uriSubstring: string,
  token?: string,
): Promise<T> {
  const response = await bitmapApi.axiosGet<T>(uriSubstring, token ?? "");
  return response;
}

async function csrAxiosPost<T>(
  bitmapApi: BitmapAPI,
  uriSubstring: string,
  body: object,
  token?: string,
  contentType?: string,
): Promise<T> {
  const response = await bitmapApi.axiosPost<T>(
    uriSubstring,
    body,
    token,
    contentType,
  );
  return response;
}

/**
 * onClink={openExternal} 이 설정되어 있으면 클라이언트의 기본 브라우저로 href를 새 탭에서 호출한다
 * @param event href 자동 감지
 */
function openExternal(
  event: MouseEvent<HTMLAnchorElement>,
  electronTools: ElectronTools,
) {
  event.preventDefault();
  const url = (event.currentTarget as HTMLAnchorElement).href;

  // TypeScript 안전성 확보
  if (electronTools) {
    electronTools.openExternal(url);
  } else {
    console.warn("Electron external link function not available");
  }
}

/**
 * onClink={openExternal} 이 설정되어 있으면 클라이언트의 기본 브라우저로 href를 새 탭에서 호출한다
 * @param event href 자동 감지
 */
function openExternalByUri(uri: string, electronTools: ElectronTools) {
  // TypeScript 안전성 확보
  if (electronTools) {
    electronTools.openExternal(uri);
  } else {
    console.warn("Electron external link function not available");
  }
}

async function getPlatform(context: ElectronTools) {
  const platform = await context.getPlatform();
  return platform;
}

async function getDownloadCacheSize(context: BitmapAPI) {
  const result = (await context.getDesyncCacheSize()) as unknown;

  if (typeof result === "number") {
    return result;
  }

  if (
    result &&
    typeof result === "object" &&
    "size" in result &&
    typeof result.size === "number"
  ) {
    return result.size;
  }

  return 0;
}

async function removeDownloadCache(
  context: BitmapAPI,
  setCacheSize: (size: number) => void,
) {
  const success = await context.removeDesyncCache();
  if (success) {
    alert("캐시가 성공적으로 제거되었습니다.");
    const size = await getDownloadCacheSize(context);
    setCacheSize(size);
  } else {
    alert("캐시 제거에 실패했습니다.");
  }
}

function formatBytesToGB(bytes: number) {
  return Number((bytes / 1024 ** 3).toFixed(2));
}

export {
  BitmapInternalLink,
  csrAxiosGet,
  csrAxiosPost,
  openExternal,
  openExternalByUri,
  getPlatform,
  getDownloadCacheSize,
  removeDownloadCache,
  formatBytesToGB,
};

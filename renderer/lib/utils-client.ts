import type {
  bitmapApi as BitmapAPI,
  tools as ElectronTools,
} from "@/types/electron";
import { MouseEvent } from "react";

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

export { csrAxiosGet, csrAxiosPost, openExternal, openExternalByUri, getPlatform };

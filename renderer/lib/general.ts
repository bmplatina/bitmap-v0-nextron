import type {
  MembershipApplies,
  stringLocalized,
  DocumentArchives,
  Portfolio,
  GitHubRelease,
} from "@/lib/types";
import { csrAxiosGet, csrAxiosPost } from "./utils-client";
import { bitmapApi } from "@/types/electron";

async function getEula(
  context: bitmapApi,
  eula: string,
): Promise<stringLocalized> {
  try {
    const response = await csrAxiosGet<stringLocalized>(
      context,
      `getEula-${eula}`,
      `general/eula/${eula}`,
    );

    if (response.ko) {
      return response;
    }
    return { ko: "", en: "" };
  } catch (error) {
    console.error("EULA 가져오는 중 오류 발생:", error);
    return { ko: "", en: "" };
  }
}

async function getAllArchiveDocs(
  context: bitmapApi,
): Promise<DocumentArchives[]> {
  try {
    const response = await csrAxiosGet<DocumentArchives[]>(
      context,
      "getAllArchiveDocs",
      "general/archive",
    );

    if (response) {
      return response;
    }
    return [];
  } catch (error) {
    console.error("EULA 가져오는 중 오류 발생:", error);
    return [];
  }
}

async function getArchiveDocument(
  context: bitmapApi,
  documentTitle: string,
): Promise<DocumentArchives> {
  try {
    const response = await csrAxiosGet<DocumentArchives>(
      context,
      `getArchiveDocument-${documentTitle}`,
      `general/archive/${documentTitle}`,
    );

    if (response) {
      return response;
    }
    return { id: 0, title: "", content: "", lastUpdatedAt: "" };
  } catch (error) {
    console.error("EULA 가져오는 중 오류 발생:", error);
    return { id: 0, title: "", content: "", lastUpdatedAt: "" };
  }
}

async function getMembers(
  context: bitmapApi,
  scope: "approved" | "all" | "pending",
): Promise<MembershipApplies[]> {
  try {
    const response = await csrAxiosGet<MembershipApplies[]>(
      context,
      `getMembers-${scope}`,
      `general/members/${scope}`,
    );

    return response || [];
  } catch (error) {
    console.error("멤버 데이터를 가져오는 중 오류 발생:", error);

    // API 오류 시 빈 배열 반환 (또는 fallback 데이터 사용 가능)
    return [];
  }
}

async function getPortfolio(
  context: bitmapApi,
  uid: string,
): Promise<Portfolio> {
  try {
    const response = await csrAxiosGet<Portfolio>(
      context,
      `getPortfolio-${uid}`,
      `general/portfolio/${uid}`,
    );

    if (response) {
      return response;
    }
  } catch (error) {
    console.error("Portfolio 가져오는 중 오류 발생:", error);
  }
  return {
    uid: "", // varchar(36)
    position: "", // varchar(36)
    headline: "", // text
    stack: "", // text
    skills: [], // json (배열 형태일 경우)
    portfolioIntroduction: "", // text
    project: [], // json (객체 배열 형태일 경우)
    portfolioPdfUri: "", // text
  };
}

async function getBitmapAppFromGitHub(context: bitmapApi) {
  try {
    const response = await csrAxiosGet<{
      cachedAt: string | null;
      release: GitHubRelease;
    }>(context, "getBitmapAppFromGitHub", `general/app/latest`);

    if (response && response.release) return response.release;
  } catch (error) {
    console.error("Bitmap App 가져오는 중 오류 발생:", error);
  }
}

export {
  getAllArchiveDocs,
  getArchiveDocument,
  getMembers,
  getEula,
  getPortfolio,
  getBitmapAppFromGitHub,
};

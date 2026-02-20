import axios from "axios";
import type {
  MembershipApplies,
  stringLocalized,
  DocumentArchives,
  Portfolio,
} from "@/lib/types";
import { getApiLinkByPurpose } from "./utils";

async function getEula(eula: string): Promise<stringLocalized> {
  try {
    const response = await axios.get<stringLocalized>(
      getApiLinkByPurpose(`general/eula/${eula}`),
      {
        timeout: 10000,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      },
    );

    if (response.data?.ko) {
      return response.data;
    }
    return { ko: "", en: "" };
  } catch (error) {
    console.error("EULA 가져오는 중 오류 발생:", error);
    return { ko: "", en: "" };
  }
}

async function getAllArchiveDocs(): Promise<DocumentArchives[]> {
  try {
    const response = await axios.get<DocumentArchives[]>(
      getApiLinkByPurpose(`general/archive`),
      {
        timeout: 10000,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      },
    );

    if (response.data) {
      return response.data;
    }
    return [];
  } catch (error) {
    console.error("EULA 가져오는 중 오류 발생:", error);
    return [];
  }
}

async function getArchiveDocument(
  documentTitle: string,
): Promise<DocumentArchives> {
  try {
    const response = await axios.get<DocumentArchives>(
      getApiLinkByPurpose(`general/archive/${documentTitle}`),
      {
        timeout: 10000,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      },
    );

    if (response.data) {
      return response.data;
    }
    return { id: 0, title: "", content: "", lastUpdatedAt: "" };
  } catch (error) {
    console.error("EULA 가져오는 중 오류 발생:", error);
    return { id: 0, title: "", content: "", lastUpdatedAt: "" };
  }
}

async function getMembers(
  scope: "approved" | "all" | "pending",
): Promise<MembershipApplies[]> {
  try {
    const response = await axios.get<MembershipApplies[]>(
      getApiLinkByPurpose(`general/members/${scope}`),
      {
        timeout: 10000, // 10초 타임아웃
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      },
    );

    return response.data;
  } catch (error) {
    console.error("멤버 데이터를 가져오는 중 오류 발생:", error);

    // API 오류 시 빈 배열 반환 (또는 fallback 데이터 사용 가능)
    return [];
  }
}

async function getPortfolio(uid: string): Promise<Portfolio> {
  try {
    const response = await axios.get<Portfolio>(
      getApiLinkByPurpose(`general/portfolio/${uid}`),
      {
        timeout: 10000,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      },
    );

    if (response.data) {
      return response.data;
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

export {
  getAllArchiveDocs,
  getArchiveDocument,
  getMembers,
  getEula,
  getPortfolio,
};

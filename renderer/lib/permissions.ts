import axios from "axios";
import type {
  MembershipApplies,
  MembershipApplyRequest,
  MembershipLeaveRequest,
} from "@/lib/types";
import { getApiLinkByPurpose } from "./utils";

const emptyMembershipApplies: MembershipApplies = {
  id: 0,
  locale: "",
  uid: "",
  name: "",
  alias: "",
  age: 0,
  introduction: "",
  motivation: "",
  affiliate: "",
  field: [],
  prodTools: "",
  portfolio: "",
  youtubeHandle: "",
  avatarUri: "",
  position: "",
  isApproved: false,
};

/**
 * Bitmap 팀원 신청
 * @param token uid 검증을 위한 토큰
 * @param body 신청 정보
 * @returns
 */
async function applyMembership(token: string, body: MembershipApplyRequest) {
  try {
    const response = await axios.post(
      getApiLinkByPurpose(`permissions/members/apply`),
      body,
      {
        timeout: 10000, // 10초 타임아웃
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return response.data;
  } catch (error: any) {
    console.error("멤버 데이터를 가져오는 중 오류 발생:", error);

    // API 오류 시 에러 메시지 객체 반환
    return { message: error.message || "server-error" };
  }
}

/**
 * 모든 Bitmap 팀원 신청 목록 조회
 * @param token uid 검증을 위한 토큰
 * @returns MembershipApplies[]
 */
async function getMembershipApplications(token: string) {
  try {
    const response = await axios.get<MembershipApplies[]>(
      getApiLinkByPurpose(`permissions/members/apply`),
      {
        timeout: 10000, // 10초 타임아웃
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return response.data;
  } catch (error: any) {
    console.error("멤버 데이터를 가져오는 중 오류 발생:", error);

    // API 오류 시 에러 메시지 객체 반환
    return { message: error.message || "server-error" };
  }
}

/**
 * 특정 ID를 가진 Bitmap 팀원 신청 정보 조회
 * @param token uid 검증을 위한 토큰 (undefined일 때 마스터 토큰 사용)
 * @param id 신청 ID
 * @returns MembershipApplies
 */
async function getMembershipApplicationById(
  token: string = process.env.NEXT_PUBLIC_MASTER_TOKEN || "",
  id: string,
): Promise<MembershipApplies> {
  try {
    const response = await axios.get<MembershipApplies>(
      getApiLinkByPurpose(`permissions/members/apply/${id}`),
      {
        timeout: 10000, // 10초 타임아웃
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return response.data;
  } catch (error: any) {
    console.error("멤버 데이터를 가져오는 중 오류 발생:", error);
    return emptyMembershipApplies;
  }
}

/**
 * ADMIN: 특정 uid의 계정 팀원 권한 부여
 * @param token admin 검증을 위한 토큰 검증
 * @param uid 신청을 받아줄 계정 uid
 */
async function grantMembershipApplyByUid(
  token: string,
  uid: string,
): Promise<string> {
  try {
    const response = await axios.post(
      ///members/apply/grant/:uid
      getApiLinkByPurpose(`permissions/members/apply/grant/${uid}`),
      {},
      {
        timeout: 10000, // 10초 타임아웃
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response.data.message;
  } catch (error: any) {
    console.error("멤버 데이터를 가져오는 중 오류 발생:", error);
    return "error";
  }
}

/**
 * Bitmap 팀원 탈퇴 신청
 * @param token uid 검증을 위한 토큰
 * @param body 탈퇴 정보
 * @returns
 */
async function leaveMembership(token: string, body: MembershipLeaveRequest) {
  try {
    const response = await axios.post(
      getApiLinkByPurpose(`permissions/members/leave`),
      body,
      {
        timeout: 10000, // 10초 타임아웃
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return response.data;
  } catch (error: any) {
    console.error("멤버 데이터를 가져오는 중 오류 발생:", error);

    // API 오류 시 에러 메시지 객체 반환
    return { message: error.message || "server-error" };
  }
}

async function getMembershipLeaveReqs(
  token: string = process.env.NEXT_PUBLIC_MASTER_TOKEN || "",
) {
  try {
    const response = await axios.get(
      getApiLinkByPurpose(`permissions/members/leave`),
      {
        timeout: 10000, // 10초 타임아웃
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return response.data;
  } catch (error: any) {
    console.error("멤버 데이터를 가져오는 중 오류 발생:", error);

    // API 오류 시 에러 메시지 객체 반환
    return { message: error.message || "server-error" };
  }
}

async function getMembershipLeaveReqById(
  token: string = process.env.NEXT_PUBLIC_MASTER_TOKEN || "",
  id: string,
) {
  try {
    const response = await axios.get(
      getApiLinkByPurpose(`permissions/members/leave/${id}`),
      {
        timeout: 10000, // 10초 타임아웃
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return response.data;
  } catch (error: any) {
    console.error("멤버 데이터를 가져오는 중 오류 발생:", error);

    // API 오류 시 에러 메시지 객체 반환
    return { message: error.message || "server-error" };
  }
}

/**
 * ADMIN: 특정 uid의 계정 팀원 권한 부여
 * @param token admin 검증을 위한 토큰 검증
 * @param uid 신청을 받아줄 계정 uid
 */
async function grantMembershipLeavingByUid(
  token: string,
  uid: string,
): Promise<string> {
  try {
    const response = await axios.post(
      ///members/leave/grant/:uid
      getApiLinkByPurpose(`permissions/members/leave/grant/${uid}`),
      {},
      {
        timeout: 10000, // 10초 타임아웃
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response.data.message;
  } catch (error: any) {
    console.error("멤버 데이터를 가져오는 중 오류 발생:", error);
    return "error";
  }
}

async function switchBitmapDeveloper(token: string) {
  try {
    const response = await axios.post(
      getApiLinkByPurpose(`permissions/developer/apply`),
      {},
      {
        timeout: 10000, // 10초 타임아웃
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return response.data;
  } catch (error: any) {
    console.error("멤버 데이터를 가져오는 중 오류 발생:", error);

    // API 오류 시 에러 메시지 객체 반환
    return { message: error.message || "server-error" };
  }
}

export {
  // Applicant Options
  applyMembership,
  leaveMembership,
  switchBitmapDeveloper,
  // Admin Options
  getMembershipApplications,
  getMembershipApplicationById,
  grantMembershipApplyByUid,
  getMembershipLeaveReqs,
  getMembershipLeaveReqById,
  grantMembershipLeavingByUid,
};

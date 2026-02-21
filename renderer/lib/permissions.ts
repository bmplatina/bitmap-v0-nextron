import type {
  MembershipApplies,
  MembershipApplyRequest,
  MembershipLeaveRequest,
  MembershipLeaves,
} from "@/lib/types";
import { csrAxiosGet, csrAxiosPost } from "./utils-client";
import { getApiLinkByPurpose } from "./utils";
import { bitmapApi } from "@/types/electron";

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
async function applyMembership(
  context: bitmapApi,
  token: string,
  body: MembershipApplyRequest,
) {
  try {
    const response = await csrAxiosPost<MembershipApplies[]>(
      context,
      "permissions/members/apply",
      body,
      token,
    );

    return response;
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
async function getMembershipApplications(context: bitmapApi, token: string) {
  try {
    const response = await csrAxiosGet<MembershipApplies[]>(
      context,
      "permissions/members/apply",
      token,
    );

    return response;
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
  context: bitmapApi,
  token: string = process.env.NEXT_PUBLIC_MASTER_TOKEN || "",
  id: string,
): Promise<MembershipApplies> {
  try {
    const response = await csrAxiosGet<MembershipApplies>(
      context,
      `permissions/members/apply/${id}`,
      token,
    );

    return response;
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
  context: bitmapApi,
  token: string,
  uid: string,
): Promise<string> {
  try {
    const response = await csrAxiosPost<{ message: string }>(
      context,
      `permissions/members/apply/grant/${uid}`,
      {},
      token,
    );
    return response.message;
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
async function leaveMembership(
  context: bitmapApi,
  token: string,
  body: MembershipLeaveRequest,
): Promise<{ message: string }> {
  try {
    const response = await csrAxiosPost<{ message: string }>(
      context,
      "permissions/members/leave",
      body,
      token,
    );

    return response;
  } catch (error: any) {
    console.error("멤버 데이터를 가져오는 중 오류 발생:", error);

    // API 오류 시 에러 메시지 객체 반환
    return { message: error.message || "server-error" };
  }
}

async function getMembershipLeaveReqs(
  context: bitmapApi,
  token: string = process.env.NEXT_PUBLIC_MASTER_TOKEN || "",
) {
  try {
    const response = await csrAxiosGet<MembershipLeaves[]>(
      context,
      "permissions/members/leave",
      token,
    );

    return response;
  } catch (error: any) {
    console.error("멤버 데이터를 가져오는 중 오류 발생:", error);

    // API 오류 시 에러 메시지 객체 반환
    return { message: error.message || "server-error" };
  }
}

async function getMembershipLeaveReqById(
  context: bitmapApi,
  token: string = process.env.NEXT_PUBLIC_MASTER_TOKEN || "",
  id: string,
) {
  try {
    const response = await csrAxiosGet(
      context,
      `permissions/members/leave/${id}`,
      token,
    );

    return response;
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
  context: bitmapApi,
  token: string,
  uid: string,
): Promise<string> {
  try {
    const response = await csrAxiosPost<{ message: string }>(
      context,
      `permissions/members/leave/grant/${uid}`,
      {},
      token,
    );
    return response.message;
  } catch (error: any) {
    console.error("멤버 데이터를 가져오는 중 오류 발생:", error);
    return "error";
  }
}

async function switchBitmapDeveloper(
  context: bitmapApi,
  token: string,
): Promise<{ message: string }> {
  try {
    const response = await csrAxiosPost<{ message: string }>(
      context,
      "permissions/developer/apply",
      {},
      token,
    );

    return response;
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

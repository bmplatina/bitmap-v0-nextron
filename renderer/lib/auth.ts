import { jwtDecode } from "jwt-decode";
import { csrAxiosGet, csrAxiosPost } from "./utils-client";
import {
  AuthResponse,
  AuthResponseInternal,
  ErrorResponse,
  SignupResponse,
  UserProfile,
} from "./types";
import { bitmapApi, tools } from "@/types/electron";

async function checkIsLoggedIn(context: bitmapApi): Promise<boolean> {
  if (typeof window === "undefined") return false; // 서버 사이드 렌더링 방지

  try {
    const token = await context.getToken();
    if (!token) return false;

    const decoded = jwtDecode(token);
    // exp는 초 단위이므로 1000을 곱해 밀리초로 변환 후 현재 시간과 비교
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      context.setToken(""); // 만료됐으면 삭제
      return false;
    }
    return true; // 토큰 있고 만료 안 됨 -> 로그인 상태
  } catch (error) {
    return false; // 토큰 형식이 이상함
  }
}

const getProfile = async (
  context: bitmapApi,
  token: string = process.env.NEXT_PUBLIC_MASTER_TOKEN || "",
  uid: string,
): Promise<UserProfile> => {
  try {
    const response = await csrAxiosPost<UserProfile>(
      context,
      `getProfile-${uid}`,
      "auth/profile/query/uid", // 백엔드 라우트 주소와 일치 확인
      {
        uid,
      },
      token,
    );

    // 2. 백엔드에서 보낸 JSON 구조에 맞춰 할당
    // 백엔드 응답: { username: "...", email: "..." }
    return response;
  } catch (error: any) {
    // 3. 에러 핸들링 구체화
    if (error.code === "ECONNABORTED") {
      console.error("요청 시간이 초과되었습니다.");
    } else {
      console.error(
        "데이터를 불러오는 중 에러 발생:",
        error.response?.data?.message,
      );
    }
  }
  return {
    id: 0,
    username: "Bitmap",
    email: "public@prodbybitmap.com",
    isAdmin: false,
    isDeveloper: false,
    isTeammate: false,
    avatarUri: "",
    createdAt: "",
    google_id: "",
    uid: "",
    isEmailVerified: false,
  };
};

async function getMyProfile(
  context: bitmapApi,
  token: string,
): Promise<UserProfile> {
  try {
    const res = await csrAxiosGet<UserProfile>(
      context,
      "getMyProfile",
      "auth/profile",
      token,
    );
    return res;
  } catch (error) {
    console.error("유저 정보 불러오기 실패", error);
  }
  return {
    id: 0,
    username: "Bitmap",
    email: "public@prodbybitmap.com",
    isAdmin: false,
    isDeveloper: false,
    isTeammate: false,
    avatarUri: "",
    createdAt: "",
    google_id: "",
    uid: "",
    isEmailVerified: false,
  };
}

/**
 * 로그인 핸들링 함수
 * @param email
 * @param password
 * @returns 유효한 로그인이면 토큰을, 유효하지 않으면 로그인 실패 이유를 반환
 */
async function login(
  context: bitmapApi,
  email: string,
  password: string,
  bKeepLoggedIn: boolean,
): Promise<AuthResponseInternal> {
  try {
    console.log("Electron Axios Posting");
    const response = await csrAxiosPost<AuthResponse>(
      context,
      "login",
      "auth/login",
      {
        email: email,
        password: password,
        bKeepLoggedIn: bKeepLoggedIn,
      },
    );

    if (response.token) {
      return { success: true, token: response.token };
    }
    // bSetLoggedInState(true);
  } catch (error: any) {
    return { success: false, token: error.message || "login-failed" };
  }

  return { success: false, token: "" };
}

async function signup(
  context: bitmapApi,
  locale: string,
  username: string,
  email: string,
  password: string,
  avatarUri: string,
): Promise<SignupResponse> {
  try {
    const response = await csrAxiosPost<SignupResponse>(
      context,
      "signup",
      "auth/signup",
      { locale, username, email, password, avatarUri },
    );
    return response;
  } catch (error: any) {
    // 백엔드에서 보낸 에러 메시지 처리 (예: "username-exists", "require-id-pw")
    const message = error.response?.data || "server-error";
    throw new Error(message);
  }
}

async function verifyEmail(
  context: bitmapApi,
  token: string,
  code: string,
): Promise<string> {
  try {
    const response = await csrAxiosPost<string>(
      context,
      "email-verify",
      "auth/email/verify",
      { code },
      token,
    );

    return response;
  } catch (error: any) {
    // [수정됨] 네트워크 에러 등 response가 없는 경우에 대한 방어 코드 추가
    if (error.response && error.response.data) {
      return error.response.data;
    }
    // 서버 응답이 없거나 다른 에러인 경우
    return "server-error";
  }
}

async function sendVerifyEmail(
  context: bitmapApi,
  locale: string,
  token: string,
): Promise<string> {
  try {
    const response = await csrAxiosPost<string>(
      context,
      "send-email",
      "auth/email/send",
      { locale },
      token,
    );

    return response;
  } catch (error: any) {
    // [수정됨] 네트워크 에러 등 response가 없는 경우에 대한 방어 코드 추가
    if (error.response && error.response.data) {
      return error.response.data;
    }
    // 서버 응답이 없거나 다른 에러인 경우
    return "server-error";
  }
}

async function checkIsEmailDuplicated(
  context: bitmapApi,
  email: string,
): Promise<boolean> {
  try {
    const response = await csrAxiosPost<boolean>(
      context,
      "check-email-duplication",
      "auth/signup/check-duplicate",
      { email },
    );

    // 백엔드 반환값: isAvailable (true: 사용 가능, false: 중복)
    // 함수 반환값: isDuplicated (true: 중복, false: 사용 가능)
    return !response;
  } catch (error: any) {
    console.error("이메일 중복 확인 실패:", error);
    return false;
  }
}

async function editProfileElement(
  context: bitmapApi,
  method: "username" | "password" | "avatarUri",
  token: string,
  newValue: string,
): Promise<string> {
  const formattedKey = `new${method.charAt(0).toUpperCase()}${method.slice(1)}`; // 예: { username: "newName" } 또는 { password: "newPass" } 또는 { avatarUri: "newUri" }
  try {
    const response = await csrAxiosPost<{ message: string }>(
      context,
      "editProfile",
      `auth/edit/${method}`,
      { [formattedKey]: newValue },
      token,
    );

    if (response.message) {
      return response.message;
    }
    // bSetLoggedInState(true);
  } catch (error: any) {
    return error.message || "server-error";
  }
  return "server-error";
}

async function uploadProfilePics(
  context: bitmapApi,
  formData: FormData,
  token: string,
  onProgress?: (progress: number) => void,
): Promise<{
  message: string;
  filePath: string;
  uri: string;
  uploaderUid: string;
}> {
  const IDENTIFIER = "uploadAvatar";
  const removeListener = context.onAxiosPostProgress(IDENTIFIER, (progress) => {
    // React 상태 업데이트 로직 등을 여기에 작성
    if (onProgress) {
      onProgress(progress);
    }
  });

  try {
    const response = await csrAxiosPost<{
      message: string;
      filePath: string;
      uri: string;
      uploaderUid: string;
    }>(
      context,
      IDENTIFIER,
      "upload/avatar",
      formData,
      token,
      "multipart/form-data",
    );
    // "Content-Type": "",
    if (response.uri) {
      return response;
    }
  } catch (error) {
    console.error("Profile image upload failed:", error);
  } finally {
    removeListener();
  }
  return {
    message: "server-error",
    filePath: "",
    uri: "",
    uploaderUid: "",
  };
}

export {
  checkIsLoggedIn,
  getProfile,
  getMyProfile,
  editProfileElement,
  login,
  signup,
  checkIsEmailDuplicated,
  verifyEmail,
  sendVerifyEmail,
  uploadProfilePics,
};

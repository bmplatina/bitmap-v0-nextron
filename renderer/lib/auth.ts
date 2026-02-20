import { jwtDecode } from "jwt-decode";
import { getApiLinkByPurpose } from "./utils";
import axios from "axios";
import {
  AuthResponse,
  AuthResponseInternal,
  ErrorResponse,
  SignupResponse,
  UserProfile,
} from "./types";

function checkIsLoggedIn() {
  if (typeof window === "undefined") return false; // 서버 사이드 렌더링 방지

  const token = localStorage.getItem("accessToken");
  if (!token) return false;

  try {
    const decoded = jwtDecode(token);
    // exp는 초 단위이므로 1000을 곱해 밀리초로 변환 후 현재 시간과 비교
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      localStorage.removeItem("accessToken"); // 만료됐으면 삭제
      return false;
    }
    return true; // 토큰 있고 만료 안 됨 -> 로그인 상태
  } catch (error) {
    return false; // 토큰 형식이 이상함
  }
}

const getProfile = async (
  token: string = process.env.NEXT_PUBLIC_MASTER_TOKEN || "",
  uid: string,
): Promise<UserProfile> => {
  try {
    const response = await axios.post<UserProfile>(
      getApiLinkByPurpose("auth/profile/query/uid"), // 백엔드 라우트 주소와 일치 확인
      {
        uid,
      },
      {
        timeout: 30000,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    // 2. 백엔드에서 보낸 JSON 구조에 맞춰 할당
    // 백엔드 응답: { username: "...", email: "..." }
    return response.data;
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

/**
 * 로그인 핸들링 함수
 * @param email
 * @param password
 * @returns 유효한 로그인이면 토큰을, 유효하지 않으면 로그인 실패 이유를 반환
 */
async function login(
  email: string,
  password: string,
  bKeepLoggedIn: boolean,
): Promise<AuthResponseInternal> {
  try {
    const response = await axios.post<AuthResponse>(
      getApiLinkByPurpose("auth/login"),
      {
        email: email,
        password: password,
        bKeepLoggedIn: bKeepLoggedIn,
      },
      {
        timeout: 30000, // 30초 타임아웃
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (response.data.token) {
      return { success: true, token: response.data.token };
    }
    // bSetLoggedInState(true);
  } catch (error) {
    if (axios.isAxiosError<ErrorResponse>(error)) {
      // error가 AxiosError<ErrorResponse> 타입임이 확인됨
      // 이제 error.response?.data?.message 와 같이 안전하게 접근 가능

      const payload = error.response?.data;
      const errorMessage: string =
        typeof payload === "string"
          ? payload
          : (payload?.message ?? "알 수 없는 에러가 발생했습니다.");
      console.error("로그인 실패:", errorMessage);
      return { success: false, token: errorMessage };

      // 서버에서 보낸 구체적인 에러 메시지를 alert 등으로 사용자에게 보여줄 수 있습니다.
      // alert(errorMessage);
    } else {
      // Axios 에러가 아닌 다른 종류의 에러 처리 (예: 네트워크 연결 실패 전 요청 설정 오류)
      console.error("예상치 못한 에러가 발생했습니다:", error);
    }
    // bSetLoggedInState(false);
  }
  return { success: false, token: "" };
}

async function signup(
  locale: string,
  username: string,
  email: string,
  password: string,
  avatarUri: string,
): Promise<SignupResponse> {
  try {
    const response = await axios.post<SignupResponse>(
      getApiLinkByPurpose("auth/signup"),
      { locale, username, email, password, avatarUri },
    );
    return response.data;
  } catch (error: any) {
    // 백엔드에서 보낸 에러 메시지 처리 (예: "username-exists", "require-id-pw")
    const message = error.response?.data || "server-error";
    throw new Error(message);
  }
}

async function verifyEmail(token: string, code: string): Promise<string> {
  try {
    const response = await axios.post<string>(
      getApiLinkByPurpose("auth/email/verify"),
      { code },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return response.data;
  } catch (error: any) {
    // [수정됨] 네트워크 에러 등 response가 없는 경우에 대한 방어 코드 추가
    if (error.response && error.response.data) {
      return error.response.data;
    }
    // 서버 응답이 없거나 다른 에러인 경우
    return "server-error";
  }
}

async function sendVerifyEmail(locale: string, token: string): Promise<string> {
  try {
    const response = await axios.post<string>(
      getApiLinkByPurpose("auth/email/send"),
      { locale },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return response.data;
  } catch (error: any) {
    // [수정됨] 네트워크 에러 등 response가 없는 경우에 대한 방어 코드 추가
    if (error.response && error.response.data) {
      return error.response.data;
    }
    // 서버 응답이 없거나 다른 에러인 경우
    return "server-error";
  }
}

async function checkIsEmailDuplicated(email: string): Promise<boolean> {
  try {
    const response = await axios.post<boolean>(
      getApiLinkByPurpose("auth/signup/check-duplicate"),
      { email },
    );

    // 백엔드 반환값: isAvailable (true: 사용 가능, false: 중복)
    // 함수 반환값: isDuplicated (true: 중복, false: 사용 가능)
    return !response.data;
  } catch (error: any) {
    console.error("이메일 중복 확인 실패:", error);
    return false;
  }
}

async function editProfileElement(
  method: "username" | "password" | "avatarUri",
  token: string,
  newValue: string,
): Promise<string> {
  const formattedKey = `new${method.charAt(0).toUpperCase()}${method.slice(1)}`; // 예: { username: "newName" } 또는 { password: "newPass" } 또는 { avatarUri: "newUri" }
  try {
    const response = await axios.post<{ message: string }>(
      getApiLinkByPurpose(`auth/edit/${method}`),
      { [formattedKey]: newValue },
      {
        timeout: 30000, // 30초 타임아웃
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (response.data.message) {
      return response.data.message;
    }
    // bSetLoggedInState(true);
  } catch (error) {
    if (axios.isAxiosError<ErrorResponse>(error)) {
      // error가 AxiosError<ErrorResponse> 타입임이 확인됨
      // 이제 error.response?.data?.message 와 같이 안전하게 접근 가능

      const payload = error.response?.data;
      const errorMessage: string =
        typeof payload === "string"
          ? payload
          : (payload?.message ?? "알 수 없는 에러가 발생했습니다.");
      console.error("로그인 실패:", errorMessage);
      return errorMessage;

      // 서버에서 보낸 구체적인 에러 메시지를 alert 등으로 사용자에게 보여줄 수 있습니다.
      // alert(errorMessage);
    } else {
      // Axios 에러가 아닌 다른 종류의 에러 처리 (예: 네트워크 연결 실패 전 요청 설정 오류)
      console.error("예상치 못한 에러가 발생했습니다:", error);
    }
    // bSetLoggedInState(false);
  }
  return "server-error";
}

export {
  checkIsLoggedIn,
  getProfile,
  editProfileElement,
  login,
  signup,
  checkIsEmailDuplicated,
  verifyEmail,
  sendVerifyEmail,
};

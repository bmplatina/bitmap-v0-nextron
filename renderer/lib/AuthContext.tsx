"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { checkIsLoggedIn } from "./auth"; // 위에서 만든 함수
import { useRouter } from "next/router";
import axios from "axios";
import { getApiLinkByPurpose } from "./utils";
import { jwtDecode } from "jwt-decode";

interface AuthContextType {
  bIsLoggedIn: boolean;
  login: (token: string) => Promise<void>; // 반환 타입을 Promise<void>로 변경
  logout: () => void;
  username: string;
  uid: string;
  email: string;
  bIsAdmin: boolean;
  bIsDeveloper: boolean;
  bIsTeammate: boolean;
  avatarUri: string;
  bIsEmailVerified: boolean;
  isLoading: boolean;
  fetchUser: (token: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// 편하게 쓰기 위한 커스텀 훅
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [bIsLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [bIsAdmin, setIsAdmin] = useState(false);
  const [bIsDeveloper, setIsDeveloper] = useState(false);
  const [bIsTeammate, setIsTeammate] = useState(false);
  const [avatarUri, setAvatarUri] = useState("");
  const [bIsEmailVerified, setIsEmailVerified] = useState(true);
  const [uid, setUid] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const fetchUser = async (token: string) => {
    if (!token) return;

    try {
      const res = await axios.get(getApiLinkByPurpose("auth/profile"), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // API 응답에 없으면 토큰에서 직접 디코딩하여 확인 (강력한 대비책)
      if (res.data === undefined) {
        try {
          const decoded: any = jwtDecode(token);
          console.log("JWT 수동 디코딩", decoded);
          setUsername(decoded.username);
          setEmail(decoded.email);
          setIsAdmin(!!decoded.isAdmin);
          setIsDeveloper(!!decoded.isDeveloper);
          setIsTeammate(!!decoded.isTeammate);
          setIsEmailVerified(!!decoded.isEmailVerified);
          setUid(decoded.uid);
          setAvatarUri(decoded.avatarUri);
        } catch (e) {
          console.error("토큰 디코딩 실패:", e);
        }
      } else {
        setUsername(res.data.username);
        setEmail(res.data.email);
        setIsAdmin(!!res.data.isAdmin);
        setIsDeveloper(!!res.data.isDeveloper);
        setIsTeammate(!!res.data.isTeammate);
        setIsEmailVerified(!!res.data.isEmailVerified);
        setUid(res.data.uid);
        setAvatarUri(res.data.avatarUri);
      }
    } catch (error) {
      console.error("유저 정보 불러오기 실패", error);
    }
  };

  // 1. 앱이 켜지자마자 로그인 상태 체크
  useEffect(() => {
    const initializeAuth = async () => {
      const token = window.bitmapApi.getToken();
      if (token) {
        await fetchUser(token);
      }
      setIsLoggedIn(checkIsLoggedIn());
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  // 2. 로그인 함수 (로그인 성공 시 실행)
  const login = async (token: string) => {
    // async 키워드 추가
    window.bitmapApi.setToken(token);
    setIsLoggedIn(true);
    await fetchUser(token); // 유저 정보를 다 가져올 때까지 기다림
    router.push("/");
  };

  // 3. 로그아웃 함수
  const logout = () => {
    window.bitmapApi.setToken("");
    setIsLoggedIn(false);
    router.push("/"); // 로그아웃 후 이동
    // window.location.reload(); // 필요하다면 새로고침으로 상태 초기화
  };

  return (
    <AuthContext.Provider
      value={{
        bIsLoggedIn,
        login,
        logout,
        username,
        uid,
        email,
        bIsAdmin,
        bIsDeveloper,
        bIsTeammate,
        avatarUri,
        bIsEmailVerified,
        isLoading,
        fetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

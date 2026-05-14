import {
  Game,
  GameList,
  GameRating,
  GameRatingRequest,
  GameWithSize,
  Playtime,
} from "@/lib/types";
import { getApiLinkByPurpose } from "@/lib/utils";
import {
  csrAxiosDelete,
  csrAxiosGet,
  csrAxiosPost,
  csrAxiosPut,
} from "./utils-client";
import { bitmapApi } from "@/types/electron";

// API에서 게임 데이터를 가져오는 함수 - 서버 컴포넌트에서만 호출
async function getGames(
  context: bitmapApi,
  getPendingOnly: "released" | "pending" | "all",
  listPage?: number,
): Promise<GameList[]> {
  try {
    const API_LINK =
      typeof listPage === "number"
        ? `games/list?page=${listPage}`
        : "games/list";
    const data = await csrAxiosGet<GameList[]>(
      context,
      "getGameList",
      API_LINK,
    );

    if (getPendingOnly === "all") {
      return data;
    }

    return data.filter((game) => {
      if (getPendingOnly === "released") return game.isApproved;
      if (getPendingOnly === "pending") return !game.isApproved;
      return true;
    });
  } catch (error) {
    console.error("게임 데이터를 가져오는 중 오류 발생:", error);

    // API 오류 시 빈 배열 반환 (또는 fallback 데이터 사용 가능)
    return [];
  }
}

// API에서 특정 게임 데이터를 가져오는 함수
async function getGameById(
  context: bitmapApi,
  id: string,
): Promise<GameWithSize | null> {
  try {
    const data = await csrAxiosGet<GameWithSize>(
      context,
      "getGameById",
      `games/pick/${id}`,
    );
    return data || null;
  } catch (error) {
    console.error("게임 데이터를 가져오는 중 오류 발생:", error);
    return null;
  }
}

async function getGamesByUid(
  context: bitmapApi,
  token: string,
): Promise<Game[]> {
  try {
    const data = await csrAxiosGet<Game[]>(
      context,
      "getGamesByUid",
      "games/list/uid",
      token,
    );

    return data;
  } catch (error) {
    console.error("게임 데이터를 가져오는 중 오류 발생:", error);

    // API 오류 시 빈 배열 반환 (또는 fallback 데이터 사용 가능)
    return [];
  }
}

// API에서 특정 대기 중인 게임 데이터를 가져오는 함수
async function submitGame(
  context: bitmapApi,
  token: string,
  newGame: Game,
  bIsEditingExisting: boolean,
): Promise<{ message: string; id: string }> {
  const apiRoutesLink = "games/publish";
  try {
    const axiosAction = bIsEditingExisting ? csrAxiosPut : csrAxiosPost;
    // API 호출
    const data = await axiosAction<{ message: string; id: string }>(
      context,
      "submitGame",
      apiRoutesLink,
      newGame,
      token,
    );

    console.log("Submit succeed:", data);

    // 성공 알림
    return data;
  } catch (error: any) {
    console.error("게임 제출 중 오류 발생:", error.message);
    throw error;
  }
}

async function uploadGameImage(
  context: bitmapApi,
  file: File | null,
  token: string,
  gameBinaryName: string,
  onProgress?: (progress: number) => void,
): Promise<string> {
  if (!file) return "file-not-found";
  if (gameBinaryName === "") return "name-not-specified";
  const POST_NAME = `upload${gameBinaryName}`;
  const formData = new FormData();
  // Multer에서 req.body를 파일 처리 시점에 읽으려면 텍스트 필드를 파일보다 먼저 append 해야 합니다.
  formData.append("gameBinaryName", gameBinaryName);
  formData.append("image", file); // Express의 upload.single('image')와 일치해야 함

  const removeListener = context.onAxiosPostProgress(POST_NAME, (progress) => {
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
      POST_NAME,
      "upload/game/image",
      formData, // 별도의 Header 설정 없이 body에 바로 전달
      token,
    );

    const data = response;
    alert("업로드 성공: " + data.uri);
    return data.uri as string;
  } catch (error: any) {
    console.error("업로드 실패:", error);
    return error.message;
  } finally {
    removeListener();
  }
}

// API에서 특정 게임 데이터를 가져오는 함수
async function getGameRatesById(
  context: bitmapApi,
  id: string,
): Promise<GameRating[] | null> {
  try {
    const data = await csrAxiosGet<GameRating[]>(
      context,
      "getGameRatesById",
      `games/rate/${id}`,
    );
    return data;
  } catch (error) {
    console.error("게임 데이터를 가져오는 중 오류 발생:", error);
    return null;
  }
}

// API에서 특정 대기 중인 게임 데이터를 가져오는 함수
async function submitGameRate(
  context: bitmapApi,
  token: string,
  newGame: GameRatingRequest,
  bIsUpdating: boolean,
): Promise<{ message: string }> {
  const axiosAction = bIsUpdating ? csrAxiosPut : csrAxiosPost;
  try {
    // API 호출
    const data = await axiosAction<{ message: string }>(
      context,
      `submitGameRate-${newGame.gameId}`,
      `games/rate/${newGame.gameId}`,
      newGame,
      token,
    );
    console.log("Submit succeed:", data);

    // 성공 알림
    return data;
  } catch (error: any) {
    console.error("게임 평점 편집 중 오류 발생:", error.message);
    throw error;
  }
}

// API에서 특정 대기 중인 게임 데이터를 가져오는 함수
async function deleteGameRate(
  context: bitmapApi,
  token: string,
  gameId: number,
): Promise<{ message: string }> {
  try {
    // API 호출
    const data = await csrAxiosDelete<{ message: string }>(
      context,
      `games/rate/${gameId}`,
      {},
      token,
    );

    console.log("Deletion succeed:", data);

    // 성공 알림
    return data;
  } catch (error: any) {
    console.error("게임 평점 삭제 중 오류 발생:", error.message);
    throw error;
  }
}

async function getGamePlaytime(
  context: bitmapApi,
  token: string,
  gameId: number,
) {
  try {
    const data = await csrAxiosGet<Playtime>(
      context,
      "getGamePlaytime",
      `games/playtime/${gameId}`,
      token,
    );
    return data;
  } catch (error) {
    console.error("게임 플레이타임을 가져오는 중 오류 발생:", error);
    return null;
  }
}

async function setGamePlaytime(
  context: bitmapApi,
  token: string,
  gameId: number,
  playtime: number,
) {
  try {
    const data = await csrAxiosPost<{
      message: string;
      id: string;
    }>(
      context,
      "setGamePlaytime",
      `games/playtime/${gameId}`,
      { playtime },
      token,
    );
    return data;
  } catch (error) {
    console.error("게임 플레이타임을 설정하는 중 오류 발생:", error);
    return null;
  }
}

async function updateGamePlaytime(
  context: bitmapApi,
  token: string,
  gameId: number,
  playtime: number,
) {
  try {
    const data = await csrAxiosPut<{
      message: string;
    }>(
      context,
      "updateGamePlaytime",
      `games/playtime/${gameId}`,
      { playtime },
      token,
    );
    return data;
  } catch (error) {
    console.error("게임 플레이타임을 업데이트하는 중 오류 발생:", error);
    return null;
  }
}

export {
  getGames,
  getGameById,
  getGamesByUid,
  submitGame,
  uploadGameImage,
  getGameRatesById,
  submitGameRate,
  deleteGameRate,
  getGamePlaytime,
  setGamePlaytime,
  updateGamePlaytime,
};

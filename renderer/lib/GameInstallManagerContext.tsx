import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from "react";
import { Game, GameInstallManager } from "@/lib/types";
import { getPlatform } from "./utils-client";

interface GameInstallManagerContextType {
  bIsMac: boolean;
  // 현재 활성화된 모든 매니저 목록
  managers: Map<number, GameInstallManager>;
  // 특정 게임의 매니저를 가져오거나 없으면 생성
  getManager: (game: Game) => GameInstallManager;
  removeManager: (gameId: number) => void;
  clearManagers: () => void;
  addManager: (manager: GameInstallManager) => void;
}

const GameInstallManagerContext = createContext<
  GameInstallManagerContextType | undefined
>(undefined);

export function GameInstallManagerProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [bIsMac, setIsMac] = useState(false);

  // Map을 사용하여 게임 ID별로 매니저 인스턴스를 유일하게 관리
  const [managers, setManagers] = useState<Map<number, GameInstallManager>>(
    new Map(),
  );

  const getManager = useCallback(
    (game: Game) => {
      // 1. 이미 해당 게임의 매니저가 있다면 반환
      if (managers.has(game.gameId)) {
        return managers.get(game.gameId)!;
      }

      // 2. 없다면 새로 생성하여 등록
      const newManager = new GameInstallManager(bIsMac);
      newManager.setGameInfo = game; // 기본 정보 세팅

      setManagers((prev) => {
        const next = new Map(prev);
        next.set(game.gameId, newManager);
        return next;
      });

      return newManager;
    },
    [managers],
  );

  const removeManager = useCallback((gameId: number) => {
    setManagers((prev) => {
      const next = new Map(prev);
      next.delete(gameId);
      return next;
    });
  }, []);

  const clearManagers = useCallback(() => {
    setManagers(new Map());
  }, []);

  const addManager = useCallback((manager: GameInstallManager) => {
    setManagers((prev) => {
      const next = new Map(prev);
      next.set(manager.getGameInfo.gameId, manager);
      return next;
    });
  }, []);

  React.useEffect(
    function () {
      async function setPlatform() {
        const platform = await getPlatform(window.electronTools);
        setIsMac(platform === "darwin");
        console.log("GameInstallManagerContext::bIsMac: ", bIsMac);
      }
      setPlatform();
    },
    [bIsMac],
  );

  return (
    <GameInstallManagerContext.Provider
      value={{
        bIsMac,
        managers,
        getManager,
        removeManager,
        clearManagers,
        addManager,
      }}
    >
      {children}
    </GameInstallManagerContext.Provider>
  );
}

export const useGameInstallManager = () => {
  const context = useContext(GameInstallManagerContext);
  if (!context)
    throw new Error(
      "useGameInstallManager must be used within a GameInstallManagerProvider",
    );
  return context;
};

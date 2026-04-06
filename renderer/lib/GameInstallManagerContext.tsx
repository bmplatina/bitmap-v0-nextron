import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from "react";
import { GameInstallManager, GameWithSize } from "@/lib/types";
import { getPlatform } from "./utils-client";
import { makeAutoObservable, observable } from "mobx";

interface GameInstallManagerContextType {
  bIsMac: boolean;
  store: {
    managers: Map<number, GameInstallManager>;
    add: (manager: GameInstallManager) => void;
    remove: (gameId: number) => void;
    clear: () => void;
  };
  // 특정 게임의 매니저를 가져오거나 없으면 생성
  getManager: (game: GameWithSize) => GameInstallManager;
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

  // MobX observable Map을 상태로 관리
  const [store] = useState(() =>
    makeAutoObservable({
      managers: observable.map<number, GameInstallManager>(),
      add(manager: GameInstallManager) {
        this.managers.set(manager.getGameInfo.gameId, manager);
      },
      remove(gameId: number) {
        this.managers.delete(gameId);
      },
      clear() {
        this.managers.clear();
      },
    }),
  );

  const getManager = useCallback(
    (game: GameWithSize) => {
      // 1. 이미 해당 게임의 매니저가 있다면 반환
      if (store.managers.has(game.gameId)) {
        return store.managers.get(game.gameId)!;
      }

      // 2. 없다면 새로 생성하여 등록
      const newManager = new GameInstallManager(bIsMac);
      newManager.setGameInfo = game; // 기본 정보 세팅

      store.add(newManager);

      return newManager;
    },
    [bIsMac, store],
  );

  React.useEffect(function () {
    async function setPlatform() {
      const platform = await getPlatform(window.electronTools);
      const isMac = platform === "darwin";
      setIsMac(isMac);
      console.log("GameInstallManagerContext::bIsMac: ", isMac);
    }
    setPlatform();
  }, []);

  return (
    <GameInstallManagerContext.Provider
      value={{
        bIsMac,
        store,
        getManager,
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

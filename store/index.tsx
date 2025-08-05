import {UIStore} from "./ui";
import {AuthStore} from "@/store/auth";

import { createContext, useContext } from "react";
import { PlayerStore } from "./player";

let store: {
  player: PlayerStore;
  ui: UIStore;
  auth: AuthStore;
};

function initializeStore() {
  return {
    player: new PlayerStore(),
    ui: new UIStore(),
    auth: new AuthStore(),
  };
}

const StoreContext = createContext<ReturnType<typeof initializeStore> | null>(null);

export const StoreProvider = ({ children }: { children: React.ReactNode }) => {
  store = initializeStore();
  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("StoreProvider is missing");
  }
  return context;
};

export const usePlayerStore = () => useStore().player;
export const useAuthStore = () => useStore().auth;

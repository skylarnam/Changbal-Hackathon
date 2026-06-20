import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useReducer, useState } from "react";
import type { AnalyzerExtraction, AppStateShape } from "../domain/types";
import { clearPersistedState, defaultAppState, loadPersistedState, savePersistedState } from "../services/storage/appStorage";
import { appReducer, type AppAction } from "./appReducer";

interface AppContextValue {
  state: AppStateShape;
  dispatch: React.Dispatch<AppAction>;
  loading: boolean;
  storageError: string | null;
  draftExtraction: AnalyzerExtraction | null;
  setDraftExtraction: (draft: AnalyzerExtraction | null) => void;
  resetState: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: PropsWithChildren) {
  const [state, dispatch] = useReducer(appReducer, defaultAppState);
  const [loading, setLoading] = useState(true);
  const [storageError, setStorageError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [draftExtraction, setDraftExtraction] = useState<AnalyzerExtraction | null>(null);

  useEffect(() => {
    let mounted = true;
    loadPersistedState()
      .then((persisted) => {
        if (mounted) {
          dispatch({ type: "hydrate", state: persisted });
        }
      })
      .catch(() => {
        if (mounted) {
          setStorageError("저장된 데이터를 불러오지 못해 기본 상태로 시작했어요.");
        }
      })
      .finally(() => {
        if (mounted) {
          setHydrated(true);
          setLoading(false);
        }
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }
    savePersistedState(state).catch(() => {
      setStorageError("현재 상태를 저장하지 못했어요. 다시 시도해 주세요.");
    });
  }, [hydrated, state]);

  const value = useMemo<AppContextValue>(
    () => ({
      state,
      dispatch,
      loading,
      storageError,
      draftExtraction,
      setDraftExtraction,
      resetState: async () => {
        await clearPersistedState();
        setDraftExtraction(null);
        dispatch({ type: "resetAll" });
      }
    }),
    [draftExtraction, loading, state, storageError]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppState(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppState must be used within AppProvider");
  }
  return context;
}

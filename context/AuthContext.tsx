import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";

import {
  getCompanyCodes,
  login as orkaLogin,
  OrkaCompany,
  OrkaUser,
  setCompanyCode,
} from "@/lib/api";

type AuthStatus = "loading" | "loggedOut" | "loggedIn" | "companySelected";

type AuthState = {
  status: AuthStatus;
  apiKey?: string;
  companyYear?: number;
  loginToken?: string;
  loginTokenExpiresAt?: number;
  loginUser?: OrkaUser;
  companies: OrkaCompany[];
  selectedCompany?: OrkaCompany;
  firmToken?: string;
  firmTokenExpiresAt?: number;
};

const AUTH_STORAGE_KEY = "@orka/auth-state";
const DEFAULT_COMPANY_YEAR = 2025;
const TOKEN_LIFETIME_MS = 1000 * 60 * 14; // approx 14 minutes

const defaultState: AuthState = {
  status: "loading",
  companies: [],
};

type LoginOptions = {
  apiKey?: string;
  companyYear?: number;
};

type AuthContextValue = {
  state: AuthState;
  login: (options?: LoginOptions) => Promise<void>;
  selectCompany: (veritabaniadi: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshCompanies: (year?: number) => Promise<void>;
  ensureFirmToken: () => Promise<{ token: string; firmCode: string }>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function isExpired(timestamp?: number): boolean {
  if (!timestamp) return true;
  return Date.now() >= timestamp;
}

async function persistState(state: AuthState): Promise<void> {
  await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(state));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(defaultState);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
        if (!stored) {
          setState({ status: "loggedOut", companies: [] });
          return;
        }
        const parsed = JSON.parse(stored) as AuthState;
        if (parsed.firmToken && !isExpired(parsed.firmTokenExpiresAt)) {
          setState({ ...parsed, status: "companySelected" });
        } else if (parsed.loginToken && !isExpired(parsed.loginTokenExpiresAt)) {
          setState({ ...parsed, status: "loggedIn", firmToken: undefined, firmTokenExpiresAt: undefined });
        } else {
          setState({ status: "loggedOut", companies: [] });
        }
      } catch (error) {
        console.warn("Failed to restore auth state", error);
        setState({ status: "loggedOut", companies: [] });
      }
    })();
  }, []);

  const login = useCallback(
    async (options?: LoginOptions) => {
      const apiKey =
        options?.apiKey || (Constants.expoConfig?.extra?.orkaApiKey as string | undefined) || "";
      if (!apiKey) {
        throw new Error("API key is not configured. Set ORKA_API_KEY in your .env file.");
      }
      const companyYear = options?.companyYear ?? DEFAULT_COMPANY_YEAR;

      const user = await orkaLogin({
        apiKey,
        entegrApp: "Orka Mobil",
        entegrUserName: "Orka Mobil Kullanıcı",
      });

      const companies = await getCompanyCodes(user.Token, companyYear);

      const nextState: AuthState = {
        status: "loggedIn",
        apiKey,
        companyYear,
        loginToken: user.Token,
        loginTokenExpiresAt: Date.now() + TOKEN_LIFETIME_MS,
        loginUser: user,
        companies,
      };
      setState(nextState);
      await persistState(nextState);
    },
    [],
  );

  const ensureLoginToken = useCallback(async (): Promise<AuthState> => {
    if (state.loginToken && !isExpired(state.loginTokenExpiresAt)) {
      return state;
    }
    if (!state.apiKey) {
      throw new Error("Oturum süresi dolmuş. Lütfen yeniden giriş yapın.");
    }
    const companyYear = state.companyYear ?? DEFAULT_COMPANY_YEAR;
    const user = await orkaLogin({
      apiKey: state.apiKey,
      entegrApp: "Orka Mobil",
      entegrUserName: "Orka Mobil Kullanıcı",
    });
    const companies = await getCompanyCodes(user.Token, companyYear);
    const refreshed: AuthState = {
      ...state,
      status: "loggedIn",
      loginToken: user.Token,
      loginTokenExpiresAt: Date.now() + TOKEN_LIFETIME_MS,
      loginUser: user,
      companies,
      apiKey: state.apiKey,
      companyYear,
    };
    setState(refreshed);
    await persistState(refreshed);
    return refreshed;
  }, [state]);

  const selectCompany = useCallback(
    async (veritabaniadi: string) => {
      const baseState = await ensureLoginToken();
      if (!baseState.loginToken) {
        throw new Error("Login token missing. Please login first.");
      }
      const result = await setCompanyCode(baseState.loginToken, veritabaniadi);
      const selectedCompany =
        baseState.companies.find((company) => company.veritabaniadi === veritabaniadi) || result.FirmaTanim;

      const nextState: AuthState = {
        ...baseState,
        status: "companySelected",
        firmToken: result.Token,
        firmTokenExpiresAt: Date.now() + TOKEN_LIFETIME_MS,
        selectedCompany,
        // login token artık geçersiz olduğundan yeniden girişte üretilecek
        loginToken: undefined,
        loginTokenExpiresAt: undefined,
      };
      setState(nextState);
      await persistState(nextState);
    },
    [ensureLoginToken],
  );

  const refreshCompanies = useCallback(
    async (year?: number) => {
      const baseState = await ensureLoginToken();
      if (!baseState.loginToken) {
        throw new Error("Login token missing. Please login first.");
      }
      const targetYear = year ?? baseState.companyYear ?? DEFAULT_COMPANY_YEAR;
      const refreshed = await getCompanyCodes(baseState.loginToken, targetYear);
      const nextState: AuthState = { ...baseState, companies: refreshed, companyYear: targetYear };
      setState(nextState);
      await persistState(nextState);
    },
    [ensureLoginToken],
  );

  const logout = useCallback(async () => {
    const nextState: AuthState = { status: "loggedOut", companies: [] };
    setState(nextState);
    await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
  }, []);

  const ensureFirmToken = useCallback(async (): Promise<{ token: string; firmCode: string }> => {
    const baseState = await ensureLoginToken();
    if (!baseState.selectedCompany) {
      throw new Error("Firma seçilmemiş. Lütfen firma seçin.");
    }

    if (baseState.firmToken && !isExpired(baseState.firmTokenExpiresAt)) {
      return { token: baseState.firmToken, firmCode: baseState.selectedCompany.veritabaniadi };
    }

    if (!baseState.loginToken) {
      throw new Error("Login token missing. Please login first.");
    }

    const refreshed = await setCompanyCode(baseState.loginToken, baseState.selectedCompany.veritabaniadi);
    const nextState: AuthState = {
      ...baseState,
      status: "companySelected",
      firmToken: refreshed.Token,
      firmTokenExpiresAt: Date.now() + TOKEN_LIFETIME_MS,
      selectedCompany: baseState.selectedCompany ?? refreshed.FirmaTanim,
    };
    setState(nextState);
    await persistState(nextState);
    return { token: nextState.firmToken!, firmCode: nextState.selectedCompany!.veritabaniadi };
  }, [ensureLoginToken]);

  const value = useMemo<AuthContextValue>(
    () => ({
      state,
      login,
      selectCompany,
      logout,
      refreshCompanies,
      ensureFirmToken,
    }),
    [state, login, selectCompany, logout, refreshCompanies, ensureFirmToken],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}

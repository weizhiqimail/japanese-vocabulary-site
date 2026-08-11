import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import {
  getCurrentUser,
  login as loginRequest,
  logout as logoutRequest,
} from "@/http/api/auth.api";
import type { User } from "@/types/api.types";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login(username: string, password: string): Promise<void>;
  logout(): Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/** 维护当前用户会话，并在应用首次加载时恢复后端 Cookie 会话。 */
export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCurrentUser()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(
    async (username: string, password: string) =>
      setUser(await loginRequest(username, password)),
    [],
  );

  const logout = useCallback(async () => {
    await logoutRequest();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, logout }),
    [user, loading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** 读取认证上下文，并阻止组件在 Provider 之外静默运行。 */
export function useAuth() {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error("AuthProvider 未配置");
  }

  return value;
}

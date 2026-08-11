import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import { request } from "@/http/request";
import type { User } from "@/types/api.types";
interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login(username: string, password: string): Promise<void>;
  logout(): Promise<void>;
}
const AuthContext = createContext<AuthContextValue | null>(null);
export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    request<User>({ url: "/auth/me" })
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);
  const login = useCallback(
    async (username: string, password: string) =>
      setUser(
        await request<User>({
          method: "POST",
          url: "/auth/login",
          data: { username, password },
        }),
      ),
    [],
  );
  const logout = useCallback(async () => {
    await request({ method: "POST", url: "/auth/logout" });
    setUser(null);
  }, []);
  const value = useMemo(
    () => ({ user, loading, login, logout }),
    [user, loading, login, logout],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("AuthProvider 未配置");
  return value;
}

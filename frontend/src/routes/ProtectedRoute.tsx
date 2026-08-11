import { Center, Spinner } from "@chakra-ui/react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

/** 在受保护页面渲染前完成会话恢复与登录跳转。 */
export function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <Center minH="100vh">
        <Spinner color="brand.500" size="xl" />
      </Center>
    );
  }

  return user ? (
    <Outlet />
  ) : (
    <Navigate
      to={`/login?from=${encodeURIComponent(location.pathname + location.search)}`}
      replace
    />
  );
}

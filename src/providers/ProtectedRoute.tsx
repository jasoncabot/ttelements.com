import { Navigate, useLocation } from "react-router";
import { useAuth } from "./hooks";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (user) {
    return <>{children}</>;
  } else {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
};

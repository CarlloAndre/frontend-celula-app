import { Navigate, useParams } from "react-router-dom";
import { ReactNode } from "react";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAuth();
  const { slug } = useParams<{ slug: string }>();

  if (!isAuthenticated) {
    return <Navigate to={`/torneo/${slug}/login`} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

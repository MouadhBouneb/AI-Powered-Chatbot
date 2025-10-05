import { Navigate } from "react-router-dom";
import { useBackendAuth } from "../contexts/BackendAuthContext";
import { ReactNode } from "react";

interface PublicRouteProps {
  children: ReactNode;
}

export const PublicRoute = ({ children }: PublicRouteProps) => {
  const { user, loading } = useBackendAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If user is authenticated, redirect to chat
  if (user) {
    return <Navigate to="/chat" replace />;
  }

  return <>{children}</>;
};

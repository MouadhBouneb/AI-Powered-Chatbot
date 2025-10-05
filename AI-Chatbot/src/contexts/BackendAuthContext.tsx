import { createContext, useContext, ReactNode } from "react";
import { useAuth } from "../hooks/useApi";

interface AuthContextType {
  user: any;
  summary: any;
  stats: any;
  loading: boolean;
  isAuthenticated: boolean;
  signUp: (
    email: string,
    password: string,
    name: string,
    language: "en" | "ar"
  ) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateLanguage: (language: "en" | "ar") => Promise<void>;
  isSigningUp: boolean;
  isLoggingIn: boolean;
  isLoggingOut: boolean;
  signupError: any;
  loginError: any;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const BackendAuthProvider = ({ children }: { children: ReactNode }) => {
  const auth = useAuth();

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

export const useBackendAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useBackendAuth must be used within a BackendAuthProvider");
  }
  return context;
};

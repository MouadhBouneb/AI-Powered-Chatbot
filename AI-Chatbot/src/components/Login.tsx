import { useState, FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, Link } from "react-router-dom";
import { useBackendAuth } from "../contexts/BackendAuthContext";
import { LogIn } from "lucide-react";
import toast from "react-hot-toast";
import {
  Button,
  Input,
  Card,
  CardHeader,
  CardFooter,
  ErrorAlert,
} from "./common";

export const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { signIn, isLoggingIn, loginError } = useBackendAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error(t("auth.error_invalid_email"));
      return;
    }

    if (password.length < 6) {
      toast.error(t("auth.error_password_short"));
      return;
    }

    try {
      await signIn(email, password);
      toast.success(t("auth.login_title"));
      navigate("/chat");
    } catch (err) {
      toast.error(t("auth.error_login_failed"));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <Card>
          <CardHeader
            icon={<LogIn className="w-8 h-8 text-white" />}
            title={t("auth.login_title")}
            subtitle={t("auth.login_subtitle")}
          />

          <form onSubmit={handleSubmit} className="space-y-5">
            {loginError && (
              <ErrorAlert
                message={loginError.message || t("auth.error_login_failed")}
              />
            )}

            <Input
              id="email"
              type="email"
              label={t("auth.email")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />

            <Input
              id="password"
              type="password"
              label={t("auth.password")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={isLoggingIn}
              className="w-full mt-6"
            >
              {t("auth.login_button")}
            </Button>
          </form>

          <CardFooter>
            <p className="text-sm text-slate-600">
              {t("auth.no_account")}{" "}
              <Link
                to="/signup"
                className="text-indigo-600 hover:text-indigo-700 font-semibold transition-colors"
              >
                {t("auth.signup_link")}
              </Link>
            </p>
          </CardFooter>
        </Card>

        <p className="text-center text-xs text-slate-500 mt-6">
          {t("auth.login_footer")}
        </p>
      </div>
    </div>
  );
};

import { useState, FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, Link } from "react-router-dom";
import { useBackendAuth } from "../contexts/BackendAuthContext";
import { UserPlus } from "lucide-react";
import toast from "react-hot-toast";
import {
  Button,
  Input,
  Card,
  CardHeader,
  CardFooter,
  ErrorAlert,
} from "./common";

export const SignUp = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { signUp, isSigningUp, signupError } = useBackendAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [language, setLanguage] = useState<"en" | "ar">(
    i18n.language as "en" | "ar"
  );

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!email || !password || !fullName) {
      toast.error(t("auth.error_invalid_email"));
      return;
    }

    if (password.length < 6) {
      toast.error(t("auth.error_password_short"));
      return;
    }

    if (password !== confirmPassword) {
      toast.error(t("auth.error_passwords_match"));
      return;
    }

    try {
      await signUp(email, password, fullName, language);
      toast.success(t("auth.success_signup"));
      navigate("/chat");
    } catch (err) {
      toast.error(t("auth.error_signup_failed"));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <Card>
          <CardHeader
            icon={<UserPlus className="w-8 h-8 text-white" />}
            title={t("auth.signup_title")}
            subtitle={t("auth.signup_subtitle")}
          />

          <form onSubmit={handleSubmit} className="space-y-4">
            {signupError && (
              <ErrorAlert
                message={signupError.message || t("auth.error_signup_failed")}
              />
            )}

            <Input
              id="fullName"
              type="text"
              label={t("auth.full_name")}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="John Doe"
              required
            />

            <Input
              id="email"
              type="email"
              label={t("auth.email")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                id="password"
                type="password"
                label={t("auth.password")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />

              <Input
                id="confirmPassword"
                type="password"
                label={t("auth.confirm_password")}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="language"
                className="block text-sm font-semibold text-slate-700"
              >
                {t("auth.language_preference")}
              </label>
              <select
                id="language"
                value={language}
                onChange={(e) => setLanguage(e.target.value as "en" | "ar")}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              >
                <option value="en">🇬🇧 English</option>
                <option value="ar">🇸🇦 العربية</option>
              </select>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={isSigningUp}
              className="w-full mt-6"
            >
              {t("auth.signup_button")}
            </Button>
          </form>

          <CardFooter>
            <p className="text-sm text-slate-600">
              {t("auth.have_account")}{" "}
              <Link
                to="/login"
                className="text-indigo-600 hover:text-indigo-700 font-semibold transition-colors"
              >
                {t("auth.login_link")}
              </Link>
            </p>
          </CardFooter>
        </Card>

        <p className="text-center text-xs text-slate-500 mt-6">
          {t("auth.signup_footer")}
        </p>
      </div>
    </div>
  );
};

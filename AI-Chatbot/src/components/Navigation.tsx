import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { MessageSquare, Globe, Menu, X, User, LogOut } from "lucide-react";
import { useBackendAuth } from "../contexts/BackendAuthContext";
import toast from "react-hot-toast";

export const Navigation = () => {
  const { t, i18n } = useTranslation();
  const { user, signOut, updateLanguage } = useBackendAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleLanguage = async () => {
    const newLang = i18n.language === "en" ? "ar" : "en";
    i18n.changeLanguage(newLang);
    localStorage.setItem("language", newLang);
    document.documentElement.dir = newLang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = newLang;

    // Update user's language preference if logged in
    if (user) {
      try {
        await updateLanguage(newLang);
        toast.success(t("common.success"));
      } catch (error) {
        console.error("Failed to update language preference:", error);
      }
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success(t("nav.logout"));
      navigate("/");
      setMobileMenuOpen(false);
    } catch (error) {
      console.error("Sign out error:", error);
      toast.error(t("common.error"));
    }
  };

  const isActive = (path: string) => location.pathname === path;

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <nav className="bg-white shadow-md border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 group"
            onClick={closeMobileMenu}
          >
            <div className="bg-indigo-600 p-2 rounded-lg group-hover:bg-indigo-700 transition-colors">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900">AI Chat</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
              aria-label="Toggle language"
            >
              <Globe className="w-5 h-5 text-slate-700" />
              <div className="flex items-center gap-1">
                <span
                  className={`text-sm font-semibold ${
                    i18n.language === "en"
                      ? "text-indigo-600"
                      : "text-slate-400"
                  }`}
                >
                  EN
                </span>
                <span className="text-slate-300">|</span>
                <span
                  className={`text-sm font-semibold ${
                    i18n.language === "ar"
                      ? "text-indigo-600"
                      : "text-slate-400"
                  }`}
                >
                  عربي
                </span>
              </div>
            </button>

            {user ? (
              <>
                <Link
                  to="/chat"
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    isActive("/chat")
                      ? "bg-indigo-600 text-white"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {t("nav.chat")}
                </Link>
                <Link
                  to="/profile"
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    isActive("/profile")
                      ? "bg-indigo-600 text-white"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {t("nav.profile")}
                </Link>
                <button
                  onClick={handleSignOut}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                >
                  {t("nav.logout")}
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-slate-700 rounded-lg font-medium hover:bg-slate-100 transition-colors"
                >
                  {t("nav.login")}
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                >
                  {t("nav.signup")}
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button & Language */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors"
              aria-label="Toggle language"
            >
              <Globe className="w-4 h-4 text-slate-700" />
              <div className="flex items-center gap-0.5">
                <span
                  className={`text-xs font-semibold ${
                    i18n.language === "en"
                      ? "text-indigo-600"
                      : "text-slate-400"
                  }`}
                >
                  EN
                </span>
                <span className="text-slate-300 text-xs">|</span>
                <span
                  className={`text-xs font-semibold ${
                    i18n.language === "ar"
                      ? "text-indigo-600"
                      : "text-slate-400"
                  }`}
                >
                  ع
                </span>
              </div>
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-700"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white">
          <div className="px-4 py-4 space-y-2">
            {user ? (
              <>
                <Link
                  to="/chat"
                  onClick={closeMobileMenu}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                    isActive("/chat")
                      ? "bg-indigo-600 text-white"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <MessageSquare className="w-5 h-5" />
                  {t("nav.chat")}
                </Link>
                <Link
                  to="/profile"
                  onClick={closeMobileMenu}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                    isActive("/profile")
                      ? "bg-indigo-600 text-white"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <User className="w-5 h-5" />
                  {t("nav.profile")}
                </Link>
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  {t("nav.logout")}
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={closeMobileMenu}
                  className="block px-4 py-3 text-slate-700 rounded-lg font-medium hover:bg-slate-100 transition-colors text-center"
                >
                  {t("nav.login")}
                </Link>
                <Link
                  to="/signup"
                  onClick={closeMobileMenu}
                  className="block px-4 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors text-center"
                >
                  {t("nav.signup")}
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

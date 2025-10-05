import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  User,
  Calendar,
  MessageSquare,
  Save,
  Sparkles,
  Download,
} from "lucide-react";
import toast from "react-hot-toast";
import { useBackendAuth } from "../contexts/BackendAuthContext";
import { useProfile, useChats, useGenerateSummary } from "../hooks/useApi";
import { profileApi } from "../services/api";

export const Profile = () => {
  const { t, i18n } = useTranslation();
  const { user } = useBackendAuth();
  const { data: profileData, isLoading: profileLoading } = useProfile();
  const { data: chatsData } = useChats();
  const generateSummaryMutation = useGenerateSummary();

  const [fullName, setFullName] = useState("");
  const [language, setLanguage] = useState<"en" | "ar">("en");
  const [loading, setLoading] = useState(false);

  const profile = profileData?.user;
  const summary = profileData?.summary;
  const stats = profileData?.stats;
  const chats = chatsData?.chats || [];

  useEffect(() => {
    if (profile) {
      setFullName(profile.name || "");
      setLanguage(profile.language as "en" | "ar");
    }
  }, [profile]);

  const handleUpdateProfile = async () => {
    setLoading(true);

    try {
      await profileApi.updateProfile({ language });

      i18n.changeLanguage(language);
      localStorage.setItem("language", language);
      document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
      document.documentElement.lang = language;

      toast.success(t("profile.success_update"));
    } catch (error) {
      console.error("Update profile error:", error);
      toast.error(t("profile.error_update"));
    } finally {
      setLoading(false);
    }
  };

  const generateAISummary = async () => {
    if (!profile) return;

    try {
      await generateSummaryMutation.mutateAsync();
      toast.success(t("profile.summary_generated"));
    } catch (error) {
      console.error("Generate summary error:", error);
      toast.error(t("profile.error_update"));
    }
  };

  const exportChatHistory = () => {
    if (!profile) return;

    try {
      let exportText = `${t("profile.title")} - ${profile.name}\n`;
      exportText += `${t("profile.email")}: ${profile.email}\n`;
      exportText += `${t("profile.total_chats")}: ${chats.length}\n`;
      exportText += `\n${"=".repeat(50)}\n\n`;

      chats.forEach((chat, index) => {
        exportText += `${i18n.language === "ar" ? "محادثة" : "Chat"} ${
          index + 1
        }: ${chat.title}\n`;
        exportText += `${i18n.language === "ar" ? "النموذج" : "Model"}: ${
          chat.model
        }\n`;
        exportText += `${
          i18n.language === "ar" ? "التاريخ" : "Date"
        }: ${new Date(chat.createdAt).toLocaleString(i18n.language)}\n`;
        exportText += `${"-".repeat(50)}\n\n`;
      });

      const blob = new Blob([exportText], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `chat-history-${
        new Date().toISOString().split("T")[0]
      }.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(t("profile.export_success"));
    } catch (error) {
      console.error("Export error:", error);
      toast.error(t("profile.error_update"));
    }
  };

  if (profileLoading || !profile) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8 text-white">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-xl">
                <User className="w-12 h-12" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">
                  {profile.name || profile.email}
                </h1>
                <p className="text-blue-100 mt-1">{profile.email}</p>
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                <div className="flex items-center gap-3 mb-2">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-slate-600">
                    {t("profile.total_chats")}
                  </span>
                </div>
                <p className="text-3xl font-bold text-slate-900">
                  {stats?.totalChats || chats.length}
                </p>
              </div>

              <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                <div className="flex items-center gap-3 mb-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-slate-600">
                    {t("profile.member_since")}
                  </span>
                </div>
                <p className="text-xl font-semibold text-slate-900">
                  {new Date().toLocaleDateString(i18n.language, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>

            <div className="space-y-6 mb-8">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {t("profile.full_name")}
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {t("profile.email")}
                </label>
                <input
                  type="email"
                  value={profile.email}
                  disabled
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {t("profile.language")}
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as "en" | "ar")}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="en">English</option>
                  <option value="ar">العربية</option>
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleUpdateProfile}
                  disabled={loading}
                  className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed"
                >
                  <Save className="w-5 h-5" />
                  {loading ? t("common.loading") : t("profile.update_profile")}
                </button>
                <button
                  onClick={exportChatHistory}
                  className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  <Download className="w-5 h-5" />
                  {t("profile.export_history")}
                </button>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 mb-1">
                    {t("profile.ai_summary_title")}
                  </h2>
                  <p className="text-sm text-slate-600">
                    {t("profile.ai_summary_desc")}
                  </p>
                </div>
                <button
                  onClick={generateAISummary}
                  disabled={generateSummaryMutation.isPending}
                  className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Sparkles
                    className={`w-5 h-5 ${
                      generateSummaryMutation.isPending ? "animate-spin" : ""
                    }`}
                  />
                  {generateSummaryMutation.isPending
                    ? t("common.loading")
                    : "Generate"}
                </button>
              </div>

              {summary?.content ? (
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-xl border border-blue-200">
                  <p className="text-slate-700 leading-relaxed">
                    {summary.content}
                  </p>
                </div>
              ) : (
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 text-center">
                  <p className="text-slate-500">{t("profile.no_summary")}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

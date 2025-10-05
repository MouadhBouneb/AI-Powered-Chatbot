import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  MessageSquare,
  Globe,
  History,
  Brain,
  Sparkles,
  Zap,
  Shield,
  Cpu,
} from "lucide-react";

export const LandingPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const features = [
    {
      icon: MessageSquare,
      title: t("landing.feature_1_title"),
      description: t("landing.feature_1_desc"),
      color: "indigo",
    },
    {
      icon: Globe,
      title: t("landing.feature_2_title"),
      description: t("landing.feature_2_desc"),
      color: "blue",
    },
    {
      icon: History,
      title: t("landing.feature_3_title"),
      description: t("landing.feature_3_desc"),
      color: "violet",
    },
    {
      icon: Brain,
      title: t("landing.feature_4_title"),
      description: t("landing.feature_4_desc"),
      color: "cyan",
    },
  ];

  const highlights = [
    { icon: Sparkles, key: "highlight_1" },
    { icon: Zap, key: "highlight_2" },
    { icon: Shield, key: "highlight_3" },
    { icon: Cpu, key: "highlight_4" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 md:pt-24 md:pb-32">
        <div className="text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-8 shadow-lg">
            <Sparkles className="w-4 h-4" />
            <span className="hidden sm:inline">{t("landing.hero_badge")}</span>
            <span className="sm:hidden">{t("landing.hero_badge_mobile")}</span>
          </div>

          {/* Title */}
          <h1
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight px-2"
            style={{ lineHeight: "1.2" }}
          >
            {t("landing.hero_title")}
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg md:text-xl text-slate-600 mb-12 max-w-3xl mx-auto leading-relaxed px-4">
            {t("landing.hero_subtitle")}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <button
              onClick={() => navigate("/signup")}
              className="w-full sm:w-auto bg-indigo-600 text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <span className="flex items-center justify-center gap-2">
                {t("landing.get_started")}
                <Sparkles className="w-4 h-4" />
              </span>
            </button>
            <button
              onClick={() => navigate("/login")}
              className="w-full sm:w-auto bg-white text-slate-700 px-8 py-3.5 rounded-xl font-semibold hover:bg-slate-50 transition-all shadow-md hover:shadow-lg border-2 border-slate-300 hover:border-indigo-400"
            >
              {t("landing.learn_more")}
            </button>
          </div>

          {/* Highlights */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {highlights.map((item, index) => (
              <div
                key={index}
                className="flex flex-col items-center gap-2 p-4 bg-white/70 backdrop-blur-sm rounded-xl shadow-md hover:shadow-lg transition-all"
              >
                <item.icon className="w-6 h-6 text-blue-600" />
                <span className="text-xs md:text-sm font-medium text-slate-700 text-center">
                  {t(`landing.${item.key}`)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
            {t("landing.features_title")}
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            {t("landing.features_subtitle")}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {features.map((feature, index) => {
            const colorClasses = {
              indigo: "bg-indigo-100 text-indigo-600 hover:bg-indigo-600",
              blue: "bg-blue-100 text-blue-600 hover:bg-blue-600",
              violet: "bg-violet-100 text-violet-600 hover:bg-violet-600",
              cyan: "bg-cyan-100 text-cyan-600 hover:bg-cyan-600",
            };
            return (
              <div
                key={index}
                className="group bg-white p-6 md:p-8 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-slate-200"
              >
                {/* Icon */}
                <div
                  className={`${
                    colorClasses[feature.color as keyof typeof colorClasses]
                  } w-14 h-14 md:w-16 md:h-16 rounded-xl flex items-center justify-center mb-5 group-hover:text-white transition-all`}
                >
                  <feature.icon className="w-7 h-7 md:w-8 md:h-8" />
                </div>

                {/* Content */}
                <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-600 leading-relaxed text-sm md:text-base">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* About Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-indigo-600 rounded-3xl shadow-xl p-8 md:p-16">
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-6">
              {t("landing.about_title")}
            </h2>
            <p className="text-base md:text-lg text-indigo-100 leading-relaxed max-w-4xl mx-auto">
              {t("landing.about_desc")}
            </p>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-6">
          {t("landing.cta_title")}
        </h3>
        <button
          onClick={() => navigate("/signup")}
          className="bg-indigo-600 text-white px-10 py-3.5 rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          {t("landing.cta_button")}
        </button>
      </div>
    </div>
  );
};

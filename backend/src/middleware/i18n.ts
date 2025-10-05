import i18next from "i18next";
import * as i18nextMiddleware from "i18next-http-middleware";
import Backend from "i18next-fs-backend";
import path from "node:path";

export const i18n = i18next.createInstance();

i18n
  .use(Backend)
  .use(i18nextMiddleware.LanguageDetector)
  .init({
    fallbackLng: "en",
    preload: ["en", "ar"],
    backend: {
      loadPath: path.join(process.cwd(), "locales/{{lng}}/{{ns}}.json"),
    },
    detection: {
      order: ["header", "querystring", "cookie"],
      caches: false,
    },
    supportedLngs: ["en", "ar"],
    ns: ["common"],
    defaultNS: "common",
    returnEmptyString: false,
  });

export const i18nMiddleware = i18nextMiddleware;

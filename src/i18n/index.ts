import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import enCommon from "./locales/en/common.json";
import ruCommon from "./locales/ru/common.json";

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        fallbackLng: "ru",
        supportedLngs: ["ru", "en"],
        ns: ["common"],
        defaultNS: "common",
        resources: {
            en: { common: enCommon },
            ru: { common: ruCommon },
        },
        interpolation: {
            escapeValue: false,
        },
        detection: {
            order: ["localStorage", "navigator"],
            caches: ["localStorage"],
            lookupLocalStorage: "lang",
        },
    });

export default i18n;
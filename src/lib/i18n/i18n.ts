
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';

// Basic fallback translations to avoid 404s during development if JSONs are missing
const resources = {
    en: {
        translation: {
            "welcome": "Welcome to OMNIOS",
            "project": "Project",
            "settings": "Settings",
            "deploy": "Deploy",
            "save": "Save",
            "loading": "Loading...",
            "error": "Error",
            "success": "Success"
        }
    },
    ar: {
        translation: {
            "welcome": "مرحباً بك في أومنيوس",
            "project": "مشروع",
            "settings": "إعدادات",
            "deploy": "نشر",
            "save": "حفظ",
            "loading": "جاري التحميل...",
            "error": "خطأ",
            "success": "نجاح"
        }
    }
};

i18n
    .use(HttpBackend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources, // Remove this line to load fully from backend (public/locales)
        fallbackLng: 'en',
        debug: process.env.NODE_ENV === 'development',

        interpolation: {
            escapeValue: false, // not needed for react as it escapes by default
        },

        react: {
            useSuspense: false // Set to true if we wrap app in Suspense
        }
    });

export default i18n;

import { useProjectStore } from '@/hooks/useProjectStore';
import { useTranslation as useI18Next } from 'react-i18next';
import { useEffect } from 'react';

export const useTranslation = () => {
    const { state, setState } = useProjectStore();
    const { t, i18n } = useI18Next();

    // Sync Store Translations to i18next on mount/change
    useEffect(() => {
        if (state.translations) {
            Object.entries(state.translations).forEach(([lang, resources]) => {
                if (resources) {
                    // Add as a 'translation' namespace bundle
                    i18n.addResourceBundle(lang, 'translation', resources, true, true);
                }
            });
        }
    }, [state.translations, i18n]);

    // Switch language when store locale changes
    useEffect(() => {
        if (state.localization?.activeLocale && i18n.language !== state.localization.activeLocale) {
            i18n.changeLanguage(state.localization.activeLocale);
        }
    }, [state.localization?.activeLocale, i18n]);

    const addTranslation = (key: string, value: string, locale: string) => {
        // 1. Update i18next memory
        i18n.addResource(locale, 'translation', key, value);

        // 2. Persist to Project Store
        setState(prev => ({
            ...prev,
            translations: {
                ...prev.translations,
                [locale]: {
                    ...(prev.translations[locale] || {}),
                    [key]: value
                }
            }
        }));
    };

    const getTranslation = (key: string) => {
        return t(key);
    };

    // Helper to generate a key from content
    const generateKey = (content: string) => {
        return content
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '_')
            .substring(0, 30);
    };

    return { addTranslation, getTranslation, generateKey, t, i18n };
};

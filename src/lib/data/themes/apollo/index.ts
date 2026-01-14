import { createTheme } from "../utils";
import { apolloHome } from "./pages/home";
import { apolloGallery } from "./pages/gallery";
import { ThemeCategory } from "@/types/designer";

export const APOLLO = createTheme(
    'apollo',
    'APOLLO LUMS',
    'Creative' as ThemeCategory,
    'Luminous, artistic, and gallery-focused. The perfect canvas for divine masterpieces.',
    '☀️',
    {
        'index': { id: 'index', name: 'Sanctuary', rootId: 'apollo-home-root', elements: apolloHome() },
        'gallery': { id: 'gallery', name: 'The Gallery', rootId: 'apollo-gal-root', elements: apolloGallery() }
    }
);

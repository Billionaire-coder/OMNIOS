import { createTheme } from "../utils";
import { aphroditeHome } from "./pages/home";
import { aphroditeCollections } from "./pages/collections";
import { ThemeCategory } from "@/types/designer";

export const APHRODITE = createTheme(
    'aphrodite',
    'APHRODITE LUXE',
    'Lifestyle' as ThemeCategory,
    'Elegant, soft, and beautiful. A fashion-forward theme with glassmorphism and soft colors.',
    '💖',
    {
        'index': { id: 'index', name: 'Atelier', rootId: 'aphrodite-home-root', elements: aphroditeHome() },
        'collections': { id: 'collections', name: 'Collections', rootId: 'aphrodite-col-root', elements: aphroditeCollections() }
    }
);

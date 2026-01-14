import { createTheme } from "../utils";
import { hephaestusHome } from "./pages/home";
import { hephaestusSpecs } from "./pages/specs";
import { ThemeCategory } from "@/types/designer";

export const HEPHAESTUS = createTheme(
    'hephaestus',
    'HEPHAESTUS FORGE',
    'Tech' as ThemeCategory,
    'Industrial, raw, and powerful. Built for the creators and the makers.',
    '⚒️',
    {
        'index': { id: 'index', name: 'Furnace', rootId: 'heph-home-root', elements: hephaestusHome() },
        'specs': { id: 'specs', name: 'Technical Specs', rootId: 'heph-specs-root', elements: hephaestusSpecs() }
    }
);

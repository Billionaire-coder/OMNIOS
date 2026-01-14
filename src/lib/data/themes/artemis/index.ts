import { createTheme } from "../utils";
import { artemisHome } from "./pages/home";
import { artemisForest } from "./pages/forest";
import { ThemeCategory } from "@/types/designer";

export const ARTEMIS = createTheme(
    'artemis',
    'ARTEMIS WILD',
    'Lifestyle' as ThemeCategory,
    'Organic, nature-inspired, and wild. A theme for eco-conscious brands.',
    '🏹',
    {
        'index': { id: 'index', name: 'Meadow', rootId: 'artemis-home-root', elements: artemisHome() },
        'forest': { id: 'forest', name: 'The Forest', rootId: 'artemis-for-root', elements: artemisForest() }
    }
);

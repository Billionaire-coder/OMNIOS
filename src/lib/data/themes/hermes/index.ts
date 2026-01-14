import { createTheme } from "../utils";
import { hermesHome } from "./pages/home";
import { hermesPricing } from "./pages/pricing";
import { ThemeCategory } from "@/types/designer";

export const HERMES = createTheme(
    'hermes',
    'HERMES WING',
    'SaaS' as ThemeCategory,
    'The fastest SaaS landing page ever. Designed for conversion and divine speed.',
    '🕊️',
    {
        'index': { id: 'index', name: 'Product', rootId: 'hermes-home-root', elements: hermesHome() },
        'pricing': { id: 'pricing', name: 'Pricing', rootId: 'hermes-pricing-root', elements: hermesPricing() }
    }
);

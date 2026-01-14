import { createTheme } from "../utils";
import { hadesHome } from "./pages/home";
import { hadesManifesto } from "./pages/manifesto";
import { ThemeCategory } from "@/types/designer";

export const HADES = createTheme(
    'hades',
    'HADES DARK',
    'Portfolio' as ThemeCategory,
    'A deep, dark portfolio theme with brutalist typography and high contrast shadows.',
    '💀',
    {
        'index': { id: 'index', name: 'Selected Works', rootId: 'hades-home-root', elements: hadesHome() },
        'manifesto': { id: 'manifesto', name: 'Manifesto', rootId: 'hades-manifesto-root', elements: hadesManifesto() }
    }
);

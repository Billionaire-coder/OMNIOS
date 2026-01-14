import { createTheme } from "../utils";
import { aresHome } from "./pages/home";
import { aresWarRoom } from "./pages/war-room";
import { ThemeCategory } from "@/types/designer";

export const ARES = createTheme(
    'ares',
    'ARES TACTICAL',
    'Landing Page' as ThemeCategory,
    'Bold, aggressive, and high-impact. A theme built for action and victory.',
    '⚔️',
    {
        'index': { id: 'index', name: 'The Front', rootId: 'ares-home-root', elements: aresHome() },
        'war-room': { id: 'war-room', name: 'War Room', rootId: 'ares-war-root', elements: aresWarRoom() }
    }
);

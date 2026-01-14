import { createTheme } from "../utils";
import { athenaHome } from "./pages/home";
import { athenaBlog } from "./pages/blog";
import { ThemeCategory } from "@/types/designer";

export const ATHENA = createTheme(
    'athena',
    'ATHENA INTEL',
    'Corporate' as ThemeCategory,
    'Structured, professional, and intelligent. A blueprint for modern corporate strategy.',
    '🦉',
    {
        'index': { id: 'index', name: 'Intelligence', rootId: 'athena-home-root', elements: athenaHome() },
        'blog': { id: 'blog', name: 'Insight Hub', rootId: 'athena-blog-root', elements: athenaBlog() }
    }
);

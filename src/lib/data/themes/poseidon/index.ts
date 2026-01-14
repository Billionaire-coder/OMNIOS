import { createTheme } from "../utils";
import { poseidonHome } from "./pages/home";
import { poseidonBlog } from "./pages/blog";
import { ThemeCategory } from "@/types/designer";

export const POSEIDON = createTheme(
    'poseidon',
    'POSEIDON FLUID',
    'Creative' as ThemeCategory,
    'Fluid animations and wave-inspired layouts. Perfect for creative agencies.',
    '🌊',
    {
        'index': { id: 'index', name: 'Shoreline', rootId: 'poseidon-home-root', elements: poseidonHome() },
        'blog': { id: 'blog', name: 'Wave Flow', rootId: 'poseidon-blog-root', elements: poseidonBlog() }
    }
);

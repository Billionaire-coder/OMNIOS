import { createTheme } from "../utils";
import { zeusHome } from "./pages/home";
import { zeusShop } from "./pages/shop";
import { zeusCheckout } from "./pages/checkout";
import { ThemeCategory } from "@/types/designer";

export const ZEUS = createTheme(
    'zeus',
    'ZEUS SUPREME',
    'E-Commerce' as ThemeCategory,
    'The king of themes. Extreme luxury e-commerce with gold accents and lightning speed.',
    '⚡',
    {
        'index': { id: 'index', name: 'Home', rootId: 'zeus-home-root', elements: zeusHome() },
        'shop': { id: 'shop', name: 'Shop', rootId: 'zeus-shop-root', elements: zeusShop() },
        'checkout': { id: 'checkout', name: 'Checkout', rootId: 'zeus-checkout-root', elements: zeusCheckout() }
    }
);

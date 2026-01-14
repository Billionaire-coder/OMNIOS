import ThemeEditorClient from './ThemeEditorClient';
import { THEMES } from '@/lib/data/themes';

export function generateStaticParams() {
    return THEMES.map(t => ({ themeId: t.id }));
}

export default function ThemeEditorPage() {
    return <ThemeEditorClient />;
}

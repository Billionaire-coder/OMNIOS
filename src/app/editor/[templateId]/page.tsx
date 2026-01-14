import EditorClient from './EditorClient';
import { THEMES } from '@/lib/data/themes';

export function generateStaticParams() {
    // Collect all theme IDs plus blank
    const ids = THEMES.map(t => ({ templateId: t.id }));
    ids.push({ templateId: 'blank' });
    return ids;
}

export default function EditorPage() {
    return <EditorClient />;
}

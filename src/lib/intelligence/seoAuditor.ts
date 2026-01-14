import { ProjectState, DesignerElement } from '@/types/designer';

export interface AuditIssue {
    id: string;
    text: string;
    severity: 'error' | 'warning' | 'info';
    elementId?: string; // If related to a specific element
    fixAction?: 'open_settings' | 'select_element' | 'auto_fix';
}

export interface AuditResult {
    score: number;
    issues: AuditIssue[];
    warnings: AuditIssue[];
}

export const seoAuditor = {
    auditProject: (state: ProjectState): AuditResult => {
        let score = 100;
        const issues: AuditIssue[] = [];
        const warnings: AuditIssue[] = [];
        const { elements, seo } = state;

        // 1. Meta Data Checks
        if (!seo?.title || seo.title === 'Untitled Project') {
            score -= 10;
            issues.push({ id: 'meta_title', text: 'Page Title is missing or default', severity: 'error', fixAction: 'open_settings' });
        }
        if (!seo?.description) {
            score -= 10;
            issues.push({ id: 'meta_desc', text: 'Meta Description is missing', severity: 'error', fixAction: 'open_settings' });
        } else if (seo.description.length < 50) {
            warnings.push({ id: 'meta_desc_short', text: 'Meta Description is too short (<50 chars)', severity: 'warning', fixAction: 'open_settings' });
        }

        // 2. Heading Hierarchy Checks
        const h1Elements = Object.values(elements).filter(e => e.type === 'text' && (e.content?.startsWith('# ') || e.styles?.fontSize === 'h1' || e.styles?.tag === 'h1'));
        // Note: Assuming 'tag' property exists or we infer from fontSize/content in this mock environment.
        // Let's assume we check for font size '4.5rem' (from EditorInterface preset) or explicit tag if we had it.
        // For robustness, let's look for "h1" in style or content convention.

        // Refined H1 check:
        // In this system, H1 might be a Text element with specific styling.
        // Let's assume valid H1s are text elements with fontSize >= 3rem or explicit H1 tag property if added later.
        // For now, let's use the logic seen in previous dashboard: e.styles?.fontSize === 'h1' (which might be a token).

        const h1Count = Object.values(elements).filter(e => e.type === 'text' && (e.styles?.fontSize === 'h1' || e.styles?.fontSize === '4.5rem')).length;

        if (h1Count === 0) {
            score -= 15;
            issues.push({ id: 'h1_missing', text: 'No H1 Heading found on the page', severity: 'error' });
        } else if (h1Count > 1) {
            score -= 5;
            warnings.push({ id: 'h1_multiple', text: `Found ${h1Count} H1 tags. Using multiple H1s is not recommended`, severity: 'warning' });
        }

        // 3. Image Alt Text Checks
        const images = Object.values(elements).filter(e => e.type === 'image');
        const imagesWithoutAlt = images.filter(img => !img.content || img.content.includes('unsplash') && !img.props?.alt);
        // Assuming alt is stored in metadata or content is just URL. 
        // If content is just URL, we need an 'alt' prop. 
        // Let's assume we check if there's no descriptive metadata.

        if (imagesWithoutAlt.length > 0) {
            score -= 5 * Math.min(imagesWithoutAlt.length, 5); // Max penalty 25
            issues.push({
                id: 'img_alt',
                text: `${imagesWithoutAlt.length} images are missing Alt Text`,
                severity: 'warning',
                elementId: imagesWithoutAlt[0].id // Link to first one
            });
        }

        // 4. Link Text Accessibility
        const buttons = Object.values(elements).filter(e => e.type === 'button');
        const badButtons = buttons.filter(btn => {
            const text = (btn.content || '').toLowerCase();
            return text === 'click here' || text === 'read more' || text === 'submit';
        });

        if (badButtons.length > 0) {
            score -= 5;
            warnings.push({
                id: 'link_text',
                text: `${badButtons.length} buttons have generic text (e.g. "Click Here")`,
                severity: 'warning',
                elementId: badButtons[0].id
            });
        }

        // Clamp Score
        return { score: Math.max(0, score), issues, warnings };
    }
};

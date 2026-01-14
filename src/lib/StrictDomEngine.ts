
export const INLINE_ELEMENTS = ['span', 'a', 'strong', 'em', 'b', 'i', 'code', 'label', 'button', 'input', 'img', 'br'];
export const BLOCK_ELEMENTS = ['div', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'section', 'header', 'footer', 'main', 'nav', 'article', 'aside', 'form', 'table', 'blockquote', 'pre'];

export const VOID_ELEMENTS = ['img', 'input', 'br', 'hr', 'link', 'meta'];

const CONTENT_MODEL: Record<string, { allow?: string[], deny?: string[], only?: string[] }> = {
    'ul': { only: ['li'] },
    'ol': { only: ['li'] },
    'p': { deny: BLOCK_ELEMENTS }, // Cannot contain block elements
    'h1': { deny: BLOCK_ELEMENTS },
    'h2': { deny: BLOCK_ELEMENTS },
    'h3': { deny: BLOCK_ELEMENTS },
    'h4': { deny: BLOCK_ELEMENTS },
    'h5': { deny: BLOCK_ELEMENTS },
    'h6': { deny: BLOCK_ELEMENTS },
    'span': { deny: BLOCK_ELEMENTS },
    'button': { deny: ['a', 'button', 'input', 'textarea', 'select'] }, // Interactive content
    'a': { deny: ['a', 'button'] }, // Interactive content
};

export class StrictDomEngine {
    static validateNesting(parentId: string, parentTag: string, childTag: string): { isValid: boolean, error?: string } {
        const parentRule = CONTENT_MODEL[parentTag];

        if (VOID_ELEMENTS.includes(parentTag)) {
            return { isValid: false, error: `${parentTag} is a void element and cannot have children.` };
        }

        if (parentRule) {
            if (parentRule.only) {
                if (!parentRule.only.includes(childTag)) {
                    return { isValid: false, error: `<${parentTag}> can only contain <${parentRule.only.join(', ')}> elements.` };
                }
            }
            if (parentRule.deny) {
                if (parentRule.deny.includes(childTag)) {
                    return { isValid: false, error: `<${childTag}> cannot be placed inside <${parentTag}>.` };
                }
            }
        }

        return { isValid: true };
    }

    static canAcceptDrop(parentTag: string): boolean {
        return !VOID_ELEMENTS.includes(parentTag);
    }
}

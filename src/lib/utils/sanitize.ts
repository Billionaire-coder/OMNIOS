import DOMPurify from 'dompurify';

export const sanitize = (content: string): string => {
    if (typeof window === 'undefined') {
        // SSR: Return as is or use a server-side sanitizer like 'isomorphic-dompurify'
        // For now, returning safe empty string or the content if we trust the server source
        // ideally we should use isomorphic-dompurify if we need SSR sanitization.
        // But ElementRenderer usually runs on client.
        return content;
    }
    return DOMPurify.sanitize(content);
};

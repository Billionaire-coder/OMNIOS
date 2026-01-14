import { ProjectState } from '@/types/designer';

export const generateSitemap = (state: ProjectState) => {
    const baseUrl = 'https://omnios.design';
    const locales = state.localization?.locales || [{ code: 'en', name: 'English' }];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">`;

    const addUrlEntry = (path: string) => {
        let entryXml = '';
        locales.forEach(locale => {
            const isDefault = locale.code === 'en';
            const localePath = isDefault ? path : `/${locale.code}${path}`;
            const fullUrl = `${baseUrl}${localePath === '//' ? '/' : localePath}`;

            entryXml += `
    <url>
        <loc>${fullUrl}</loc>
        <changefreq>weekly</changefreq>
        <priority>${path === '/' ? '1.0' : '0.8'}</priority>`;

            // Add alternate language links (Hreflang)
            locales.forEach(altLocale => {
                const altIsDefault = altLocale.code === 'en';
                const altLocalePath = altIsDefault ? path : `/${altLocale.code}${path}`;
                const altFullUrl = `${baseUrl}${altLocalePath === '//' ? '/' : altLocalePath}`;

                entryXml += `
        <xhtml:link rel="alternate" hreflang="${altLocale.code}" href="${altFullUrl}" />`;
            });

            // Add x-default
            entryXml += `
        <xhtml:link rel="alternate" hreflang="x-default" href="${baseUrl}${path}" />
    </url>`;
        });
        return entryXml;
    };

    // Add Home
    xml += addUrlEntry('/');

    // Add Static Pages
    Object.values(state.pages).forEach(page => {
        if (page.id !== 'index' && page.path) {
            xml += addUrlEntry(page.path);
        }
    });

    xml += `
</urlset>`;

    return xml;
};

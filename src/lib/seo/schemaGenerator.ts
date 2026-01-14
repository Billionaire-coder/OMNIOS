export const generateSchema = (projectState: any) => {
    const { seo, localization } = projectState;
    const baseUrl = 'https://omnios.design';
    const activeLocale = localization?.activeLocale || 'en';

    const baseSchema: any = {
        '@context': 'https://schema.org',
        '@type': seo?.schemaType || 'Website',
        name: seo?.title || 'Untitled Project',
        description: seo?.description || 'Build with OMNIOS',
        url: baseUrl,
        inLanguage: activeLocale,
    };

    if (seo?.socialImage) {
        baseSchema.image = seo.socialImage;
    }

    if (seo?.schemaType === 'Organization') {
        baseSchema.logo = 'https://omnios.design/logo.png';
        baseSchema.contactPoint = {
            '@type': 'ContactPoint',
            telephone: '+1-555-555-5555',
            contactType: 'Customer service'
        };
    }

    return JSON.stringify(baseSchema);
};

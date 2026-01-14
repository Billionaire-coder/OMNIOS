import { DesignerElement } from '@/types/designer';

export const generateComponent = (prompt: string): any => {
    const p = prompt.toLowerCase();
    const id = Math.random().toString(36).substr(2, 9);

    // 1. Hero Section
    if (p.includes('hero')) {
        return {
            id,
            type: 'section',
            name: 'Hero Section',
            styles: {
                width: '100%',
                height: '600px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#0a0a0a',
                gap: '24px',
                padding: '40px'
            },
            children: [
                {
                    id: Math.random().toString(36).substr(2, 9),
                    type: 'text',
                    name: 'Heading',
                    content: 'Build the Future',
                    styles: {
                        color: 'white',
                        fontSize: '64px',
                        fontWeight: '800',
                        textAlign: 'center',
                        lineHeight: '1.1'
                    },
                    children: []
                },
                {
                    id: Math.random().toString(36).substr(2, 9),
                    type: 'text',
                    name: 'Subtext',
                    content: 'Create stunning websites with the power of AI.',
                    styles: {
                        color: '#888',
                        fontSize: '20px',
                        textAlign: 'center',
                        maxWidth: '600px'
                    },
                    children: []
                },
                {
                    id: Math.random().toString(36).substr(2, 9),
                    type: 'button',
                    name: 'CTA Button',
                    content: 'Get Started',
                    styles: {
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        padding: '16px 32px',
                        borderRadius: '99px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        border: 'none',
                        cursor: 'pointer'
                    },
                    children: []
                }
            ],
            content: ''
        };
    }

    // 2. Pricing Table
    if (p.includes('pricing')) {
        return {
            id,
            type: 'section',
            name: 'Pricing Section',
            styles: {
                width: '100%',
                padding: '80px 40px',
                backgroundColor: '#000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '32px'
            },
            children: ['Basic', 'Pro', 'Enterprise'].map((plan, i) => ({
                id: Math.random().toString(36).substr(2, 9),
                type: 'container',
                name: `${plan} Card`,
                styles: {
                    width: '300px',
                    padding: '32px',
                    borderRadius: '16px',
                    backgroundColor: i === 1 ? '#111' : '#050505',
                    border: i === 1 ? '1px solid #3b82f6' : '1px solid #222',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px'
                },
                children: [
                    {
                        id: Math.random().toString(36).substr(2, 9),
                        type: 'text',
                        name: 'Plan Name',
                        content: plan,
                        styles: { color: 'white', fontSize: '24px', fontWeight: 'bold' },
                        children: []
                    },
                    {
                        id: Math.random().toString(36).substr(2, 9),
                        type: 'text',
                        name: 'Price',
                        content: i === 0 ? '$0' : i === 1 ? '$29' : '$99',
                        styles: { color: 'white', fontSize: '48px', fontWeight: '800' },
                        children: []
                    },
                    {
                        id: Math.random().toString(36).substr(2, 9),
                        type: 'button',
                        name: 'Select Button',
                        content: 'Choose Plan',
                        styles: {
                            width: '100%',
                            padding: '12px',
                            backgroundColor: i === 1 ? '#3b82f6' : '#222',
                            color: 'white',
                            borderRadius: '8px',
                            marginTop: '20px'
                        },
                        children: []
                    }
                ],
                content: ''
            })),
            content: ''
        };
    }

    return null;
};

// Batch 6.3: Smart Suggestions
export const getSuggestionsForElement = (element: DesignerElement): string[] => {
    const suggestions: string[] = [];

    if (element.type === 'button') {
        suggestions.push('Make Pill Shape');
        suggestions.push('Add Shadow');
        suggestions.push('Change to Outline');
    }

    if (element.type === 'text') {
        suggestions.push('Increase Contrast');
        suggestions.push('Make Heading');
    }

    if (element.type === 'image') {
        suggestions.push('Add Rounded Corners');
        suggestions.push('Make Circular');
    }

    if (element.type === 'section') {
        suggestions.push('Add Padding');
        suggestions.push('Dark Mode');
    }

    return suggestions;
};

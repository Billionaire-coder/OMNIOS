import { DesignerElement } from '@/types/designer';

// A simple structure for a Login Card
export const AuthLoginTemplate: { rootId: string, elements: Record<string, DesignerElement> } = {
    rootId: 'auth-card-root',
    elements: {
        'auth-card-root': {
            id: 'auth-card-root',
            type: 'box',
            parentId: null,
            children: ['auth-logo', 'auth-title', 'auth-input-email', 'auth-input-pass', 'auth-btn-login', 'auth-link-forgot'],
            props: {},
            styles: {
                width: '400px',
                padding: '40px',
                backgroundColor: '#1a1a1a',
                borderRadius: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
                border: '1px solid #333',
                margin: '0 auto',
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
            }
        },
        'auth-logo': {
            id: 'auth-logo',
            type: 'text',
            parentId: 'auth-card-root',
            content: 'OMNIOS',
            props: {},
            styles: {
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: 'var(--accent-teal)',
                textAlign: 'center',
                letterSpacing: '2px',
                marginBottom: '10px'
            }
        },
        'auth-title': {
            id: 'auth-title',
            type: 'text',
            parentId: 'auth-card-root',
            content: 'Welcome Back',
            props: {},
            styles: {
                fontSize: '1.2rem',
                color: 'white',
                textAlign: 'center'
            }
        },
        'auth-input-email': {
            id: 'auth-input-email',
            type: 'box', // Using Box as wrapper for Input simulation till we have Input element
            parentId: 'auth-card-root',
            content: 'Email Address', // Placeholder visual
            props: { tag: 'input', placeholder: 'Enter email...' },
            styles: {
                padding: '12px',
                borderRadius: '8px',
                backgroundColor: '#0a0a0a',
                border: '1px solid #333',
                color: '#aaa',
                fontSize: '0.9rem'
            }
        },
        'auth-input-pass': {
            id: 'auth-input-pass',
            type: 'box',
            parentId: 'auth-card-root',
            content: 'Password',
            props: { tag: 'input', type: 'password', placeholder: 'Enter password...' },
            styles: {
                padding: '12px',
                borderRadius: '8px',
                backgroundColor: '#0a0a0a',
                border: '1px solid #333',
                color: '#aaa',
                fontSize: '0.9rem'
            }
        },
        'auth-btn-login': {
            id: 'auth-btn-login',
            type: 'button',
            parentId: 'auth-card-root',
            content: 'Sign In',
            props: {},
            styles: {
                padding: '14px',
                borderRadius: '8px',
                backgroundColor: 'var(--accent-teal)',
                color: 'black',
                fontWeight: 'bold',
                textAlign: 'center',
                cursor: 'pointer',
                marginTop: '10px'
            }
        },
        'auth-link-forgot': {
            id: 'auth-link-forgot',
            type: 'text',
            parentId: 'auth-card-root',
            content: 'Forgot Password?',
            props: {},
            styles: {
                fontSize: '0.8rem',
                color: '#666',
                textAlign: 'center',
                textDecoration: 'underline',
                cursor: 'pointer'
            }
        }
    }
};

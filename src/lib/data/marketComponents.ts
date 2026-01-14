import { DesignerElement } from "@/types/designer";

export const getStripeCheckoutComponent = (): Record<string, DesignerElement> => {
    const rootId = `stripe_${Math.random().toString(36).substr(2, 6)}`;
    const headerId = `stripe_hdr_${Math.random().toString(36).substr(2, 6)}`;
    const inputId = `stripe_inp_${Math.random().toString(36).substr(2, 6)}`;
    const btnId = `stripe_btn_${Math.random().toString(36).substr(2, 6)}`;

    return {
        [rootId]: {
            id: rootId,
            parentId: 'root', // Assumed, will be reparented on insert
            type: 'container',
            styles: {
                backgroundColor: 'white',
                padding: '24px',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                width: '100%',
                maxWidth: '400px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
            },
            children: [headerId, inputId, btnId]
        },
        [headerId]: {
            id: headerId,
            parentId: rootId,
            type: 'text',
            content: 'Secure Checkout',
            styles: {
                fontSize: '20px',
                fontWeight: 'bold',
                color: '#333'
            }
        },
        [inputId]: {
            id: inputId,
            parentId: rootId,
            type: 'input',
            content: '',
            styles: {
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                backgroundColor: '#f9f9f9',
                color: '#333'
            },
            placeholder: 'Card Number'
        },
        [btnId]: {
            id: btnId,
            parentId: rootId,
            type: 'button',
            content: 'Pay Now',
            interaction: 'checkout-trigger', // Framer8: Triggers Stripe
            styles: {
                backgroundColor: '#635bff',
                color: 'white',
                padding: '12px',
                borderRadius: '4px',
                border: 'none',
                fontWeight: 'bold',
                textAlign: 'center',
                cursor: 'pointer'
            }
        }
    };
};

export const getTiltCardComponent = (): Record<string, DesignerElement> => {
    const rootId = `tilt_${Math.random().toString(36).substr(2, 6)}`;
    const textId = `tilt_txt_${Math.random().toString(36).substr(2, 6)}`;

    return {
        [rootId]: {
            id: rootId,
            parentId: 'root',
            type: 'container',
            interaction: 'tilt',
            styles: {
                width: '300px',
                height: '400px',
                perspective: '1000px',
                backgroundColor: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)',
                borderRadius: '20px',
                border: '1px solid rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            },
            children: [textId]
        },
        [textId]: {
            id: textId,
            parentId: rootId,
            type: 'text',
            content: 'Hover Me (3D)',
            styles: {
                color: 'white',
                fontSize: '24px',
                fontWeight: 'bold'
            }
        }
    };
};

export const getParallaxHeroComponent = (): Record<string, DesignerElement> => {
    const rootId = `para_${Math.random().toString(36).substr(2, 6)}`;
    const textId = `para_txt_${Math.random().toString(36).substr(2, 6)}`;

    return {
        [rootId]: {
            id: rootId,
            parentId: 'root',
            type: 'container',
            interaction: 'parallax-scroll',
            styles: {
                width: '100%',
                height: '600px',
                overflow: 'hidden',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#000'
            },
            scrollTimeline: [
                { prop: 'y', from: 0, to: 200, start: 0, end: 1 } // Move down 200px as user scrolls
            ],
            children: [textId]
        },
        [textId]: {
            id: textId,
            parentId: rootId,
            type: 'text',
            content: 'Parallax Hero',
            styles: {
                fontSize: '48px',
                fontWeight: 'bold',
                color: 'white',
                zIndex: 10
            }
        }
    };
};

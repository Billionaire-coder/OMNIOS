import { DesignerElement } from "@/types/designer";
import { createPageRoot } from "../../utils";

const PALETTE = {
    red: '#dc2626',
    black: '#000000',
    darkGrey: '#171717',
    white: '#ffffff'
};

export const aresHome = () => {
    const elements: Record<string, DesignerElement> = {
        'ares-home-root': createPageRoot('ares-home-root', ['ar-nav', 'ar-hero', 'ar-strip', 'ar-grid', 'ar-footer'], {
            backgroundColor: 'black',
            fontFamily: 'Montserrat, sans-serif',
            color: 'white'
        }),

        'ar-nav': {
            id: 'ar-nav', type: 'container',
            styles: {
                height: '80px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 40px',
                backgroundColor: 'black', borderBottom: `2px solid ${PALETTE.red}`, position: 'sticky', top: '0', zIndex: '1000'
            },
            layoutMode: 'safety', parentId: 'ares-home-root', children: ['arn-l', 'arn-m']
        },
        'arn-l': { id: 'arn-l', type: 'text', content: 'ARES//FIT', styles: { fontSize: '2rem', fontWeight: '900', fontStyle: 'italic', color: PALETTE.red }, layoutMode: 'safety', parentId: 'ar-nav' },
        'arn-m': { id: 'arn-m', type: 'button', content: 'JOIN NOW', styles: { padding: '10px 30px', backgroundColor: PALETTE.red, color: 'white', fontWeight: '900', fontStyle: 'italic', borderRadius: '0', border: 'none', transform: 'skewX(-10deg)' }, layoutMode: 'safety', parentId: 'ar-nav', action: { type: 'navigate', payload: 'join' } },

        'ar-hero': {
            id: 'ar-hero', type: 'container',
            styles: { height: '85vh', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', padding: '0 60px' },
            layoutMode: 'safety', parentId: 'ares-home-root', children: ['arh-bg', 'arh-c']
        },
        'arh-bg': {
            id: 'arh-bg', type: 'box',
            styles: { position: 'absolute', top: '0', left: '0', width: '100%', height: '100%', backgroundImage: 'url(https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200)', backgroundSize: 'cover', opacity: '0.6' },
            layoutMode: 'safety', parentId: 'ar-hero'
        },
        'arh-c': {
            id: 'arh-c', type: 'container',
            styles: { zIndex: '10', maxWidth: '800px', gap: '20px' },
            layoutMode: 'safety', parentId: 'ar-hero', children: ['arhc-h', 'arhc-s', 'arhc-b']
        },
        'arhc-h': { id: 'arhc-h', type: 'text', content: 'CONQUER YOUR LIMITS.', styles: { fontSize: '6rem', fontWeight: '900', fontStyle: 'italic', lineHeight: '0.9', textTransform: 'uppercase' }, layoutMode: 'safety', parentId: 'arh-c' },
        'arhc-s': { id: 'arhc-s', type: 'text', content: 'Forged in sweat. Built for war.', styles: { fontSize: '1.5rem', color: '#ccc', fontWeight: '600' }, layoutMode: 'safety', parentId: 'arh-c' },
        'arhc-b': { id: 'arhc-b', type: 'button', content: 'START TRAINING', styles: { marginTop: '20px', padding: '20px 50px', backgroundColor: PALETTE.red, color: 'white', fontSize: '1.2rem', fontWeight: '900', border: 'none', cursor: 'pointer', transform: 'skewX(-10deg)', width: 'fit-content' }, layoutMode: 'safety', parentId: 'arh-c', action: { type: 'navigate', payload: 'programs' } },

        'ar-strip': {
            id: 'ar-strip', type: 'container',
            styles: { padding: '40px', backgroundColor: PALETTE.red, display: 'flex', justifyContent: 'space-around', alignItems: 'center', transform: 'skewY(-2deg) translateY(-20px)' },
            layoutMode: 'safety', parentId: 'ares-home-root', children: ['ast-1', 'ast-2', 'ast-3']
        },
        'ast-1': { id: 'ast-1', type: 'text', content: 'HIGH INTENSITY', styles: { fontSize: '1.5rem', fontWeight: '900', fontStyle: 'italic' }, layoutMode: 'safety', parentId: 'ar-strip' },
        'ast-2': { id: 'ast-2', type: 'text', content: 'STRENGTH', styles: { fontSize: '1.5rem', fontWeight: '900', fontStyle: 'italic' }, layoutMode: 'safety', parentId: 'ar-strip' },
        'ast-3': { id: 'ast-3', type: 'text', content: 'ENDURANCE', styles: { fontSize: '1.5rem', fontWeight: '900', fontStyle: 'italic' }, layoutMode: 'safety', parentId: 'ar-strip' },

        'ar-grid': {
            id: 'ar-grid', type: 'container',
            styles: { padding: '100px 60px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' },
            layoutMode: 'safety', parentId: 'ares-home-root', children: ['arg-1', 'arg-2']
        },
        'arg-1': { id: 'arg-1', type: 'container', styles: { height: '400px', backgroundColor: '#111', border: `1px solid ${PALETTE.red}`, justifyContent: 'center', alignItems: 'center', position: 'relative', overflow: 'hidden' }, layoutMode: 'safety', parentId: 'ar-grid', children: ['ag1-t'] },
        'ag1-t': { id: 'ag1-t', type: 'text', content: 'MEN\'S APPAREL', styles: { fontSize: '2.5rem', fontWeight: '900', fontStyle: 'italic', zIndex: '10' }, layoutMode: 'safety', parentId: 'arg-1' },

        'arg-2': { id: 'arg-2', type: 'container', styles: { height: '400px', backgroundColor: '#111', border: `1px solid ${PALETTE.red}`, justifyContent: 'center', alignItems: 'center', position: 'relative', overflow: 'hidden' }, layoutMode: 'safety', parentId: 'ar-grid', children: ['ag2-t'] },
        'ag2-t': { id: 'ag2-t', type: 'text', content: 'WOMEN\'S APPAREL', styles: { fontSize: '2.5rem', fontWeight: '900', fontStyle: 'italic', zIndex: '10' }, layoutMode: 'safety', parentId: 'arg-2' },

        'ar-footer': {
            id: 'ar-footer', type: 'container',
            styles: { padding: '60px', backgroundColor: '#000', textAlign: 'center' },
            layoutMode: 'safety', parentId: 'ares-home-root', children: ['arf-t']
        },
        'arf-t': { id: 'arf-t', type: 'text', content: 'ARES ATHLETICS. NO EXCUSES.', styles: { color: '#666', fontWeight: 'bold' }, layoutMode: 'safety', parentId: 'ar-footer' }
    };
    return elements;
};

import { OMNIOSPlugin, PluginContext } from '@/types/plugins';

export const OfficialThemeGenerator: OMNIOSPlugin = {
    id: 'official-theme-gen',
    name: 'Theme Generator',
    version: '1.0.0',
    description: 'Instantly generate brand-aligned design tokens and color palettes.',
    author: 'OMNIOS Team',
    type: 'panel',

    init: (ctx) => {
        console.log('Theme Generator Initialized');
    },

    render: (ctx: PluginContext) => {
        const applyTheme = (color: string) => {
            ctx.addToken({ name: 'Primary', value: color, type: 'color' });
            ctx.showNotification(`Applied ${color} as primary theme!`, 'success');
        };

        const addHero = () => {
            const rootId = ctx.getState().rootElementId;
            ctx.addElement('container', rootId, {
                styles: {
                    width: '100%',
                    height: '300px',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '12px',
                    border: '1px solid #333'
                },
                content: 'Plugin Generated Hero'
            });
            ctx.showNotification('Added Hero Section via Plugin');
        };

        return (
            <div style= {{ display: 'flex', flexDirection: 'column', gap: '12px' }
    }>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
    {
        ['#00ffd5', '#ff00ff', '#0099ff', '#ff9900'].map(color => (
            <button 
                            key= { color }
                            onClick = {() => applyTheme(color)}
style = {{
    height: '32px', backgroundColor: color, border: 'none',
        borderRadius: '4px', cursor: 'pointer'
}} 
                        />
                    ))}
</div>
    < button
onClick = { addHero }
style = {{
    padding: '10px', backgroundColor: 'var(--accent-teal)', border: 'none',
        borderRadius: '6px', color: 'black', fontWeight: 'bold', cursor: 'pointer',
            fontSize: '0.8rem'
}}
                >
    Generate Layout Base
        </button>
        </div>
        );
    }
};

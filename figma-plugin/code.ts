// OMNIOS Figma Bridge
// Traverses Figma selections and maps them to OMNIOS DesignerElements

figma.showUI(__html__, { width: 300, height: 400 });

figma.ui.onmessage = async (msg) => {
    if (msg.type === 'push-to-omnios') {
        const selection = figma.currentPage.selection;
        if (selection.length === 0) {
            figma.notify('Please select a frame to push.');
            return;
        }

        const payload = await Promise.all(selection.map(node => mapFigmaNode(node)));
        figma.ui.postMessage({ type: 'payload-ready', data: payload });
    }
};

async function mapFigmaNode(node: SceneNode): Promise<any> {
    const base: any = {
        id: node.id,
        name: node.name,
        type: 'container', // Default
        styles: {
            width: node.width + 'px',
            height: node.height + 'px',
            position: 'relative'
        },
        children: []
    };

    // Map Backgrounds
    if ('fills' in node && (node.fills as Paint[]).length > 0) {
        const fill = (node.fills as Paint[])[0];
        if (fill.type === 'SOLID') {
            const { r, g, b } = fill.color;
            base.styles.backgroundColor = `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${fill.opacity})`;
        }
    }

    // Map Border Radius
    if ('cornerRadius' in node) {
        base.styles.borderRadius = node.cornerRadius === figma.mixed ? '0px' : node.cornerRadius + 'px';
    }

    // Element Type Specifics
    if (node.type === 'TEXT') {
        base.type = 'text';
        base.content = node.characters;
        base.styles.fontSize = node.fontSize === figma.mixed ? '16px' : node.fontSize + 'px';
        base.styles.color = base.styles.backgroundColor; // Text color hack for now
        delete base.styles.backgroundColor;
    }

    // Recursion
    if ('children' in node) {
        for (const child of node.children) {
            base.children.push(await mapFigmaNode(child));
        }
    }

    return base;
}

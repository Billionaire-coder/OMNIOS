import { generateComponentCode } from '../src/lib/compiler/generator';
import { ReactNodeAST } from '../src/lib/compiler/ast';

// Mock AST (similar to what mapElementToAST outputs)
const mockAST: ReactNodeAST = {
    type: 'element',
    tagName: 'section',
    props: {
        id: 'root',
        className: 'hero-section'
    },
    style: {
        width: '100%',
        backgroundColor: '#fff'
    },
    children: [
        {
            type: 'element',
            tagName: 'div',
            props: { id: 'container-1' },
            style: { maxWidth: '1200px', margin: '0 auto' },
            children: [
                {
                    type: 'element',
                    tagName: 'h1',
                    props: { id: 'title-1' },
                    style: { fontSize: '48px' },
                    children: [
                        { type: 'text', textContent: 'Built for Speed', props: {} }
                    ]
                },
                {
                    type: 'component',
                    componentName: 'Image',
                    props: {
                        src: '/hero.png',
                        alt: 'Hero Image',
                        width: 800,
                        height: 600
                    },
                    isSelfClosing: true
                }
            ]
        }
    ]
};

console.log("Generating Code...");
const code = generateComponentCode('HomePage', mockAST);

console.log("\n--- GENERATED CODE ---\n");
console.log(code);
console.log("\n----------------------\n");

// Simple Assertions
if (code.includes('import React from \'react\'')) console.log("✅ Includes React Import");
else console.error("❌ Missing React Import");

if (code.includes('import Image from \'next/image\'')) console.log("✅ Includes Next/Image Import");
else console.error("❌ Missing Next/Image Import");

if (code.includes('export default function HomePage()')) console.log("✅ Component Defined Correctly");
else console.error("❌ Component Definition Wrong");

if (code.includes('<h1')) console.log("✅ Contains h1 tag");
else console.error("❌ Missing h1 tag");

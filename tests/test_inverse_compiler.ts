
import { gitSyncEngine } from '../src/lib/compiler/inverseCompiler';
import { DesignerElement } from '../src/types/designer';

const mockComponent = `
import React from 'react';

export const LandingPage = () => {
    return (
        <div className="bg-slate-900 p-8 min-h-screen">
            <header className="flex justify-between items-center mb-12">
                <h1 className="text-3xl font-bold text-white">OMNIOS</h1>
                <nav className="space-x-4">
                    <button className="text-zinc-400 hover:text-white">Features</button>
                    <button className="bg-indigo-600 px-4 py-2 rounded-lg text-white">Get Started</button>
                </nav>
            </header>
            <main>
                <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
                    <h2 className="text-5xl font-extrabold text-white mb-6">Build the Future Visually</h2>
                    <p className="text-zinc-400 text-lg">
                        The world's first agent-native collaborative designer.
                    </p>
                </div>
            </main>
        </div>
    );
};
`;

async function test() {
    console.log('🚀 Starting Inverse Compiler Test...');
    try {
        const elements = await gitSyncEngine.parseComponent(mockComponent);
        const count = Object.keys(elements).length;
        console.log(`✅ Successfully parsed ${count} elements!`);

        const elementList = Object.values(elements) as DesignerElement[];

        // Check root
        const root = elementList.find(el => el.parentId === null);
        console.log('Root Element:', root?.type, root?.props?.className);

        // Check child counts
        const header = elementList.find(el => el.type === 'box' && el.props?.className?.includes('flex'));
        console.log('Header Children:', header?.children?.length);

        const h1 = elementList.find(el => el.content === 'OMNIOS');
        console.log('Found H1:', h1 ? 'Yes' : 'No', 'Content:', h1?.content);

        // Check style parsing
        const mainDiv = elementList.find(el => el.styles?.textAlign === 'center');
        console.log('Parsed textAlign center:', mainDiv ? 'Yes' : 'No', 'Styles:', JSON.stringify(mainDiv?.styles));

        // Test Generation (Forward Compiler)
        if (root) {
            const generatedCode = gitSyncEngine.generateCode(root.id, elements);
            console.log('\n--- GENERATED CODE PREVIEW ---');
            console.log(generatedCode.substring(0, 300) + '...');

            if (generatedCode.includes("style={{ textAlign: 'center'") && generatedCode.includes('OMNIOS')) {
                console.log('✅ Generation matches design intent!');
            } else {
                console.log('❌ Generation failed to include styles or content.');
                process.exit(1);
            }
        }

        // Success criteria
        if (count > 5 && root && h1 && mainDiv) {
            console.log('\n✨ TEST PASSED: Inverse & Forward Compiler loop verified!');
        } else {
            console.log('\n❌ TEST FAILED: Loop verification failed.');
            process.exit(1);
        }
    } catch (e) {
        console.error('❌ TEST CRASHED:', e);
        process.exit(1);
    }
}

test();

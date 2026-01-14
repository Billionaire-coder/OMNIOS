import { generateProjectConfig } from '../src/lib/compiler/structure';

console.log("Generating Project Config...");
const files = generateProjectConfig('my-omnios-app');

console.log(`Generated ${Object.keys(files).length} files.`);

// Assertions
const expectedFiles = [
    'package.json',
    'tsconfig.json',
    'next.config.js',
    'tailwind.config.ts',
    'postcss.config.js',
    'src/app/globals.css',
    'src/app/layout.tsx'
];

let success = true;
expectedFiles.forEach(file => {
    if (files[file]) {
        console.log(`✅ ${file} exists`);
    } else {
        console.error(`❌ ${file} missing`);
        success = false;
    }
});

if (files['package.json'].includes('"name": "my-omnios-app"')) {
    console.log(`✅ package.json has correct name`);
} else {
    console.error(`❌ package.json name incorrect`);
    success = false;
}

if (!success) process.exit(1);

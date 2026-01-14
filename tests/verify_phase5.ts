import { RTLEngine } from '../src/lib/i18n/rtlEngine';

async function runTest() {
    console.log("Starting Phase 5 Verification (RTL Engine)...");

    const inputStyles = {
        textAlign: 'left',
        marginLeft: '10px',
        paddingRight: '20px',
        float: 'left',
        left: '50px',
        position: 'absolute'
    };

    console.log("Original Styles:", JSON.stringify(inputStyles));

    const transformed = RTLEngine.transformStyles(inputStyles as any, true);

    console.log("Transformed (RTL):", JSON.stringify(transformed));

    // Assertions
    if (transformed.textAlign !== 'right') throw new Error("textAlign did not flip");
    if (transformed.marginRight !== '10px') throw new Error("marginLeft did not flip to marginRight");
    if (transformed.paddingLeft !== '20px') throw new Error("paddingRight did not flip to paddingLeft");
    if (transformed.float !== 'right') throw new Error("float did not flip");
    if (transformed.right !== '50px') throw new Error("left did not flip to right");

    console.log("✅ Phase 5 Verification PASSED!");
}

runTest().catch(e => {
    console.error("❌ Verification FAILED:", e);
    process.exit(1);
});

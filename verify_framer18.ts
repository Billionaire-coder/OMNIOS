
// Basic types for verification
interface MockState {
    teamLibraries: any[];
    assets: { id: string; name: string }[];
}

const state: MockState = {
    teamLibraries: [],
    assets: [
        { id: 'asset1', name: 'Logo.png' }
    ]
};

// Logic from useProjectStore.tsx
const createTeamLibrary = (currentState: MockState, name: string) => {
    const newLib = {
        id: 'lib_123',
        name,
        description: undefined,
        assetIds: []
    };
    return { ...currentState, teamLibraries: [...currentState.teamLibraries, newLib] };
};

const addAssetToLibrary = (currentState: MockState, assetId: string, libraryId: string) => {
    return {
        ...currentState,
        teamLibraries: currentState.teamLibraries.map((lib: any) =>
            lib.id === libraryId
                ? { ...lib, assetIds: [...new Set([...lib.assetIds, assetId])] } // Prevent duplicates
                : lib
        )
    };
};

// Simulation
console.log("Starting Framer18 Logic Verification...");

let currentState = state;

// 1. Create Library
console.log("Step 1: Create Team Library");
currentState = createTeamLibrary(currentState, "Marketing Assets");
if (currentState.teamLibraries.length === 1 && currentState.teamLibraries[0].name === "Marketing Assets") {
    console.log("✅ Library created successfully.");
} else {
    console.error("❌ Failed to create library.");
}

// 2. Add Asset
console.log("Step 2: Add Asset to Library");
currentState = addAssetToLibrary(currentState, 'asset1', 'lib_123');
if (currentState.teamLibraries[0].assetIds.includes('asset1')) {
    console.log("✅ Asset added to library.");
} else {
    console.error("❌ Failed to add asset.");
}

// 3. Duplicate Prevention
console.log("Step 3: Test Duplicate Prevention");
currentState = addAssetToLibrary(currentState, 'asset1', 'lib_123');
if (currentState.teamLibraries[0].assetIds.length === 1) {
    console.log("✅ Duplicates prevented.");
} else {
    console.error("❌ Duplicates allowed (failed).");
}

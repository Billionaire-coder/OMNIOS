# OMNIOS Rust/WASM Engine Deep Analysis

## Overview
The OMNIOS engine is a high-performance Rust-based WebAssembly module that handles layout calculations, physics simulation, spatial indexing, logic execution, and various visual effects. It serves as the computational core that bridges React state management with native-performance operations.

## Build Configuration

### Cargo.toml
- **Edition**: 2021
- **Crate Type**: `cdylib` (dynamic library) and `rlib` (Rust library)
- **Target**: `wasm32-unknown-unknown` for WASM compilation
- **Features**: 
  - `browser` (default): Enables web-sys bindings for browser APIs
  - Console error panic hook for better debugging

### Key Dependencies
- **wasm-bindgen** (0.2): WASM/JS interop
- **taffy** (0.3): Flexbox/Grid layout engine
- **serde/serde_json**: Serialization
- **serde-wasm-bindgen**: WASM-specific serialization
- **yrs** (0.18): Y.js CRDT for collaboration
- **image** (0.24): Image processing (JPEG, PNG, WebP)
- **fast_image_resize** (2.7): SIMD-accelerated image resizing
- **ttf-parser** (0.20): Font parsing
- **rstar** (0.9): R-tree spatial indexing
- **web-sys**: Browser API bindings (optional, feature-gated)

### Build Profiles
- **Release**: Optimized for size (`opt-level = "s"`)

## Core Architecture

### Global State Management
The engine uses `lazy_static!` for thread-safe global state:

```rust
- PROJECT_STATE: Mutex<Option<ProjectState>> - Main project state
- LAYOUT_TREE: Mutex<HashMap<String, Node>> - Taffy layout nodes
- TAFFY: Mutex<Taffy> - Layout engine instance
- ANIMATION_STATE: Mutex<HashMap<String, HashMap<String, AnimationValue>>> - Spring animations
- PLUGIN_REGISTRY: Mutex<PluginRegistry> - Plugin system
- PHYSICS_ENGINE: Mutex<RigidBodyPlugin> - Physics simulation
- PARTICLES_ENGINE: Mutex<ParticlesPlugin> - Particle effects
- STATEMACHINE_ENGINE: Mutex<StateMachinePlugin> - State machine
- DIRTY_ELEMENTS: Mutex<HashSet<String>> - Change tracking
- LOGIC_KERNEL: Mutex<LogicKernel> - Logic execution
- SPATIAL_INDEX: Mutex<SpatialIndex> - R-tree spatial queries
```

## Module Structure

### 1. Core Modules (`src/`)

#### `lib.rs` - Main Entry Point
**Key Functions:**
- `sync_state(json_state: &str)`: Synchronizes full project state from React
- `sync_element(val: JsValue)`: Synchronizes single element
- `compute_layout()`: Recomputes layout using Taffy
- `get_element_layout(id: &str)`: Returns element position/size
- `update_animations(dt: f32)`: Updates spring animations and plugin render loop
- `apply_command(command_json: &str)`: Executes HyperCommand protocol
- `get_state_deltas()`: Returns changed elements (delta updates)
- `find_snap_targets()`: Spatial snapping for drag operations
- `fire_trigger()`: Logic execution trigger

**Layout Computation Flow:**
1. Parse project state from JSON
2. Build Taffy node tree from element hierarchy
3. Compute layout with Taffy
4. Update spatial index with absolute coordinates
5. Update animation targets

**Style Mapping:**
- Maps CSS properties to Taffy `Style` struct
- Supports flexbox, grid, absolute positioning
- Handles responsive styles (tablet/mobile)
- Parses dimensions (px, %, auto)

#### `runtime.rs` - Runtime Context
- `RuntimeContext`: Execution context for logic flows
- `execute_headless_flow()`: Executes blueprints without UI

#### `sdk.rs` - Plugin SDK
**Plugin System:**
- `OmniosPlugin` trait: Plugin interface
- `PluginRegistry`: Plugin management
- `PluginContext`: Registration context
- `RenderContext`: Render loop context

**Plugin Lifecycle:**
1. `on_register()`: Called during registration
2. `render()`: Called every frame (60fps)

### 2. Plugin Modules (`src/plugins/`)

#### `physics.rs` - Physics Engine
**RigidBodyPlugin:**
- Euler integration for rigid body dynamics
- Gravity simulation (9.81 m/s²)
- Collision detection (simple floor collision)
- Body types: Static/Dynamic
- Batch transform export (Float32Array for JS)

**Operations:**
- `add_body()`: Add physics body
- `step()`: Physics simulation step
- `get_state()`: Get all body positions
- `get_batch_transforms()`: Optimized Float32Array export

#### `spatial_index.rs` - Spatial Indexing
**SpatialIndex:**
- R-tree data structure (rstar crate)
- O(log n) spatial queries
- Element bounds tracking

**Operations:**
- `insert_or_update()`: Update element bounds
- `remove()`: Remove element
- `hit_test()`: Point-in-element query
- `query_area()`: Rectangle query
- `get_bounds()`: Get element bounds
- `iter_all()`: Iterate all elements

**Use Cases:**
- Drag snapping
- Hit testing
- Area selection
- Collision detection

#### `layout.rs` - Layout Engine
**compute_project_layout():**
- Builds Taffy node tree from project state
- Computes layout for all roots
- Updates spatial index with absolute coordinates

**Style Mapping:**
- CSS → Taffy style conversion
- Supports display, flex-direction, justify-content, align-items
- Handles dimensions, padding, margin, gap
- Absolute positioning support

#### `logic_kernel.rs` - Logic Execution
**LogicKernel:**
- Blueprint registration and execution
- Node graph traversal
- Variable management
- Secret store integration
- Gas limit (1000 steps) for infinite loop protection

**Node Types:**
- `set_var`: Variable assignment
- `condition`: Conditional branching
- Action nodes: Emit side effects to JS

**Execution Flow:**
1. Find trigger nodes matching event type
2. Execute node logic
3. Traverse connections to next nodes
4. Continue until no more connections

#### `interaction.rs` - Interaction System
**InteractionPlugin:**
- `constrain_drag()`: Constrains drag to parent bounds
- `get_group_bounds()`: Calculates multi-selection bounds
- `find_snap_targets()`: Magnetic snapping algorithm

**Snapping Algorithm:**
- O(N) iteration over all elements
- Snaps to edges (left, right, center) and corners
- Threshold-based (default 5px)
- Returns snapped position and guide lines

#### `visuals.rs` - Visual Effects
**ParticlesPlugin:**
- Particle emitter system
- Types: Snow, Fire, Smoke
- Lifecycle management
- Canvas rendering (browser feature)

**FilterPlugin:**
- Post-processing filters
- Blur, sepia, etc.

#### `standard.rs` - Standard Library Plugins
- Gravity plugin
- Other standard effects

#### Other Plugins
- `input.rs`: Input handling
- `network.rs`: Network operations
- `devtools.rs`: Developer tools
- `simulation.rs`: Simulation engine
- `vqa.rs`: Visual quality assurance

### 3. Core Services (`src/core/`)

#### `secrets.rs` - Secret Management
**SecretStore:**
- Environment variable access (server-side)
- In-memory secret storage
- WASM-safe (no env access in browser)

#### `auth.rs` - Authentication
- Authentication core logic

### 4. Specialized Modules

#### `collab.rs` - Collaboration
- Y.js CRDT integration
- State vector encoding
- Update application

#### `optimizer.rs` - Optimization
- Bundle analysis
- Performance optimization

#### `assets.rs` - Asset Processing
- Image optimization
- SIMD-accelerated resizing

#### `fonts.rs` - Font Analysis
- Font coverage analysis
- Glyph detection

#### `a11y.rs` - Accessibility
- Accessibility tree generation
- A11y compliance checking

#### `neural.rs` - Neural Networks
- Interaction prediction
- Neural model training
- Weight management

#### `healing.rs` - Asset Healing
- Placeholder generation
- SVG synthesis

#### `native.rs` - Native Compilation
- Native bundle compilation
- OS-specific builds

#### `autonomous.rs` - Autonomous Testing
- A/B testing engine
- Variant selection
- Conversion tracking

#### `vqa.rs` - Visual Quality Assurance
- Snapshot generation
- Parity checking

## WASM Bindings

### TypeScript Interface (`pkg/omnios_engine.d.ts`)
Exports 80+ functions including:
- State management: `sync_state`, `sync_element`, `get_state_deltas`
- Layout: `compute_layout`, `get_element_layout`
- Physics: `get_physics_state`, `get_batch_transforms`
- Logic: `fire_trigger`, `register_logic_blueprint`
- Spatial: `hit_test`, `query_area`, `find_snap_targets`
- Assets: `optimize_asset_image`
- AI: `predict_interaction`, `train_neural_model`
- Native: `compile_native_bundle`

### HyperBridge Integration (`src/lib/engine/HyperBridge.ts`)
TypeScript bridge that:
- Lazy-loads WASM module
- Throttles state sync (100ms)
- Manages command queue
- Runs animation loop (60fps)
- Handles side effects from Rust
- Provides physics position access
- Manages neural network weights

## Performance Optimizations

### 1. Delta Updates
- Only syncs changed elements (`DIRTY_ELEMENTS`)
- Reduces JSON serialization overhead
- Polled every 100ms from React

### 2. Batch Transforms
- Physics positions exported as Float32Array
- Single allocation for all bodies
- Fast hash-based lookup in JS

### 3. Spatial Indexing
- R-tree for O(log n) queries
- Cached bounds in HashMap
- Efficient hit testing

### 4. Layout Caching
- Taffy tree cached in global state
- Only recomputes on state changes
- Absolute position calculation optimized

### 5. Animation System
- Spring physics in Rust
- Direct DOM manipulation in JS (bypasses React)
- 60fps target

## Security Considerations

### 1. Gas Limits
- Logic execution limited to 1000 steps
- Prevents infinite loops
- Step counter reset per execution

### 2. Secret Management
- Environment variables only on server
- No env access in WASM (browser)
- In-memory storage for browser

### 3. Sandboxing
- WASM runs in browser sandbox
- No direct file system access
- Limited to browser APIs

## Integration Points

### React Integration
- `useProjectStore` → `hyperBridge.commit()` → `apply_command()`
- `hyperBridge.getStateDeltas()` → React state update
- `usePhysicsTransform` hook for physics-driven elements

### Collaboration
- Y.js CRDT for state sync
- Binary state vector encoding
- Update application

### Native (Tauri)
- File system access via Tauri plugins
- Neural weights persistence
- Native compilation support

## Known Limitations

1. **Physics Engine**: Simplified Euler integration, basic collision
2. **Layout**: Taffy 0.3 limitations (no CSS Grid fully)
3. **Snapping**: O(N) algorithm (acceptable for <1000 elements)
4. **Animation**: Fixed spring parameters
5. **WASM Size**: Large binary (~several MB)

## Future Enhancements

Based on code structure:
- Enhanced physics (Rapier2D integration)
- GPU rendering (WebGPU)
- Advanced neural networks
- Better layout engine (Taffy 1.0)
- Optimized snapping (spatial queries)
- Web Workers for off-main-thread computation

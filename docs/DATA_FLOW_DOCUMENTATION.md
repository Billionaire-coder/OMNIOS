# OMNIOS Data Flow Documentation

## Overview
This document describes the comprehensive data flow patterns in OMNIOS, covering state management, collaboration, compilation, logic execution, and all major system interactions.

## 1. State Management Flow

### 1.1 User Action → State Update Flow

```
User Action (Click, Drag, Type)
    ↓
React Component Event Handler
    ↓
useProjectStore Hook
    ↓
Store Action (e.g., updateElementStyles)
    ↓
dispatchCommand() [HyperCommand Protocol]
    ↓
┌─────────────────────────────────────┐
│  HyperBridge.commit()               │
│  - Serializes command to JSON       │
│  - Sends to Rust WASM engine        │
└─────────────────────────────────────┘
    ↓
Rust Engine: apply_command()
    ↓
State Update in Rust (PROJECT_STATE)
    ↓
Mark Element as Dirty (DIRTY_ELEMENTS)
    ↓
React Polls: hyperBridge.getStateDeltas()
    ↓
React State Update (useProjectStore.setState)
    ↓
Component Re-render
    ↓
UI Update
```

### 1.2 Auto-Save Flow

```
State Change Detected
    ↓
Debounce Timer (1.5 seconds)
    ↓
┌─────────────────────────────────────┐
│  PGlite Auto-Save                   │
│  - Serializes ProjectState          │
│  - Writes to PGlite database        │
│  - Updates projects, pages, elements │
└─────────────────────────────────────┘
    ↓
Database Persisted
```

### 1.3 History/Undo Flow

```
State Change
    ↓
pushToHistory() [Before Change]
    ↓
History Stack (Array of ProjectState snapshots)
    ↓
User Triggers Undo
    ↓
popFromHistory()
    ↓
Restore Previous State
    ↓
React State Update
    ↓
UI Reverts
```

### 1.4 Physics-Driven Element Flow

```
Rust Physics Engine Step (60fps)
    ↓
Update RigidBody positions
    ↓
get_batch_transforms() [Float32Array]
    ↓
HyperBridge Animation Loop
    ↓
usePhysicsTransform Hook
    ↓
Direct DOM Manipulation (bypasses React)
    ↓
Element Position Updated
```

## 2. Collaboration Flow

### 2.1 Local Change → Remote Sync

```
Local User Action
    ↓
dispatchCommand() [HyperCommand]
    ↓
┌─────────────────────────────────────┐
│  CollabService.broadcastCommand()   │
│  - Tags command with userId         │
│  - Adds timestamp                   │
│  - Pushes to Y.js Array             │
└─────────────────────────────────────┘
    ↓
Y.js Document Update
    ↓
WebSocket Provider (y-websocket)
    ↓
WebSocket Server (localhost:1234)
    ↓
Broadcast to All Connected Peers
    ↓
Remote Peer Receives Update
    ↓
Y.js Merge Algorithm
    ↓
Remote State Update
    ↓
Remote UI Update
```

### 2.2 Presence Flow

```
Local User Moves Cursor
    ↓
updatePresence({ cursor: { x, y } })
    ↓
Y.js Awareness API
    ↓
WebSocket Broadcast
    ↓
Remote Peers Receive
    ↓
PresenceLayer Component
    ↓
Render Remote Cursors
```

### 2.3 Comments Flow

```
User Creates Comment
    ↓
addComment() [useCollaboration]
    ↓
Y.js Array (yComments)
    ↓
WebSocket Sync
    ↓
Remote Peers Receive
    ↓
CommentsOverlay Updates
    ↓
Comment Thread Displayed
```

### 2.4 Version Snapshots Flow

```
Auto-Checkpoint Timer (10 minutes)
    ↓
createSnapshot()
    ↓
Y.js Array (yVersions)
    ↓
WebSocket Sync
    ↓
All Peers Have Snapshot
    ↓
Version History Available
```

## 3. Compilation Flow

### 3.1 Export Request Flow

```
User Clicks "Export Project"
    ↓
ProjectScaffolder.scaffold()
    ↓
┌─────────────────────────────────────┐
│  ASTCompiler.compilePages()        │
│  - Builds TypeScript AST            │
│  - Generates React components       │
│  - Creates page files               │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│  ASTCompiler.compileMasterComponents()│
│  - Generates component files        │
│  - Creates props interfaces         │
└─────────────────────────────────────┘
    ↓
Generate Config Files
    ├── package.json
    ├── tailwind.config.ts
    ├── next.config.js
    └── app/layout.tsx
    ↓
Generate Serverless Functions
    └── app/api/[routes]/route.ts
    ↓
Generate Logic Runtime
    └── lib/runtime/LogicEngine.ts
    ↓
Bundle Assets
    └── Collect images, fonts, etc.
    ↓
Create ZIP Archive
    ↓
Download Triggered
```

### 3.2 Static Compilation Flow

```
StaticCompiler.compileProject()
    ↓
For Each Page:
    ├── generateHtmlForPage()
    │   ├── renderElement() [Recursive]
    │   ├── Resolve data bindings
    │   ├── Handle repeaters
    │   └── Generate semantic HTML
    └── Generate CSS classes
    ↓
generateCssForProject()
    ├── Extract all styles
    ├── Generate CSS classes
    └── Create global.css
    ↓
Return Files Map
    ↓
ZIP Export or Deployment
```

### 3.3 Inverse Compilation Flow (Code → Design)

```
User Pastes React Code
    ↓
GitSyncEngine.parseComponent()
    ↓
ts-morph AST Parsing
    ↓
Traverse JSX Tree
    ↓
Extract Elements
    ├── Tag names → Element types
    ├── Attributes → Props
    ├── Styles → ElementStyles
    └── Children → Element tree
    ↓
Create DesignerElement Objects
    ↓
Update Project State
    ↓
Canvas Renders New Elements
```

## 4. Logic Execution Flow

### 4.1 Event Trigger → Action Execution

```
User Clicks Button (Element ID: "btn-1")
    ↓
ElementRenderer onClick Handler
    ↓
useLogicEngine.fireTrigger("btn-1", "on_click")
    ↓
Find Matching Event Nodes
    └── Filter: type === "on_click" && elementId === "btn-1"
    ↓
For Each Event Node:
    ├── Find Outgoing Edges
    ├── Get Target Nodes
    └── Execute Target Nodes
        ↓
        LogicEngine.executeNode()
        ├── Switch on node.type
        ├── Execute node logic
        └── Resolve next port
        ↓
        Find Next Connections
        ↓
        Recursively Execute Next Nodes
    ↓
All Actions Executed
```

### 4.2 Blueprint Execution Flow (Rust)

```
fire_trigger(blueprintId, triggerType, payload)
    ↓
Rust: LOGIC_KERNEL.execute()
    ↓
Find Start Nodes (type === triggerType)
    ↓
For Each Start Node:
    ├── execute_node()
    │   ├── Check gas limit (1000 steps)
    │   ├── Execute node logic
    │   │   ├── set_var: Update runtime_variables
    │   │   ├── condition: Evaluate condition
    │   │   └── Action: Emit side effect
    │   └── Determine next port
    ├── Find Next Connections
    └── Recursively Execute
    ↓
Execution Complete
```

### 4.3 Serverless Function Execution Flow

```
HTTP Request to /api/[route]
    ↓
Next.js API Route Handler
    ↓
Load Function Code from State
    ↓
┌─────────────────────────────────────┐
│  VM Sandbox Execution              │
│  - Create VM context               │
│  - Expose limited globals          │
│    ├── console                     │
│    ├── fetch                       │
│    ├── setTimeout                  │
│    ├── process.env                 │
│    └── inputs                      │
│  - Execute user code               │
│  - Capture logs                    │
│  - Return result                   │
└─────────────────────────────────────┘
    ↓
Return Response
```

### 4.4 Database Query Flow (Logic Node)

```
db_query Node Executed
    ↓
Extract collectionId from node.data
    ↓
Query Project Data
    ├── Filter by collectionId
    ├── Apply filters (if any)
    └── Return items
    ↓
Store in Runtime Variables
    ↓
Next Node Can Access Results
```

## 5. Data Binding Flow

### 5.1 Collection Item → Element Binding

```
RepeaterRenderer Renders
    ↓
For Each Item in Collection:
    ├── Create DataContext
    │   └── Provide item data
    ├── Render Template Element
    │   └── ElementRenderer
    │       └── Resolve Bindings
    │           ├── Check element.bindings
    │           ├── Lookup in contextItem.values
    │           └── Replace content/props
    └── Display Bound Data
```

### 5.2 Variable Binding Flow

```
Element Has variable_bindings
    ↓
useProjectStore.getVariable()
    ↓
Check Global Variables
    ↓
Resolve Value
    ↓
Update Element Content/Props
    ↓
Element Re-renders
```

## 6. Layout Computation Flow

### 6.1 Taffy Layout Flow

```
State Sync to Rust
    ↓
compute_layout()
    ↓
Build Taffy Node Tree
    ├── For each element:
    │   ├── Map styles to Taffy Style
    │   ├── Create Taffy Node
    │   └── Attach children
    └── Build hierarchy
    ↓
Taffy.compute_layout()
    ├── Flexbox calculations
    ├── Grid calculations
    └── Absolute positioning
    ↓
Update Spatial Index
    ├── Calculate absolute positions
    ├── Update R-tree
    └── Store bounds
    ↓
Update Animation Targets
    └── Set spring animation targets
    ↓
Return Layout Data
```

### 6.2 Snapping Flow

```
User Drags Element
    ↓
findSnapTargets(elementId, x, y, width, height)
    ↓
Rust: InteractionPlugin.find_snap_targets()
    ↓
Query Spatial Index
    ├── Iterate all elements
    ├── Calculate edge distances
    └── Find matches within threshold
    ↓
Calculate Snap Position
    ├── X-axis snapping
    └── Y-axis snapping
    ↓
Generate Snap Guides
    ↓
Return SnapResult
    ↓
UI Displays Guides
    ↓
Element Snaps to Position
```

## 7. Asset Management Flow

### 7.1 Image Upload Flow

```
User Uploads Image
    ↓
File Input Handler
    ↓
Read File as ArrayBuffer
    ↓
┌─────────────────────────────────────┐
│  hyperBridge.optimizeImage()         │
│  - Send to Rust WASM                │
│  - SIMD-accelerated processing      │
│  - Resize/compress                  │
│  - Return optimized data            │
└─────────────────────────────────────┘
    ↓
Upload to CDN (if configured)
    ↓
Store Asset Metadata
    ├── Add to state.assets
    ├── Store in PGlite
    └── Generate CDN URL
    ↓
Update Element (if dropped)
    └── Set element.content = assetUrl
```

### 7.2 Asset Loading Flow

```
ElementRenderer Renders Image
    ↓
Check element.content (URL)
    ↓
getDynamicAssetUrl()
    ├── Check if CDN URL
    ├── Apply optimizations
    └── Return final URL
    ↓
HybridImage Component
    ├── Lazy loading
    ├── Blur placeholder
    └── Responsive sizes
    ↓
Image Loaded
```

## 8. AI Generation Flow

### 8.1 Layout Generation Flow

```
User Enters Prompt in AIAssistantPanel
    ↓
GenerativeCore.generateLayout(prompt)
    ↓
Analyze Prompt Keywords
    ├── "hero" → Hero template
    ├── "feature" → Feature grid
    └── Default → Simple section
    ↓
Generate Element Array
    ├── Create section container
    ├── Add child elements
    ├── Apply styles
    └── Set content
    ↓
bulkUpdateElements()
    ↓
Elements Added to Canvas
    ↓
Canvas Re-renders
```

### 8.2 AI Code Generation Flow

```
User Requests Code Generation
    ↓
AICopilot.generateCode()
    ↓
AI Service Call (OpenAI/Anthropic)
    ↓
Generate TypeScript/React Code
    ↓
Parse Generated Code
    ↓
Apply to Element/Custom Code
    ↓
Code Executed/Rendered
```

## 9. Deployment Flow

### 9.1 Vercel Deployment Flow

```
User Clicks "Deploy to Vercel"
    ↓
DeploymentService.deployToVercel()
    ↓
ProjectScaffolder.scaffold()
    ├── Generate all files
    └── Create file structure
    ↓
Create/Update Vercel Project
    ├── POST /v9/projects
    └── Handle 409 (exists)
    ↓
Inject Environment Variables
    ├── POST /v9/projects/{name}/env
    └── For each secret
    ↓
Upload Files & Deploy
    ├── POST /v13/deployments
    ├── Include all files
    └── Set framework: 'nextjs'
    ↓
Poll Deployment Status
    ├── GET /v13/deployments/{id}
    ├── Check status
    └── Wait for READY
    ↓
Deployment Complete
    └── Return URL
```

## 10. Git Integration Flow

### 10.1 Push to Git Flow

```
User Clicks "Push to Git"
    ↓
GitService.updateFileContent()
    ↓
Get Existing File (for SHA)
    ↓
GitHub API: PUT /repos/{owner}/{repo}/contents/{path}
    ├── Base64 encode content
    ├── Include SHA (for update)
    └── Commit message
    ↓
File Updated in Repository
    ↓
Commit Created
```

### 10.2 Pull from Git Flow

```
User Clicks "Pull from Git"
    ↓
GitService.getFileContent()
    ↓
GitHub API: GET /repos/{owner}/{repo}/contents/{path}
    ↓
Decode Base64 Content
    ↓
Parse Code (Inverse Compiler)
    ↓
Update Project State
    ↓
Canvas Updates
```

## 11. Plugin Execution Flow

### 11.1 Plugin Load Flow

```
PluginManager.registerPlugin(plugin)
    ↓
Check if Already Registered
    ↓
Create PluginContext
    ↓
plugin.init(context)
    ↓
Store in Plugin Registry
    ↓
Plugin Available
```

### 11.2 Plugin Render Flow

```
Plugin Render Cycle (60fps)
    ↓
PluginRegistry.render_all()
    ↓
For Each Active Plugin:
    ├── plugin.render(renderContext)
    └── Execute plugin logic
    ↓
Visual Effects Applied
```

## 12. Webhook Flow

### 12.1 Webhook Reception Flow

```
External Service Sends Webhook
    ↓
POST /api/webhooks/[hookId]
    ↓
Parse Payload (JSON or Raw)
    ↓
webhookStore.addEvent()
    ├── Store payload
    ├── Store headers
    └── Store timestamp
    ↓
Event Available for Polling
```

### 12.2 Webhook Polling Flow

```
Logic Node: webhook_trigger
    ↓
Poll: GET /api/webhooks/poll?hookId=...
    ↓
webhookStore.getEvents(hookId)
    ↓
Return Events Array
    ↓
Trigger Logic Flow
    └── Execute connected nodes
```

## 13. Authentication Flow

### 13.1 Sign Up Flow

```
User Submits Sign Up Form
    ↓
AuthService.signUp(email, password)
    ↓
Check if User Exists
    ↓
Generate Salt
    ↓
Hash Password (SHA-256)
    ↓
Insert into PGlite users table
    ↓
Return User Object
    ↓
Update Project State
    └── state.auth.currentUser
```

### 13.2 Login Flow

```
User Submits Login Form
    ↓
AuthService.login(email, password)
    ↓
Query User from Database
    ↓
Hash Provided Password with Stored Salt
    ↓
Compare Hashes
    ↓
If Match:
    └── Return User Object
    ↓
Update Project State
    └── state.auth.currentUser
```

## 14. Secret Management Flow

### 14.1 Store Secret Flow

```
User Sets Environment Variable
    ↓
SecretService.setSecret(envId, keyName, value)
    ↓
Generate Encryption Key (AES-GCM)
    ↓
Encrypt Value
    ├── Generate IV
    ├── Encrypt with key
    └── Store IV + Encrypted Value
    ↓
Insert into PGlite secrets table
    ↓
Secret Stored (Encrypted)
```

### 14.2 Retrieve Secret Flow

```
Logic Node Needs Secret
    ↓
SecretService.getSecret(envId, keyName)
    ↓
Query from Database
    ↓
Decrypt Value
    ├── Load IV
    ├── Decrypt with key
    └── Return plaintext
    ↓
Secret Available for Use
```

## 15. Multi-Tenant Flow

### 15.1 Tenant Isolation Flow

```
User Accesses Data
    ↓
Check activeTenantId
    ↓
Filter Queries by Tenant
    ├── db_query nodes
    ├── Collection queries
    └── All data operations
    ↓
Only Tenant Data Returned
```

### 15.2 Tenant Switching Flow

```
User Switches Tenant
    ↓
Update state.activeTenantId
    ↓
Update LogicEngine.activeTenantId
    ↓
All Subsequent Queries Filtered
    ↓
UI Updates to Show Tenant Data
```

## 16. Performance Optimization Flows

### 16.1 Delta Update Flow

```
State Change in Rust
    ↓
Mark Element as Dirty
    └── DIRTY_ELEMENTS.insert(elementId)
    ↓
React Polls (every 100ms)
    └── hyperBridge.getStateDeltas()
    ↓
Rust Returns Only Changed Elements
    └── JSON array of dirty elements
    ↓
Clear Dirty Set
    ↓
Update React State (Only Changed)
    ↓
React Re-renders (Minimal)
```

### 16.2 Physics Batch Transform Flow

```
Physics Engine Step
    ↓
get_batch_transforms()
    ↓
Return Float32Array
    ├── [hash, x, y, hash, x, y, ...]
    └── All bodies in one array
    ↓
HyperBridge Caches Array
    ↓
usePhysicsTransform Hook
    ├── Searches array by hash
    └── Direct DOM update
    ↓
60fps Smooth Animation
```

## 17. Error Handling Flow

### 17.1 Error Recovery Flow

```
Error Detected
    ↓
CyberNexus.handleStallDetected()
    ↓
Check State Snapshots
    ↓
Revert to Last Good State
    └── hyperBridge.syncState(snapshot)
    ↓
Visual Feedback (Red Overlay)
    ↓
State Restored
```

## 18. Data Flow Summary

### Key Patterns

1. **Command Pattern**: All state changes go through HyperCommand
2. **Observer Pattern**: Y.js for collaboration, EventBus for runtime
3. **Bridge Pattern**: HyperBridge between React and Rust
4. **Factory Pattern**: Compilers create code structures
5. **Strategy Pattern**: Different compilation/export strategies
6. **Singleton Pattern**: Services (PluginManager, BillingService)
7. **Provider Pattern**: React Context providers

### Performance Optimizations

1. **Debouncing**: Auto-save (1.5s), state sync (100ms)
2. **Batching**: Delta updates, bulk operations
3. **Lazy Loading**: Dynamic imports, WASM loading
4. **Memoization**: Computed values, React.memo
5. **Direct DOM**: Physics transforms bypass React
6. **Web Workers**: Asset processing
7. **SIMD**: Image optimization

### Data Consistency

1. **CRDT**: Y.js for conflict-free collaboration
2. **Last Write Wins**: Timestamp-based conflict resolution
3. **State Snapshots**: Recovery mechanism
4. **Transaction Support**: PGlite transactions
5. **Optimistic Updates**: UI updates before confirmation

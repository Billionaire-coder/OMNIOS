# OMNIOS React Components Deep Analysis

## Overview
OMNIOS contains 119 React components organized into logical categories. This document provides a comprehensive analysis of all components, their hierarchy, props, state management, and interactions.

## Component Statistics
- **Total Components**: 119 files
- **Designer Components**: 104 files
- **Logic Components**: 3 files
- **UI Components**: 6 files
- **Marketing Components**: 2 files
- **Data Components**: 1 file
- **SEO Components**: 1 file
- **Engine Components**: 1 file
- **Layout Components**: 1 file

## Component Hierarchy

### Root Component: EditorInterface
**Location**: `src/components/designer/EditorInterface.tsx`
**Purpose**: Main editor orchestrator, manages all panels and canvas

**Key Features**:
- Multi-panel layout (left sidebar, canvas, right sidebar)
- Tab-based navigation (ADD, LAYERS, STYLES, COMPS, TOKENS, DATA, MARKET, VARS, AI, LANG, GIT, etc.)
- Dynamic component loading (code splitting)
- Collaboration integration
- Mobile preview
- Command bar
- Context menus
- Shortcut management

**State Management**:
- Uses `useProjectStore` for global state
- Local state for UI visibility, active tabs, modals
- Collaboration state via `useCollaboration`

**Props**:
```typescript
interface EditorInterfaceProps {
    initialTheme: ThemeTemplate | any;
    mode: 'blank' | 'theme' | 'template';
}
```

**Key Sub-components**:
- ElementRenderer (canvas)
- PropertiesPanel (right sidebar)
- ComponentsPanel (left sidebar)
- LayersPanel
- AIAssistantPanel
- LogicCanvas
- Various overlays and modals

## Component Categories

### 1. Core Designer Components

#### ElementRenderer
**Location**: `src/components/designer/ElementRenderer.tsx`
**Purpose**: Renders element tree recursively with interactions

**Features**:
- Recursive rendering of element hierarchy
- Drag & drop support
- Resize handles
- Selection handling
- Physics-driven positioning
- Snapping system
- Instance/component support
- Data binding (repeaters)
- Custom code execution
- Animation support (Framer Motion)
- RTL support
- Responsive styles (desktop/tablet/mobile)

**Props**:
```typescript
interface ElementRendererProps {
    elementId: string;
    elements: Record<string, DesignerElement>;
    selectedElementId: string | null;
    onSelect: (id: string, e: React.MouseEvent) => void;
    onMove?: (id: string, x: number, y: number) => void;
    instanceContext?: {
        instanceId: string;
        slotContent?: Record<string, string[]>;
    };
    nativeMode?: boolean;
}
```

**Performance Optimizations**:
- React.memo with custom comparison
- Physics transform hook (bypasses React)
- Lazy loading for heavy components

#### PropertiesPanel
**Location**: `src/components/designer/PropertiesPanel.tsx`
**Purpose**: Property editor for selected elements

**Features**:
- Style editing (all CSS properties)
- Content editing
- Props editing
- Class management
- Component prop management
- State panel (hover, active, focus)
- Responsive breakpoint editing
- Box model editor
- Shadow editor
- Filter editor
- Border editor
- Gradient picker
- Physics HUD
- Computed style inspector
- Batch editing support

**Tabs**:
- Style: CSS properties
- Settings: Element properties
- Code: Custom code editor
- Interactions: Event handlers

#### ComponentsPanel
**Location**: `src/components/designer/ComponentsPanel.tsx`
**Purpose**: Master component library

**Features**:
- Lists all master components
- Component instantiation
- Workshop integration (selling components)
- Marketplace bundles display

#### LayersPanel
**Location**: `src/components/designer/LayersPanel.tsx`
**Purpose**: Element hierarchy tree view

**Features**:
- Tree structure display
- Drag & drop reordering
- Visibility toggles
- Lock/unlock
- Selection
- Search/filter

### 2. Logic & Workflow Components

#### LogicCanvas
**Location**: `src/components/designer/LogicCanvas.tsx`
**Purpose**: Visual logic graph editor

**Features**:
- Node-based editor
- Connection drawing
- Node types: Event, Action, Condition
- Breakpoint support
- Variable management
- Secret store integration
- Blueprint management

**Node Types**:
- Event nodes: on_click, on_load, on_change, etc.
- Action nodes: navigate, set_var, api_request, etc.
- Condition nodes: branching logic

#### WorkflowStudio
**Location**: `src/components/designer/Architect/WorkflowStudio.tsx`
**Purpose**: Server-side workflow editor

**Features**:
- Trigger nodes (DB, Cron, Webhook)
- Action nodes (Email, AI, Stripe, etc.)
- Condition nodes
- Visual graph editor
- Configuration panels

### 3. Data & CMS Components

#### DataManager
**Location**: `src/components/designer/DataManager.tsx`
**Purpose**: Collection and item management

**Features**:
- Collection CRUD
- Item CRUD
- Field management
- Data grid view
- Filtering/sorting

#### SchemaDesigner
**Location**: `src/components/designer/Architect/SchemaDesigner.tsx`
**Purpose**: Database schema designer

**Features**:
- Visual schema design
- Table creation
- Relationship management
- Field types
- RLS policies

#### RepeaterRenderer
**Location**: `src/components/designer/RepeaterRenderer.tsx`
**Purpose**: Renders data-bound repeating elements

**Features**:
- Iterates over collection items
- Template element rendering
- Pagination support
- Infinite scroll
- Load more

### 4. Collaboration Components

#### PresenceLayer
**Location**: `src/components/designer/PresenceLayer.tsx`
**Purpose**: Shows other users' cursors and presence

**Features**:
- Cursor rendering
- User avatars
- Name labels
- Selection highlights
- Director mode (follow presenter)

#### CommentsOverlay
**Location**: `src/components/designer/CommentsOverlay.tsx`
**Purpose**: Comment system overlay

**Features**:
- Comment creation
- Comment threads
- Resolve comments
- Element anchoring

#### CursorOverlay
**Location**: `src/components/designer/CursorOverlay.tsx`
**Purpose**: Custom cursor rendering

**Features**:
- Tool cursors
- Selection cursors
- Drag cursors

### 5. AI & Intelligence Components

#### AIAssistantPanel
**Location**: `src/components/designer/AIAssistantPanel.tsx`
**Purpose**: AI-powered layout generation

**Features**:
- Natural language input
- Layout generation
- Component creation
- Integration with GenerativeCore

#### IssuesPanel
**Location**: `src/components/designer/intelligence/IssuesPanel.tsx`
**Purpose**: Design issue detection

**Features**:
- Accessibility issues
- Layout issues
- Consistency issues
- Responsive issues
- Auto-fix suggestions

#### AICopilot
**Location**: `src/components/designer/tools/AICopilot.tsx`
**Purpose**: AI coding assistant

**Features**:
- Code generation
- Refactoring suggestions
- Documentation generation

### 6. Marketplace & Plugins

#### MarketplacePanel
**Location**: `src/components/designer/marketplace/MarketplacePanel.tsx`
**Purpose**: Component/plugin marketplace

**Features**:
- Browse components
- Search/filter
- Purchase components
- Install plugins

#### PluginMarketplace
**Location**: `src/components/designer/marketplace/PluginMarketplace.tsx`
**Purpose**: Plugin discovery and installation

**Features**:
- Plugin browsing
- Installation
- Configuration
- Updates

#### WorkshopPanel
**Location**: `src/components/designer/marketplace/WorkshopPanel.tsx`
**Purpose**: Sell components

**Features**:
- Component publishing
- Pricing setup
- Analytics
- Revenue tracking

#### PluginsPanel
**Location**: `src/components/designer/PluginsPanel.tsx`
**Purpose**: Installed plugins management

**Features**:
- List installed plugins
- Enable/disable
- Configure
- Uninstall

### 7. Deployment & Git

#### DeploymentPanel
**Location**: `src/components/designer/DeploymentPanel.tsx`
**Purpose**: Deployment management

**Features**:
- Vercel integration
- Netlify integration
- Deployment history
- Status monitoring

#### DeploymentModal
**Location**: `src/components/designer/DeploymentModal.tsx`
**Purpose**: Deployment configuration modal

**Features**:
- Provider selection
- Environment selection
- Token management
- Deploy button

#### GitSidebar
**Location**: `src/components/designer/GitSidebar.tsx`
**Purpose**: Git integration UI

**Features**:
- Repository connection
- Branch management
- Commit/push
- Pull/merge
- Status display

#### VersionControlPanel
**Location**: `src/components/designer/VersionControlPanel.tsx`
**Purpose**: Version history

**Features**:
- Version list
- Restore versions
- Compare versions
- Branch visualization

### 8. Design System Components

#### TokenManager
**Location**: `src/components/designer/TokenManager.tsx`
**Purpose**: Design token management

**Features**:
- Token CRUD
- Token types (color, size, font, spacing, radius, shadow)
- Token usage tracking
- Mode support (light/dark)

#### StyleManager
**Location**: `src/components/designer/StyleManager.tsx`
**Purpose**: Global style management

**Features**:
- Class management
- Style inheritance
- Responsive styles
- State styles (hover, active, focus)

#### DesignSystemPanel
**Location**: `src/components/designer/DesignSystemPanel.tsx`
**Purpose**: Design system overview

**Features**:
- Tokens overview
- Classes overview
- Components overview
- Usage statistics

### 9. Controls & Inputs

#### ColorInput
**Location**: `src/components/designer/controls/ColorInput.tsx`
**Purpose**: Color picker

**Features**:
- Hex input
- RGB/HSL sliders
- Palette picker
- Gradient support

#### UnitInput
**Location**: `src/components/designer/controls/UnitInput.tsx`
**Purpose**: Unit-aware number input

**Features**:
- px, %, em, rem, vw, vh units
- Auto unit detection
- Math expressions

#### BoxModelEditor
**Location**: `src/components/designer/controls/BoxModelEditor.tsx`
**Purpose**: Visual box model editor

**Features**:
- Padding editor
- Margin editor
- Border editor
- Visual representation

#### GradientPicker
**Location**: `src/components/designer/controls/GradientPicker.tsx`
**Purpose**: Gradient editor

**Features**:
- Linear/radial gradients
- Color stops
- Angle control
- Preview

#### ShadowEditor
**Location**: `src/components/designer/controls/ShadowEditor.tsx`
**Purpose**: Box shadow editor

**Features**:
- Multiple shadows
- Offset, blur, spread
- Color picker
- Preview

#### FilterEditor
**Location**: `src/components/designer/controls/FilterEditor.tsx`
**Purpose**: CSS filter editor

**Features**:
- Blur, brightness, contrast
- Hue rotation, saturate
- Multiple filters
- Preview

#### StatePanel
**Location**: `src/components/designer/controls/StatePanel.tsx`
**Purpose**: Pseudo-state editor

**Features**:
- Hover styles
- Active styles
- Focus styles
- State preview

#### BreakpointSwitcher
**Location**: `src/components/designer/controls/BreakpointSwitcher.tsx`
**Purpose**: Responsive breakpoint switcher

**Features**:
- Desktop/tablet/mobile toggle
- Custom breakpoints
- Preview mode

#### ClassSelector
**Location**: `src/components/designer/controls/ClassSelector.tsx`
**Purpose**: CSS class selector

**Features**:
- Class dropdown
- Create new class
- Apply/remove classes
- Class preview

#### ClassBreadcrumbs
**Location**: `src/components/designer/controls/ClassBreadcrumbs.tsx`
**Purpose**: Class hierarchy display

**Features**:
- Breadcrumb navigation
- Class inheritance
- Quick navigation

#### PhysicsHUD
**Location**: `src/components/designer/controls/PhysicsHUD.tsx`
**Purpose**: Physics simulation controls

**Features**:
- Enable/disable physics
- Mass, friction, restitution
- Gravity control
- Preview

#### PenTool
**Location**: `src/components/designer/controls/PenTool.tsx`
**Purpose**: Vector path drawing

**Features**:
- Bezier curves
- Path editing
- Anchor points
- Export SVG

#### SelectInput
**Location**: `src/components/designer/controls/SelectInput.tsx`
**Purpose**: Dropdown select

**Features**:
- Options list
- Search
- Multi-select
- Custom rendering

### 10. Interaction & Canvas Components

#### InteractionOverlay
**Location**: `src/components/designer/InteractionOverlay.tsx`
**Purpose**: Interaction event handlers

**Features**:
- Click handlers
- Hover handlers
- Scroll handlers
- Form handlers

#### SmartGuides
**Location**: `src/components/designer/SmartGuides.tsx`
**Purpose**: Alignment guides

**Features**:
- Snap guides
- Alignment lines
- Gap indicators
- Visual feedback

#### MarqueeSelector
**Location**: `src/components/designer/MarqueeSelector.tsx`
**Purpose**: Multi-selection tool

**Features**:
- Rectangle selection
- Multi-element selection
- Selection handles
- Group operations

#### ResizeHandles
**Location**: `src/components/designer/ResizeHandles.tsx`
**Purpose**: Element resize handles

**Features**:
- Corner handles
- Edge handles
- Constrained resizing
- Aspect ratio lock

#### SpacingHandles
**Location**: `src/components/designer/SpacingHandles.tsx`
**Purpose**: Gap/margin visual editor

**Features**:
- Gap handles
- Margin handles
- Visual feedback
- Live preview

#### ContextToolbar
**Location**: `src/components/designer/ContextToolbar.tsx`
**Purpose**: Context-sensitive toolbar

**Features**:
- Dynamic actions
- Quick actions
- Alignment tools
- Distribution tools

#### ContextMenu
**Location**: `src/components/designer/ContextMenu.tsx`
**Purpose**: Right-click context menu

**Features**:
- Context-sensitive actions
- Copy/paste
- Duplicate
- Delete
- Convert to component

#### CommandBar
**Location**: `src/components/designer/CommandBar.tsx`
**Purpose**: Command palette

**Features**:
- Command search
- Keyboard shortcuts
- Quick actions
- Fuzzy search

#### ShortcutManager
**Location**: `src/components/designer/ShortcutManager.tsx`
**Purpose**: Keyboard shortcut management

**Features**:
- Shortcut registration
- Conflict detection
- Custom shortcuts
- Help display

### 11. API & Integration Components

#### APIWorkbench
**Location**: `src/components/designer/APIWorkbench.tsx`
**Purpose**: API testing and management

**Features**:
- Request builder
- Response viewer
- History
- Collections

#### ApiRequestEditor
**Location**: `src/components/designer/api/ApiRequestEditor.tsx`
**Purpose**: API request configuration

**Features**:
- Method selection
- URL input
- Headers editor
- Body editor
- Params editor
- Mock responses

#### WebhookEditor
**Location**: `src/components/designer/logic/WebhookEditor.tsx`
**Purpose**: Webhook configuration

**Features**:
- Webhook creation
- URL generation
- Event filtering
- Payload transformation

#### JsonTree
**Location**: `src/components/designer/api/JsonTree.tsx`
**Purpose**: JSON viewer/editor

**Features**:
- Tree view
- Expand/collapse
- Search
- Edit values

### 12. Serverless & Functions

#### ServerlessPanel
**Location**: `src/components/designer/ServerlessPanel.tsx`
**Purpose**: Serverless function management

**Features**:
- Function list
- Code editor
- Deploy
- Logs
- Environment variables

### 13. Authentication & Security

#### UserAuth
**Location**: `src/components/designer/auth/UserAuth.tsx`
**Purpose**: User authentication UI

**Features**:
- Login form
- Signup form
- Password reset
- OAuth integration

#### AuthSimulator
**Location**: `src/components/designer/auth/AuthSimulator.tsx`
**Purpose**: Auth flow simulation

**Features**:
- User simulation
- Role switching
- Permission testing

#### AuthWall
**Location**: `src/components/designer/membership/AuthWall.tsx`
**Purpose**: Protected content wrapper

**Features**:
- Access control
- Login prompt
- Role-based display

#### EnvironmentManager
**Location**: `src/components/designer/secrets/EnvironmentManager.tsx`
**Purpose**: Environment variable management

**Features**:
- Secret storage
- Environment switching
- Encryption
- Access control

#### UserManagementPanel
**Location**: `src/components/designer/settings/UserManagementPanel.tsx`
**Purpose**: User administration

**Features**:
- User list
- Role management
- Permission assignment
- Invite users

### 14. Analytics & SEO

#### AnalyticsDashboard
**Location**: `src/components/designer/analytics/AnalyticsDashboard.tsx`
**Purpose**: Analytics overview

**Features**:
- Event tracking
- Funnel visualization
- Heatmap
- Conversion metrics

#### AnalyticsOverlay
**Location**: `src/components/designer/analytics/AnalyticsOverlay.tsx`
**Purpose**: Analytics overlay on canvas

**Features**:
- Heatmap overlay
- Click tracking
- Scroll tracking
- Element analytics

#### SEODashboard
**Location**: `src/components/designer/seo/SEODashboard.tsx`
**Purpose**: SEO management

**Features**:
- Meta tags
- Schema markup
- Sitemap
- SEO score

### 15. Localization

#### LocaleManager
**Location**: `src/components/designer/localization/LocaleManager.tsx`
**Purpose**: Locale management

**Features**:
- Add/remove locales
- RTL support
- Default locale
- Locale switching

#### TranslationPanel
**Location**: `src/components/designer/localization/TranslationPanel.tsx`
**Purpose**: Translation editor

**Features**:
- Key-value pairs
- Auto-translation
- Translation status
- Export/import

### 16. Commerce

#### CommerceOverlay
**Location**: `src/components/designer/commerce/CommerceOverlay.tsx`
**Purpose**: E-commerce integration

**Features**:
- Stripe integration
- Product management
- Cart functionality
- Checkout flow

#### UpsellComponent
**Location**: `src/components/designer/commerce/UpsellComponent.tsx`
**Purpose**: Upsell component

**Features**:
- Product display
- Pricing
- Add to cart
- Checkout redirect

#### CustomerDashboard
**Location**: `src/components/designer/membership/CustomerDashboard.tsx`
**Purpose**: Customer portal

**Features**:
- Account management
- Subscription
- Billing
- Downloads

### 17. Mobile Components

#### MobilePreview
**Location**: `src/components/designer/MobilePreview.tsx`
**Purpose**: Mobile device preview

**Features**:
- Device frames
- Responsive preview
- Touch simulation
- Orientation toggle

#### MobileReview
**Location**: `src/components/designer/mobile/MobileReview.tsx`
**Purpose**: Mobile review interface

**Features**:
- Design review
- Comments
- Annotations

#### MobileAnalytics
**Location**: `src/components/designer/mobile/MobileAnalytics.tsx`
**Purpose**: Mobile analytics

**Features**:
- Mobile metrics
- Performance
- User behavior

#### MobileComments
**Location**: `src/components/designer/mobile/MobileComments.tsx`
**Purpose**: Mobile comments

**Features**:
- Comment list
- Thread view
- Reply
- Resolve

### 18. Architect Components (SaaS)

#### SaaSAdminDashboard
**Location**: `src/components/designer/Architect/SaaSAdminDashboard.tsx`
**Purpose**: Multi-tenant admin

**Features**:
- Tenant management
- User management
- Billing overview
- Usage metrics

#### ArchitectConnect
**Location**: `src/components/designer/Architect/ArchitectConnect.tsx`
**Purpose**: External service connections

**Features**:
- Service integration
- API connections
- Webhook setup
- Authentication

#### TableNode
**Location**: `src/components/designer/Architect/TableNode.tsx`
**Purpose**: Database table visualization

**Features**:
- Table schema
- Relationships
- Field types
- Constraints

### 19. Debug & Development

#### LogicDebugger
**Location**: `src/components/designer/debug/LogicDebugger.tsx`
**Purpose**: Logic execution debugger

**Features**:
- Breakpoints
- Step through
- Variable inspection
- Call stack
- Execution speed control

#### DataInspector
**Location**: `src/components/designer/debug/DataInspector.tsx`
**Purpose**: Data inspection tool

**Features**:
- Variable values
- State inspection
- Collection data
- Real-time updates

#### PerformanceHUD
**Location**: `src/components/designer/debug/PerformanceHUD.tsx`
**Purpose**: Performance monitoring

**Features**:
- FPS display
- Render time
- Memory usage
- Component counts

#### ComputedStyleInspector
**Location**: `src/components/designer/debug/ComputedStyleInspector.tsx`
**Purpose**: Computed CSS inspector

**Features**:
- Final computed styles
- Cascade visualization
- Override detection
- Specificity display

#### AuditLogPanel
**Location**: `src/components/designer/debug/AuditLogPanel.tsx`
**Purpose**: Action audit log

**Features**:
- Action history
- User tracking
- Timestamps
- Rollback

### 20. Visual Effects

#### ParallaxSection
**Location**: `src/components/designer/lush/ParallaxSection.tsx`
**Purpose**: Parallax scrolling effect

**Features**:
- Scroll-based animation
- Depth layers
- Speed control
- Smooth transitions

#### RevealImage
**Location**: `src/components/designer/lush/RevealImage.tsx`
**Purpose**: Image reveal animation

**Features**:
- Scroll reveal
- Fade in
- Slide in
- Custom animations

#### Marquee
**Location**: `src/components/designer/lush/Marquee.tsx`
**Purpose**: Infinite scrolling marquee

**Features**:
- Horizontal/vertical
- Speed control
- Pause on hover
- Duplicate content

### 21. Tools

#### NativeBuildTool
**Location**: `src/components/designer/tools/NativeBuildTool.tsx`
**Purpose**: Native app compilation

**Features**:
- Platform selection
- Build configuration
- Export
- Preview

#### FigmaSyncPlugin
**Location**: `src/components/designer/tools/FigmaSyncPlugin.tsx`
**Purpose**: Figma synchronization

**Features**:
- Import from Figma
- Sync changes
- Style mapping
- Component mapping

### 22. Other Components

#### NavigatorMap
**Location**: `src/components/designer/NavigatorMap.tsx`
**Purpose**: Page navigation map

**Features**:
- Page tree
- Navigation flow
- Route visualization

#### MotionTimeline
**Location**: `src/components/designer/MotionTimeline.tsx`
**Purpose**: Animation timeline editor

**Features**:
- Keyframe editing
- Timeline scrubbing
- Easing curves
- Sequence management

#### VariableManager
**Location**: `src/components/designer/VariableManager.tsx`
**Purpose**: Variable management

**Features**:
- Global variables
- Local variables
- Variable binding
- Type checking

#### VariablesPanel
**Location**: `src/components/designer/VariablesPanel.tsx`
**Purpose**: Variable panel UI

**Features**:
- Variable list
- Create/edit
- Usage tracking
- Value preview

#### DependencyManager
**Location**: `src/components/designer/DependencyManager.tsx`
**Purpose**: Dependency management

**Features**:
- NPM packages
- Version management
- Install/remove
- Update checking

#### AssetVault
**Location**: `src/components/designer/AssetVault.tsx`
**Purpose**: Asset library

**Features**:
- Image library
- Video library
- Folder organization
- Search/filter
- Upload
- CDN integration

#### AssetManager
**Location**: `src/components/designer/AssetManager.tsx`
**Purpose**: Asset management (legacy)

**Features**:
- Asset CRUD
- Optimization
- CDN sync

#### HybridImage
**Location**: `src/components/designer/HybridImage.tsx`
**Purpose**: Optimized image component

**Features**:
- Lazy loading
- Responsive images
- Blur placeholder
- CDN optimization

#### CustomCodeBox
**Location**: `src/components/designer/CustomCodeBox.tsx`
**Purpose**: Custom code editor

**Features**:
- Code editor
- Syntax highlighting
- Component code
- Event handlers
- Props definition

#### InspectorOverlay
**Location**: `src/components/designer/InspectorOverlay.tsx`
**Purpose**: Element inspector overlay

**Features**:
- Element info
- Styles display
- Props display
- Quick actions

#### VQAParityPanel
**Location**: `src/components/designer/VQAParityPanel.tsx`
**Purpose**: Visual quality assurance

**Features**:
- Snapshot comparison
- Parity checking
- Drift detection
- Regression testing

#### GlobalCursorManager
**Location**: `src/components/designer/GlobalCursorManager.tsx`
**Purpose**: Global cursor management

**Features**:
- Tool cursors
- Custom cursors
- Cursor themes

#### ModeToggle
**Location**: `src/components/designer/ModeToggle.tsx`
**Purpose**: Mode switcher

**Features**:
- Design/Logic mode
- Preview mode
- Code mode

#### StylesPanel
**Location**: `src/components/designer/StylesPanel.tsx`
**Purpose**: Styles panel (alternative)

**Features**:
- Style editing
- Class management
- Token usage

## Component Patterns

### 1. State Management Pattern
Most components use:
- `useProjectStore()` for global state
- Local `useState` for UI state
- `useEffect` for side effects
- Custom hooks for specific functionality

### 2. Performance Patterns
- `React.memo` for expensive components
- Dynamic imports for code splitting
- Lazy loading for heavy components
- Memoization for computed values

### 3. Integration Patterns
- HyperBridge for Rust engine
- Collaboration hooks for real-time sync
- Data context for data binding
- Runtime context for logic execution

### 4. Styling Patterns
- Glassmorphism design system
- Inline styles (performance)
- CSS variables for theming
- Responsive breakpoints

## Component Dependencies

### Core Dependencies
- `@/hooks/useProjectStore` - State management
- `@/lib/engine/HyperBridge` - Rust engine bridge
- `@/hooks/useCollaboration` - Collaboration
- `@/hooks/useLogicEngine` - Logic execution
- `@/hooks/useSnapping` - Snapping system
- `@/hooks/usePhysicsTransform` - Physics positioning

### UI Dependencies
- `framer-motion` - Animations
- `lucide-react` - Icons
- `@radix-ui/react-popover` - UI primitives
- `@xyflow/react` - Graph editor

### Data Dependencies
- `@/lib/data/CollectionManager` - Data management
- `@/lib/context/DataContext` - Data context
- `@/lib/data/pglite/PGliteContext` - Database

## Component Communication

### Parent-Child Communication
- Props for data flow
- Callbacks for actions
- Context for shared state

### Sibling Communication
- Global state (useProjectStore)
- Event bus (for runtime)
- Collaboration system (Y.js)

### Cross-Module Communication
- HyperBridge for engine
- CollabService for collaboration
- Plugin system for extensions

## Known Issues & Limitations

1. **Large Components**: EditorInterface is 3000+ lines (needs refactoring)
2. **Prop Drilling**: Some deep prop passing (could use context)
3. **Performance**: Some components re-render unnecessarily
4. **Type Safety**: Some `any` types (needs stricter typing)
5. **Code Duplication**: Similar logic in multiple components

## Future Improvements

1. Component splitting (break down large components)
2. Better memoization strategy
3. Virtual scrolling for large lists
4. Improved type safety
5. Component library documentation
6. Storybook integration
7. Unit test coverage
8. Performance profiling

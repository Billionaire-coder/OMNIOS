---
description: A comprehensive "Dogfooding" test to verify Layout, Interaction, and Export features of OMNIOS by building a "Product Landing Page".
---

# OMNIOS Full System Verification Protocol

This workflow allows the Agent to "Dogfood" the OMNIOS system, proving that all implemented features work together in a real-world scenario.

## Phase 1: The "Gravity" Layout Test (Framer1)
1. **Clean Slate**: Initialize a blank project or select a template.
2. **Hero Construction**:
   - Create a main `section` container (Vertical Stack).
   - Add a `header` row (Horizontal Stack).
   - Add 3 text elements ("Home", "Features", "Pricing").
   - **TEST**: Use "Push Logic" to drag "Pricing" to the middle position. Verify displacement.
   - **TEST**: Use "Gap Handles" to visually adjust the spacing between links to `2rem`.
   - **TEST**: Set Layout Mode to "Safety" (Auto-Layout) for the Header, but keep the Main Container in "Freedom" mode to test hybrid nesting.
3. **Responsive Check**:
    - Switch View Mode to `mobile`.
    - Verify that Stacks (Flexbox) behave responsively (e.g. wrapping or stacking vertically if configured).

## Phase 2: The "Smart Animate" Test (Framer2)
4. **Interactive Component Building**:
   - Create a "Feature Card" container.
   - Add an Icon (from Icon Registry) and a Label.
5. **Variant Management**:
   - Select the Card.
   - Open **State Panel**. Create a custom state named `hover`.
   - **Action**: In `hover` state, change Scale to `1.05`, Rotation to `2deg`, and Shadow to `xl`.
   - **Verification**: Ensure the "Diff" is correctly stored and visible in the UI.
6. **Physics Integration**:
   - Open **Properties Panel**.
   - **TEST**: Set Physics Preset to `Snappy` (Stiffness: 400).
   - **TEST**: Toggle Preview Mode. Hover over the card. Verify the spring animation is smooth and organic.

## Phase 3: The "Magic Motion" Test (Framer2 - Phase 3)
7. **Cross-Page Setup**:
   - Create a new page called `details`.
   - Copy the "Feature Card" from Home.
   - Paste it into `details`.
   - **Action**: On `details` page, resize the card to be Full Width (Hero style).
8. **Transition Logic**:
   - Select the Card on Home. Enable **MAGIC MOTION** toggle in Properties Panel.
   - Select the Card on Details. Enable **MAGIC MOTION** toggle.
   - Ensure IDs match (or are manually linked if we implemented that, otherwise rely on ID persistence).
9. **Navigation Verification**:
   - In DOM, ensure `layoutId` is present on both elements.
   - **TEST**: In Preview Mode, trigger a navigation from Home to Details using the Page Switcher or a Link Action.
   - **Verification**: Verify the Card *morphs* into the Hero banner smoothly.

## Phase 4: Commerce & Advanced Logic (If Implemented)
10. **Commerce Check**:
    - Add a "Pay Button" or "Add to Cart" button (if available).
    - **TEST**: Click the button in Preview Mode. Does the Cart Drawer open? Does the Item count increase?
11. **Icon Registry Check**:
    - Verify that complex icons (e.g. `Lock`, `CreditCard`) render correctly without errors.

## Phase 5: The "Senior Export" Test (Framer1 - Phase 3)
12. **Code Generation**:
   - Click "Export Code".
13. **Quality Audit**:
    - **Check**: Are Semantic Tags used? (`<header>`, `<nav>`, `<section>` vs `<div>`).
    - **Check**: is Tailwind/CSS generation clean?
    - **Check**: Are the `framer-motion` variants correctly exported in the code?
    - **Check**: Is the code structure modular and readable?

## Executive Summary
After running this protocol, produce a `dogfood_report.md` summarizing the "Feel" of the tool.
- Did the drag-and-drop feel heavy or smooth?
- Did the physics feel native?
- Was the code production-ready?

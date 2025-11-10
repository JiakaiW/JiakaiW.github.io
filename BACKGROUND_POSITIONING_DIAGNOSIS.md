# Background Positioning Diagnosis: Glass Effect Update Magnitude Issue

## Problem Statement

Glass containers update their background position when scrolling, but the **magnitude of the update is far smaller than the magnitude of scrolling**. This causes the glass effect to appear "stuck" or lagging behind the scroll position.

## What We've Tried

### 1. Changed `background-attachment: fixed` → `scroll`

**Rationale**: With `fixed` attachment, `background-position` is relative to the viewport, not the element. This caused incorrect positioning when elements were partially outside the viewport.

**Result**: Background positioning improved, but update magnitude issue persists.

**Code Location**: `glass-edge-distortion.js` line 437

### 2. Fixed Variable Scoping Issues

**Problem**: Variables like `sourceX`, `sourceY`, `alphaX`, `alphaY`, `headroomLeft`, etc. were only defined in certain code paths, causing `ReferenceError`.

**Fix**: Declared all variables at function scope before conditional blocks.

**Result**: Errors fixed, but update magnitude issue persists.

**Code Location**: `glass-edge-distortion.js` lines 684-698

### 3. Improved Visibility Check

**Problem**: Large elements (like intro-container) stopped updating when their edges extended far beyond viewport.

**Fix**: Added `isPartiallyVisible` check that always updates elements with any visible portion, regardless of how far edges extend.

**Result**: Elements now update when partially visible, but update magnitude issue persists.

**Code Location**: `glass-edge-distortion.js` lines 902-924

### 4. Attempted Document Coordinates

**Attempt**: Used document coordinates (`elementRect.left + scrollX`) instead of viewport coordinates, thinking that with scroll attachment, document coordinates would be more appropriate.

**Result**: **Broke updates entirely** - containers stopped updating because document coordinates don't change on scroll.

**Reverted**: Back to viewport coordinates with scroll offset added for background mapping.

**Code Location**: `glass-edge-distortion.js` lines 649-669

### 5. Current Implementation

**Current Approach**:
```javascript
// Viewport coordinates (change on scroll, trigger updates)
const x_obj = elementRect.left + elementRect.width / 2;
const y_obj = elementRect.top + elementRect.height / 2;

// Convert to document coordinates for background mapping
const elementDocX = x_obj + scrollX;
const elementDocY = y_obj + scrollY;

// Map to background image coordinates
const x_bg = elementDocX + offsetX;
const y_bg = elementDocY + offsetY;

// Calculate background position
finalSourceX = bgLeft; // or calculated from center
finalSourceY = bgTop;

// Set CSS
wrapper.style.backgroundPosition = `${-finalSourceX}px ${-finalSourceY}px`;
```

**Result**: Updates happen, but magnitude is too small.

## Current Calculation Logic

### Viewport Cache (`updateViewportCache()`)

Calculates how background image covers viewport:
- `coverScale = max(viewportWidth / imgWidth, viewportHeight / imgHeight)`
- `scaledWidth = imgWidth * coverScale`
- `scaledHeight = imgHeight * coverScale`
- `offsetX = (scaledWidth - viewportWidth) / 2` (centering offset)
- `offsetY = (scaledHeight - viewportHeight) / 2`

**Key Point**: Offsets are calculated for **viewport coverage**, not document coverage.

### Background Position Calculation

For `.doc-content` elements (simplified 1:1 mapping):
```javascript
const elementDocLeft = elementRect.left + scrollX;
const elementDocTop = elementRect.top + scrollY;
const bgLeft = elementDocLeft + offsetX;
const bgTop = elementDocTop + offsetY;
finalSourceX = bgLeft;
finalSourceY = bgTop;
```

For other elements (with magnification):
```javascript
const x_bg = (x_obj + scrollX) + offsetX;
const y_bg = (y_obj + scrollY) + offsetY;
// ... complex calculation with alpha/magnification ...
finalSourceX = x_bg - sampledWidth / 2;
finalSourceY = y_bg - sampledHeight / 2;
```

## Hypotheses

### Hypothesis 1: `offsetX/Y` Are Viewport-Based, Not Document-Based

**Problem**: `offsetX` and `offsetY` are calculated assuming the background covers the **viewport** with `cover` sizing. But with `background-attachment: scroll`, each element has its own background that should cover the **document** (or at least a larger region).

**Evidence**: 
- Offsets are calculated as `(scaledWidth - viewportWidth) / 2`
- This assumes viewport-sized coverage
- With scroll attachment, background might need document-sized coverage

**Potential Fix**: Recalculate offsets based on document dimensions, or remove offsets entirely if they're not needed for scroll attachment.

### Hypothesis 2: `background-size` Is Wrong for Scroll Attachment

**Problem**: We set `background-size: ${scaledWidth}px ${scaledHeight}px` where `scaledWidth/Height` are calculated for viewport coverage. With scroll attachment, the background should cover a larger region (the document).

**Evidence**:
- `scaledWidth` and `scaledHeight` are viewport-based
- With scroll attachment, background might need to be document-sized

**Potential Fix**: Calculate `scaledWidth/Height` based on document dimensions instead of viewport dimensions.

### Hypothesis 3: Double-Counting Scroll Offset

**Problem**: We're adding `scrollX/Y` to viewport coordinates to get document coordinates, then adding `offsetX/Y`. But `offsetX/Y` might already account for some positioning, causing a mismatch.

**Evidence**:
- `offsetX = (scaledWidth - viewportWidth) / 2` represents centering offset
- We add this to document coordinates, but it's calculated for viewport

**Potential Fix**: Recalculate offsets without scroll, or use a different offset calculation for scroll attachment.

### Hypothesis 4: `background-position` Interpretation Is Wrong

**Problem**: With `background-attachment: scroll`, `background-position` is relative to the **element's padding box**, not the viewport or document. Our calculation might be using the wrong reference frame.

**Evidence**:
- CSS spec: `background-position` with `scroll` is relative to element
- We're calculating positions as if they're absolute in document space

**Potential Fix**: Calculate `background-position` relative to the element's position, accounting for how the background image should be positioned within the element.

### Hypothesis 5: Update Frequency vs. Calculation Accuracy

**Problem**: Updates are happening, but the calculation itself might be correct - the issue could be that we're not updating frequently enough, or there's a mismatch between when we calculate and when CSS applies.

**Evidence**:
- Updates happen (magnitude is just wrong)
- Position check uses 1px threshold
- Updates are batched in RAF

**Potential Fix**: Verify calculation is correct, check if CSS is applying correctly, ensure updates happen every frame.

## Root Cause Analysis

### The Core Issue

With `background-attachment: scroll`:
1. Background scrolls **with the element** automatically
2. `background-position` is relative to the **element**, not viewport/document
3. We want to show the part of background that corresponds to element's **document position**

### The Mismatch

We're calculating:
- Element's document position: `(elementRect.left + scrollX, elementRect.top + scrollY)`
- Background image coordinate: `(docX + offsetX, docY + offsetY)`
- CSS position: `background-position: -bgX -bgY`

But with scroll attachment:
- The background **already scrolls** with the element
- So `background-position` should account for this automatic scrolling
- We might need to **subtract** the scroll offset, not add it

### The Real Question

**What should `background-position` represent with scroll attachment?**

Option A: "Show background image starting at pixel (X, Y) of the image, positioned relative to element"
- This is what we're doing now
- But the magnitude is wrong

Option B: "Offset the background by (X, Y) relative to where it would naturally be"
- With scroll attachment, background naturally scrolls with element
- We need to offset it to show the "correct" part
- This offset might need to account for the automatic scroll

## Recommended Next Steps

1. **Enable debug logging** to see actual values:
   - `elementDocX/Y` vs `scrollX/Y`
   - `finalSourceX/Y` values
   - Actual CSS `background-position` values
   - How these change on scroll

2. **Test Hypothesis 4**: Verify how `background-position` works with scroll attachment
   - Create a simple test case
   - Verify if position is relative to element or document

3. **Consider Alternative Approach**: 
   - Maybe we don't need to add scroll offset at all
   - With scroll attachment, background naturally shows the "right" part
   - We might only need to adjust for the initial positioning

4. **Check CSS Spec**: Verify exact behavior of `background-attachment: scroll` with `background-position`

5. **Test with Fixed Attachment**: Temporarily switch back to `fixed` to see if the calculation works correctly there (even if positioning is wrong), which would confirm the issue is scroll-attachment-specific.

## Code Locations

- Viewport cache calculation: `glass-edge-distortion.js` lines 63-105
- Background position calculation: `glass-edge-distortion.js` lines 649-803
- Update trigger: `glass-edge-distortion.js` lines 1070-1090
- Visibility check: `glass-edge-distortion.js` lines 899-924


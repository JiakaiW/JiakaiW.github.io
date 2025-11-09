<!-- 4b9b66c5-afe1-4435-af1a-ac558e79aeda 0558521f-062f-4647-8902-ba990aa1ffde -->
# Fix Edge Distortion Visibility

## Problem Analysis

The current implementation has the Convex Squircle function and displacement map generation, but the distortion effect is not visible enough. Issues identified:

1. **Displacement magnitude may be too weak**: The Convex Squircle function generates normalized values (0-1), but the actual displacement in pixels may not be strong enough
2. **Scale values may need adjustment**: Current scale of 15.0 might not be sufficient if the displacement map values are too small
3. **Blur may be masking distortion**: 20px blur applied before displacement might be too strong
4. **Displacement direction verification**: Need to ensure inward displacement (correct for convex glass) is being applied correctly

## Solution Strategy

### 1. Enhance Displacement Magnitude Calculation

**File: `assets/js/glass-displacement-generator.js`**

- Increase the multiplier in `calculateDisplacementMagnitude()` to ensure stronger displacement at edges
- Verify the Convex Squircle function is generating appropriate values at the bezel edges
- Ensure displacement magnitude reaches near maximum (close to 1.0) at the outermost edges
- Add debug logging to verify displacement values are being generated correctly

### 2. Optimize Displacement Map Generation

**File: `assets/js/glass-displacement-generator.js`**

- Verify the displacement map is using the full range (0-255) effectively
- Ensure edge regions (distanceFromEdge close to 0) generate maximum displacement
- Check that the direction vectors are correctly normalized and pointing inward
- Consider increasing the bezel width parameter if needed for more visible effect

### 3. Adjust SVG Filter Pipeline

**File: `assets/js/glass-svg-filter.js`**

- Reduce blur amount (from 20px to 10-15px) to prevent masking the distortion
- Increase base scale further if needed (from 15.0 to 20-30)
- Verify the filter pipeline order: blur → displacement → saturation
- Consider removing or reducing saturation boost if it's affecting visibility

### 4. Increase Scale Values

**File: `assets/js/glass-edge-distortion.js`**

- Increase initial filter scale from 15.0 to 25.0-30.0
- Increase base scale in scroll updates from 15.0 to 25.0-30.0
- Increase edge scale multiplier for stronger edge effects
- Ensure scale values are high enough to make displacement clearly visible

### 5. Add Debug Visualization

**Temporary debugging:**

- Add console logging to show displacement map statistics (min/max/avg displacement values)
- Log the actual scale values being applied
- Verify displacement map image data is being generated correctly
- Add visual debugging option to render displacement map as overlay (optional)

### 6. Verify Physics-Based Approach

**Ensure Convex Squircle is working correctly:**

- Verify the surface function: `y = (1 - (1-x)^4)^(1/4)` is correct
- Check that surface normal calculation (derivative) is accurate
- Ensure Snell's Law approximation is producing appropriate displacement magnitudes
- Verify displacement direction matches physics (inward for convex glass)

## Implementation Steps

1. **Increase displacement magnitude** in `calculateDisplacementMagnitude()` - increase multiplier from 1.5 to 2.5-3.0
2. **Reduce blur** in SVG filter from 20px to 12-15px
3. **Increase scale values** - base scale to 25.0-30.0, edge multipliers proportionally
4. **Add debug logging** to verify displacement map values are in expected ranges
5. **Test visibility** - distortion should be clearly visible at glass element edges
6. **Fine-tune** - adjust values based on visual feedback

## Success Criteria

- Distortion effect is clearly visible at glass element edges
- Effect updates smoothly on scroll
- Physics-based approach (Convex Squircle) is maintained
- Performance remains acceptable (60fps during scroll)
- Effect works in Chrome/Edge (Firefox fallback already implemented)

## Files to Modify

1. `assets/js/glass-displacement-generator.js` - Increase displacement magnitude calculation
2. `assets/js/glass-svg-filter.js` - Reduce blur, verify filter pipeline
3. `assets/js/glass-edge-distortion.js` - Increase scale values
4. Add temporary debug logging (can be removed after verification)

### To-dos

- [ ] Include the new JavaScript file in default.html layout
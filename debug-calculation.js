/**
 * Debug Calculation Test
 * Simulates the background position calculation to find the bug
 */

// Simulate viewport and background dimensions
const viewportWidth = 1920;
const viewportHeight = 1080;
const bgImageWidth = 3000;
const bgImageHeight = 2000;

// Calculate cover scale (same as updateViewportCache)
const coverScale = Math.max(viewportWidth / bgImageWidth, viewportHeight / bgImageHeight);
const scaledWidth = bgImageWidth * coverScale;
const scaledHeight = bgImageHeight * coverScale;
const offsetX = (scaledWidth - viewportWidth) / 2;
const offsetY = (scaledHeight - viewportHeight) / 2;

console.log('Background Scaling:');
console.log(`  Cover Scale: ${coverScale.toFixed(3)}`);
console.log(`  Scaled Size: ${scaledWidth.toFixed(0)} x ${scaledHeight.toFixed(0)}`);
console.log(`  Offset: (${offsetX.toFixed(0)}, ${offsetY.toFixed(0)})\n`);

// Simulate element at different scroll positions
function calculateBackgroundPosition(elementViewportY, scrollY) {
    // Current calculation (WRONG)
    const elementDocY = elementViewportY + scrollY;
    const bgTop = elementDocY + offsetY;
    const finalSourceY = bgTop;
    
    return {
        elementViewportY,
        scrollY,
        elementDocY,
        bgTop,
        finalSourceY,
        backgroundPosition: -finalSourceY
    };
}

console.log('=== Current Calculation (with scroll offset) ===\n');

// Initial position: element at viewport y=1000, scroll=0
const state1 = calculateBackgroundPosition(1000, 0);
console.log('State 1 (scroll=0, element viewport y=1000):');
console.log(`  elementDocY: ${state1.elementDocY}`);
console.log(`  bgTop: ${state1.bgTop.toFixed(0)}`);
console.log(`  background-position: ${state1.backgroundPosition.toFixed(0)}px\n`);

// After scrolling 100px: element now at viewport y=900, scroll=100
const state2 = calculateBackgroundPosition(900, 100);
console.log('State 2 (scroll=100, element viewport y=900):');
console.log(`  elementDocY: ${state2.elementDocY}`);
console.log(`  bgTop: ${state2.bgTop.toFixed(0)}`);
console.log(`  background-position: ${state2.backgroundPosition.toFixed(0)}px\n`);

const deltaY = state2.backgroundPosition - state1.backgroundPosition;
console.log(`Change in background-position: ${deltaY.toFixed(0)}px`);
console.log(`Scroll delta: 100px`);
console.log(`Ratio: ${(deltaY / 100).toFixed(3)} (should be ~1.0)\n`);

console.log('=== Problem Identified ===');
console.log('With scroll attachment, the background scrolls WITH the element.');
console.log('So when element moves from viewport y=1000 to y=900 (delta=-100),');
console.log('the background also moves -100px automatically.');
console.log('But we\'re calculating based on document position which doesn\'t change much!\n');

console.log('=== Correct Calculation (without scroll offset) ===\n');

function calculateBackgroundPositionCorrect(elementViewportY, scrollY) {
    // With scroll attachment, background scrolls with element
    // So we should use viewport coordinates directly (or subtract scroll, not add)
    // The background image should be positioned to show the part corresponding to viewport position
    const bgTop = elementViewportY + offsetY;
    const finalSourceY = bgTop;
    
    return {
        elementViewportY,
        scrollY,
        bgTop,
        finalSourceY,
        backgroundPosition: -finalSourceY
    };
}

const state1Correct = calculateBackgroundPositionCorrect(1000, 0);
const state2Correct = calculateBackgroundPositionCorrect(900, 100);

console.log('State 1 Correct:');
console.log(`  background-position: ${state1Correct.backgroundPosition.toFixed(0)}px`);
console.log('State 2 Correct:');
console.log(`  background-position: ${state2Correct.backgroundPosition.toFixed(0)}px`);

const deltaYCorrect = state2Correct.backgroundPosition - state1Correct.backgroundPosition;
console.log(`\nChange in background-position: ${deltaYCorrect.toFixed(0)}px`);
console.log(`Scroll delta: 100px`);
console.log(`Ratio: ${(deltaYCorrect / 100).toFixed(3)} ✅ (should be ~1.0)\n`);

console.log('=== Solution ===');
console.log('Remove scroll offset from calculation for scroll attachment!');
console.log('Use viewport coordinates directly: bgTop = elementViewportY + offsetY');


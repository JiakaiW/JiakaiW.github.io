/**
 * Test if lastRect is blocking updates when element is partially outside viewport
 */

function testLastRectBlocking() {
    console.log('🔍 Testing lastRect Blocking Issue\n');
    console.log('═══════════════════════════════════════════════════════\n');
    
    const viewportHeight = 1080;
    let lastRect = null;
    
    // Simulate element moving from inside viewport to partially outside
    const testCases = [
        { top: 500, desc: 'Fully inside' },
        { top: 100, desc: 'Near top' },
        { top: 0, desc: 'At viewport top' },
        { top: -50, desc: 'Top slightly outside (BUG ZONE)' },
        { top: -100, desc: 'Top further outside' },
        { top: -150, desc: 'Top more outside' },
        { top: -200, desc: 'Top far outside' }
    ];
    
    testCases.forEach((testCase, idx) => {
        const rect = { top: testCase.top, bottom: testCase.top + 400, left: 100 };
        
        // Replicate exact logic from updateElement
        const isPartiallyVisible = rect.bottom > 0 && rect.top < viewportHeight;
        
        const positionChanged = !lastRect || 
            isPartiallyVisible ||
            Math.abs(rect.left - lastRect.left) > 1.0 || 
            Math.abs(rect.top - lastRect.top) > 1.0;
        
        console.log(`${idx + 1}. ${testCase.desc} (top: ${testCase.top}px):`);
        console.log(`   rect.top: ${rect.top}, rect.bottom: ${rect.bottom}`);
        console.log(`   isPartiallyVisible: ${isPartiallyVisible}`);
        console.log(`   lastRect: ${lastRect ? `{top: ${lastRect.top}}` : 'null'}`);
        
        if (lastRect) {
            const topDelta = Math.abs(rect.top - lastRect.top);
            console.log(`   Top delta: ${topDelta.toFixed(1)}px`);
            console.log(`   Delta > 1px: ${topDelta > 1.0}`);
        }
        
        console.log(`   positionChanged: ${positionChanged}`);
        
        if (positionChanged) {
            console.log(`   ✅ Would update`);
            lastRect = { left: rect.left, top: rect.top };
        } else {
            console.log(`   ❌ Would NOT update (BLOCKED BY lastRect!)`);
        }
        console.log('');
    });
    
    // Test: What if we scroll slowly (small changes)?
    console.log('═══════════════════════════════════════════════════════');
    console.log('Testing Slow Scroll (Small Position Changes)\n');
    
    lastRect = { left: 100, top: -50 };
    const slowScrollCases = [
        { top: -50.5, desc: 'Move 0.5px' },
        { top: -51, desc: 'Move 1px' },
        { top: -51.5, desc: 'Move 1.5px' },
        { top: -52, desc: 'Move 2px' }
    ];
    
    slowScrollCases.forEach((testCase, idx) => {
        const rect = { top: testCase.top, bottom: testCase.top + 400, left: 100 };
        const isPartiallyVisible = rect.bottom > 0 && rect.top < viewportHeight;
        const positionChanged = !lastRect || 
            isPartiallyVisible ||
            Math.abs(rect.left - lastRect.left) > 1.0 || 
            Math.abs(rect.top - lastRect.top) > 1.0;
        
        console.log(`${idx + 1}. ${testCase.desc}:`);
        console.log(`   rect.top: ${rect.top}`);
        console.log(`   isPartiallyVisible: ${isPartiallyVisible}`);
        console.log(`   Top delta: ${Math.abs(rect.top - lastRect.top).toFixed(1)}px`);
        console.log(`   positionChanged: ${positionChanged}`);
        console.log(`   ${positionChanged ? '✅ Would update' : '❌ Would NOT update'}\n`);
        
        if (positionChanged) {
            lastRect = { left: rect.left, top: rect.top };
        }
    });
    
    // Test: What if element is partially visible but position change is exactly 1px?
    console.log('═══════════════════════════════════════════════════════');
    console.log('Testing Edge Case: Exactly 1px Change\n');
    
    lastRect = { left: 100, top: -50 };
    const rect = { top: -51, bottom: 349, left: 100 }; // Exactly 1px change
    const isPartiallyVisible = rect.bottom > 0 && rect.top < viewportHeight;
    const positionChanged = !lastRect || 
        isPartiallyVisible ||
        Math.abs(rect.left - lastRect.left) > 1.0 || 
        Math.abs(rect.top - lastRect.top) > 1.0;
    
    console.log(`rect.top: ${rect.top}, lastRect.top: ${lastRect.top}`);
    console.log(`Top delta: ${Math.abs(rect.top - lastRect.top)}px`);
    console.log(`Delta > 1.0: ${Math.abs(rect.top - lastRect.top) > 1.0}`);
    console.log(`isPartiallyVisible: ${isPartiallyVisible}`);
    console.log(`positionChanged: ${positionChanged}`);
    console.log(`${positionChanged ? '✅ Would update' : '❌ Would NOT update'}\n`);
    
    // The issue: if delta is exactly 1.0, it's NOT > 1.0, so it might not update!
    // But isPartiallyVisible should force it... unless there's a logic error
}

testLastRectBlocking();


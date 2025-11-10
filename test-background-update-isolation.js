/**
 * Isolated Unit Test for Background Position Updates
 * Tests the specific issue: element stops updating when top border is outside viewport
 * 
 * Run: node test-background-update-isolation.js
 */

// Mock the glass-edge-distortion module logic
class MockGlassEdgeDistortion {
    constructor() {
        this.elements = new Map();
        this.viewportCache = {
            width: 1920,
            height: 1080,
            scaledWidth: 1920,
            scaledHeight: 1280,
            offsetX: 0,
            offsetY: 100,
            dirty: false
        };
    }
    
    updateViewportCache() {
        // Mock implementation
    }
    
    updateWrapperBackgroundPosition(element, wrapper, elementRect) {
        // Mock - just track what would be calculated
        const offsetX = this.viewportCache.offsetX;
        const offsetY = this.viewportCache.offsetY;
        
        const bgTop = elementRect.top + offsetY;
        const finalSourceY = bgTop;
        
        return {
            elementRectTop: elementRect.top,
            offsetY,
            bgTop,
            finalSourceY,
            backgroundPosition: -finalSourceY
        };
    }
    
    updateElement(element, scrollY, rect) {
        const elementData = this.elements.get(element) || {};
        
        if (!elementData.filterWrapper) {
            return null; // No wrapper, can't update
        }
        
        const lastRect = elementData._lastElementRect;
        
        // Replicate the actual logic from glass-edge-distortion.js
        const isPartiallyVisible = rect.bottom > 0 && rect.top < window.innerHeight;
        
        const positionChanged = !lastRect || 
            isPartiallyVisible || // Force update for partially visible elements
            Math.abs(rect.left - lastRect.left) > 1.0 || 
            Math.abs(rect.top - lastRect.top) > 1.0;
        
        if (positionChanged) {
            // Simulate update
            const bgPos = this.updateWrapperBackgroundPosition(element, elementData.filterWrapper, rect);
            elementData._lastElementRect = { left: rect.left, top: rect.top };
            return bgPos;
        }
        
        return null; // No update needed
    }
    
    updateAllElements() {
        const scrollY = 0; // Mock
        const viewportHeight = this.viewportCache.height;
        const viewportWidth = this.viewportCache.width;
        
        const results = [];
        
        this.elements.forEach((elementData, element) => {
            const rect = element.getBoundingClientRect();
            
            // Replicate visibility check
            const isPartiallyVisible = rect.bottom > 0 && rect.top < viewportHeight;
            const margin = 200;
            const isNearViewport = rect.bottom >= -margin && 
                                 rect.top <= viewportHeight + margin &&
                                 rect.right >= -margin &&
                                 rect.left <= viewportWidth + margin;
            
            if (isPartiallyVisible || isNearViewport) {
                const bgUpdate = this.updateElement(element, scrollY, rect);
                results.push({
                    element: element.id || element.className,
                    rect,
                    isPartiallyVisible,
                    isNearViewport,
                    bgUpdateReturned: !!bgUpdate,
                    bgUpdate
                });
            }
        });
        
        return results;
    }
}

// Mock element with getBoundingClientRect
function createMockElement(id, initialTop, height = 400) {
    let top = initialTop;
    const width = 800;
    
    return {
        id,
        className: id,
        getBoundingClientRect() {
            return {
                left: 100,
                top: top,
                right: 100 + width,
                bottom: top + height,
                width: width,
                height: height
            };
        },
        setTop(newTop) {
            top = newTop;
        },
        getTop() {
            return top;
        }
    };
}

// Test scenarios
function runTests() {
    console.log('🧪 Running Isolated Unit Tests for Background Position Updates\n');
    console.log('═══════════════════════════════════════════════════════\n');
    
    const mock = new MockGlassEdgeDistortion();
    const viewportHeight = 1080;
    
    // Create test element
    const element = createMockElement('intro-container', 1000);
    mock.elements.set(element, {
        filterWrapper: {}, // Mock wrapper exists
        _lastElementRect: null
    });
    
    // Mock window.innerHeight
    global.window = { innerHeight: viewportHeight };
    
    let testCount = 0;
    let passCount = 0;
    let failCount = 0;
    
    // Test 1: Element fully in viewport
    console.log('Test 1: Element fully in viewport');
    element.setTop(500);
    const result1 = mock.updateElement(element, 0, element.getBoundingClientRect());
    testCount++;
    if (result1) {
        console.log('  ✅ PASS: Update returned');
        passCount++;
    } else {
        console.log('  ❌ FAIL: No update returned');
        failCount++;
    }
    console.log(`  Background Position: ${result1?.backgroundPosition.toFixed(0)}px\n`);
    
    // Test 2: Element top border at viewport top (top = 0)
    console.log('Test 2: Element top border at viewport top (top = 0)');
    element.setTop(0);
    mock.elements.get(element)._lastElementRect = { left: 100, top: 500 }; // Previous position
    const result2 = mock.updateElement(element, 0, element.getBoundingClientRect());
    testCount++;
    if (result2) {
        console.log('  ✅ PASS: Update returned');
        passCount++;
    } else {
        console.log('  ❌ FAIL: No update returned');
        failCount++;
    }
    console.log(`  Background Position: ${result2?.backgroundPosition.toFixed(0)}px\n`);
    
    // Test 3: Element top border slightly outside viewport (top = -50, bottom = 350)
    console.log('Test 3: Element top border slightly outside viewport (top = -50, bottom = 350)');
    element.setTop(-50);
    mock.elements.get(element)._lastElementRect = { left: 100, top: 0 }; // Previous position
    const rect3 = element.getBoundingClientRect();
    const isPartiallyVisible3 = rect3.bottom > 0 && rect3.top < viewportHeight;
    console.log(`  rect.top: ${rect3.top}, rect.bottom: ${rect3.bottom}`);
    console.log(`  isPartiallyVisible: ${isPartiallyVisible3}`);
    const result3 = mock.updateElement(element, 0, rect3);
    testCount++;
    if (result3) {
        console.log('  ✅ PASS: Update returned');
        passCount++;
    } else {
        console.log('  ❌ FAIL: No update returned (THIS IS THE BUG!)');
        failCount++;
    }
    console.log(`  Background Position: ${result3?.backgroundPosition.toFixed(0)}px\n`);
    
    // Test 4: Element top border far outside viewport (top = -200, bottom = 200)
    console.log('Test 4: Element top border far outside viewport (top = -200, bottom = 200)');
    element.setTop(-200);
    mock.elements.get(element)._lastElementRect = { left: 100, top: -50 }; // Previous position
    const rect4 = element.getBoundingClientRect();
    const isPartiallyVisible4 = rect4.bottom > 0 && rect4.top < viewportHeight;
    console.log(`  rect.top: ${rect4.top}, rect.bottom: ${rect4.bottom}`);
    console.log(`  isPartiallyVisible: ${isPartiallyVisible4}`);
    const result4 = mock.updateElement(element, 0, rect4);
    testCount++;
    if (result4) {
        console.log('  ✅ PASS: Update returned');
        passCount++;
    } else {
        console.log('  ❌ FAIL: No update returned');
        failCount++;
    }
    console.log(`  Background Position: ${result4?.backgroundPosition.toFixed(0)}px\n`);
    
    // Test 5: Simulate scrolling - element moves from top=500 to top=-50
    console.log('Test 5: Simulate scrolling - element moves from top=500 to top=-50');
    element.setTop(500);
    mock.elements.get(element)._lastElementRect = null;
    const result5a = mock.updateElement(element, 0, element.getBoundingClientRect());
    console.log(`  Initial position (top=500): Update=${!!result5a}, bgPos=${result5a?.backgroundPosition.toFixed(0)}px`);
    
    element.setTop(-50);
    const result5b = mock.updateElement(element, 550, element.getBoundingClientRect());
    testCount++;
    if (result5b) {
        console.log(`  After scroll (top=-50): Update=${!!result5b}, bgPos=${result5b?.backgroundPosition.toFixed(0)}px`);
        const delta = result5b.backgroundPosition - result5a.backgroundPosition;
        console.log(`  Position delta: ${delta.toFixed(0)}px (should be ~550px)`);
        if (Math.abs(delta - 550) < 10) {
            console.log('  ✅ PASS: Position updates correctly');
            passCount++;
        } else {
            console.log(`  ❌ FAIL: Position delta incorrect (expected ~550px, got ${delta.toFixed(0)}px)`);
            failCount++;
        }
    } else {
        console.log('  ❌ FAIL: No update returned after scroll');
        failCount++;
    }
    console.log('');
    
    // Test 6: Check visibility logic directly
    console.log('Test 6: Visibility logic check');
    const testCases = [
        { top: 500, bottom: 900, desc: 'Fully visible' },
        { top: 0, bottom: 400, desc: 'Top at viewport edge' },
        { top: -50, bottom: 350, desc: 'Top slightly outside' },
        { top: -200, bottom: 200, desc: 'Top far outside, bottom visible' },
        { top: -500, bottom: -100, desc: 'Fully above viewport' },
        { top: 1200, bottom: 1600, desc: 'Fully below viewport' }
    ];
    
    testCases.forEach((testCase, idx) => {
        const isPartiallyVisible = testCase.bottom > 0 && testCase.top < viewportHeight;
        const margin = 200;
        const isNearViewport = testCase.bottom >= -margin && 
                             testCase.top <= viewportHeight + margin;
        const shouldUpdate = isPartiallyVisible || isNearViewport;
        
        console.log(`  Case ${idx + 1} (${testCase.desc}):`);
        console.log(`    top=${testCase.top}, bottom=${testCase.bottom}`);
        console.log(`    isPartiallyVisible=${isPartiallyVisible}, isNearViewport=${isNearViewport}`);
        console.log(`    shouldUpdate=${shouldUpdate}`);
        
        // Create element at this position
        element.setTop(testCase.top);
        const rect = element.getBoundingClientRect();
        const result = mock.updateElement(element, 0, rect);
        const actuallyUpdated = !!result;
        
        if (shouldUpdate === actuallyUpdated) {
            console.log(`    ✅ PASS: Update behavior matches expectation\n`);
            passCount++;
        } else {
            console.log(`    ❌ FAIL: Expected update=${shouldUpdate}, got update=${actuallyUpdated}\n`);
            failCount++;
        }
        testCount++;
    });
    
    // Summary
    console.log('═══════════════════════════════════════════════════════');
    console.log('                    TEST SUMMARY');
    console.log('═══════════════════════════════════════════════════════\n');
    console.log(`Total Tests: ${testCount}`);
    console.log(`Passed: ${passCount} ✅`);
    console.log(`Failed: ${failCount} ${failCount > 0 ? '❌' : ''}\n`);
    
    if (failCount === 0) {
        console.log('🎉 All tests passed!');
        return 0;
    } else {
        console.log('⚠️  Some tests failed. Review the output above.');
        return 1;
    }
}

// Run tests
if (require.main === module) {
    const exitCode = runTests();
    process.exit(exitCode);
}

module.exports = { runTests };


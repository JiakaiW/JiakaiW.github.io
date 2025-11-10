/**
 * Test Full Flow - Simulates complete updateAllElements flow
 */

function testFullFlow() {
    console.log('🔄 Testing Full updateAllElements Flow\n');
    console.log('═══════════════════════════════════════════════════════\n');
    
    const viewportHeight = 1080;
    const viewportWidth = 1920;
    const elements = new Map();
    const bgPositionUpdates = [];
    
    function createElement(id, top) {
        return {
            id,
            className: id,
            getBoundingClientRect() {
                return { left: 100, top: top, right: 900, bottom: top + 400, width: 800, height: 400 };
            }
        };
    }
    
    // Simulate updateAllElements logic
    function updateAllElements(element, elementTop) {
        const rect = { left: 100, top: elementTop, right: 900, bottom: elementTop + 400, width: 800, height: 400 };
        
        // Visibility check from updateAllElements
        const isPartiallyVisible = rect.bottom > 0 && rect.top < viewportHeight;
        const margin = 200;
        const isNearViewport = rect.bottom >= -margin && 
                             rect.top <= viewportHeight + margin &&
                             rect.right >= -margin &&
                             rect.left <= viewportWidth + margin;
        
        const willUpdate = isPartiallyVisible || isNearViewport;
        
        return {
            rect,
            isPartiallyVisible,
            isNearViewport,
            willUpdate
        };
    }
    
    // Test sequence: element moves from inside to partially outside
    const positions = [
        { top: 500, desc: 'Fully inside' },
        { top: 200, desc: 'Near top' },
        { top: 0, desc: 'At viewport top' },
        { top: -50, desc: 'Top slightly outside (BUG REPORTED HERE)' },
        { top: -100, desc: 'Top further outside' },
        { top: -150, desc: 'Top more outside' },
        { top: -200, desc: 'Top far outside' },
        { top: -250, desc: 'Top very far outside (bottom still visible)' },
        { top: -300, desc: 'Top extremely far (bottom barely visible)' }
    ];
    
    console.log('Testing visibility check in updateAllElements:\n');
    
    positions.forEach((pos, idx) => {
        const result = updateAllElements(null, pos.top);
        
        console.log(`${idx + 1}. ${pos.desc} (top: ${pos.top}px):`);
        console.log(`   rect.top: ${result.rect.top}, rect.bottom: ${result.rect.bottom}`);
        console.log(`   isPartiallyVisible: ${result.isPartiallyVisible} (bottom > 0: ${result.rect.bottom > 0}, top < viewportHeight: ${result.rect.top < viewportHeight})`);
        console.log(`   isNearViewport: ${result.isNearViewport}`);
        console.log(`   willUpdate: ${result.willUpdate}`);
        
        if (!result.willUpdate && result.rect.bottom > 0) {
            console.log(`   ⚠️  PROBLEM: Element is visible but won't update!`);
        }
        console.log('');
    });
    
    // Check edge cases
    console.log('═══════════════════════════════════════════════════════');
    console.log('Testing Edge Cases\n');
    
    const edgeCases = [
        { top: -1, bottom: 399, desc: 'Top exactly at -1px' },
        { top: 0, bottom: 400, desc: 'Top exactly at 0px' },
        { top: -0.5, bottom: 399.5, desc: 'Top at -0.5px' },
        { top: viewportHeight - 400, bottom: viewportHeight, desc: 'Bottom exactly at viewportHeight' },
        { top: viewportHeight - 399, bottom: viewportHeight + 1, desc: 'Bottom 1px outside' }
    ];
    
    edgeCases.forEach((testCase, idx) => {
        const rect = { top: testCase.top, bottom: testCase.bottom, left: 100, right: 900 };
        const isPartiallyVisible = rect.bottom > 0 && rect.top < viewportHeight;
        const margin = 200;
        const isNearViewport = rect.bottom >= -margin && 
                             rect.top <= viewportHeight + margin;
        const willUpdate = isPartiallyVisible || isNearViewport;
        
        console.log(`${idx + 1}. ${testCase.desc}:`);
        console.log(`   rect.top: ${rect.top}, rect.bottom: ${rect.bottom}`);
        console.log(`   bottom > 0: ${rect.bottom > 0}, top < ${viewportHeight}: ${rect.top < viewportHeight}`);
        console.log(`   isPartiallyVisible: ${isPartiallyVisible}`);
        console.log(`   isNearViewport: ${isNearViewport}`);
        console.log(`   willUpdate: ${willUpdate}`);
        console.log('');
    });
}

testFullFlow();


/**
 * Test Cached Rect Issue
 * Simulates the problem where cached rect might be stale when RAF executes
 */

class MockSystem {
    constructor() {
        this.elements = new Map();
        this.rafCallbacks = [];
        this.executedUpdates = [];
    }
    
    // Simulate requestAnimationFrame
    requestAnimationFrame(callback) {
        this.rafCallbacks.push(callback);
    }
    
    // Execute all pending RAF callbacks
    flushRAF() {
        const callbacks = [...this.rafCallbacks];
        this.rafCallbacks = [];
        callbacks.forEach(cb => cb());
    }
    
    updateElement(element, scrollY, rect) {
        const elementData = this.elements.get(element);
        if (!elementData || !elementData.filterWrapper) {
            return null;
        }
        
        const lastRect = elementData._lastElementRect;
        const isPartiallyVisible = rect.bottom > 0 && rect.top < 1080;
        
        const positionChanged = !lastRect || 
            isPartiallyVisible ||
            Math.abs(rect.left - lastRect.left) > 1.0 || 
            Math.abs(rect.top - lastRect.top) > 1.0;
        
        if (positionChanged) {
            // CRITICAL: Capture rect at this moment (like real code)
            const capturedRect = { ...rect };
            
            return () => {
                // This executes later via RAF - rect might be stale!
                const currentRect = element.getBoundingClientRect();
                this.executedUpdates.push({
                    capturedTop: capturedRect.top,
                    currentTop: currentRect.top,
                    lastRectTop: lastRect?.top,
                    match: Math.abs(capturedRect.top - currentRect.top) < 1
                });
                
                // Update lastRect with CAPTURED rect (like real code)
                elementData._lastElementRect = { left: capturedRect.left, top: capturedRect.top };
            };
        }
        
        return null;
    }
    
    updateAllElements() {
        const bgPositionUpdates = [];
        const viewportHeight = 1080;
        
        this.elements.forEach((elementData, element) => {
            const rect = element.getBoundingClientRect();
            
            const isPartiallyVisible = rect.bottom > 0 && rect.top < viewportHeight;
            const margin = 200;
            const isNearViewport = rect.bottom >= -margin && 
                                 rect.top <= viewportHeight + margin;
            
            if (isPartiallyVisible || isNearViewport) {
                const bgUpdate = this.updateElement(element, 0, rect);
                if (bgUpdate) {
                    bgPositionUpdates.push(bgUpdate);
                }
            }
        });
        
        if (bgPositionUpdates.length > 0) {
            this.requestAnimationFrame(() => {
                bgPositionUpdates.forEach(update => update());
            });
        }
    }
}

function createMockElement(id, initialTop) {
    let top = initialTop;
    return {
        id,
        getBoundingClientRect() {
            return { left: 100, top: top, right: 900, bottom: top + 400, width: 800, height: 400 };
        },
        setTop(newTop) { top = newTop; }
    };
}

function testRapidScrolling() {
    console.log('🚀 Testing Rapid Scrolling with Cached Rect\n');
    console.log('═══════════════════════════════════════════════════════\n');
    
    const system = new MockSystem();
    const element = createMockElement('intro-container', 1000);
    system.elements.set(element, { filterWrapper: {}, _lastElementRect: null });
    
    // Simulate rapid scrolling: element moves from 1000 to -200 in 5 steps
    const steps = [
        { top: 1000, desc: 'Initial' },
        { top: 700, desc: 'Scroll 300px' },
        { top: 400, desc: 'Scroll 600px' },
        { top: 100, desc: 'Scroll 900px' },
        { top: -50, desc: 'Top outside (BUG ZONE)' },
        { top: -100, desc: 'Top further outside' },
        { top: -200, desc: 'Top far outside' }
    ];
    
    console.log('Simulating rapid scroll sequence:\n');
    
    steps.forEach((step, idx) => {
        element.setTop(step.top);
        system.executedUpdates = [];
        
        // Call updateAllElements (captures rect)
        system.updateAllElements();
        
        // BEFORE flushing RAF - check what was captured
        const elementData = system.elements.get(element);
        console.log(`${idx + 1}. ${step.desc} (element top: ${step.top}px):`);
        console.log(`   Captured rect.top: ${step.top}px`);
        console.log(`   Updates queued: ${system.rafCallbacks.length}`);
        
        // Now flush RAF (simulates next frame)
        // BUT - what if element moved again before RAF executed?
        // Simulate: element continues scrolling
        if (idx < steps.length - 1) {
            const nextTop = steps[idx + 1].top;
            element.setTop(nextTop); // Element moved BEFORE RAF executed!
            console.log(`   ⚠️  Element moved to ${nextTop}px BEFORE RAF executed`);
        }
        
        system.flushRAF();
        
        const update = system.executedUpdates[0];
        if (update) {
            console.log(`   Executed update:`);
            console.log(`     Captured top: ${update.capturedTop}px`);
            console.log(`     Current top: ${update.currentTop}px`);
            console.log(`     LastRect top: ${update.lastRectTop || 'null'}`);
            console.log(`     Match: ${update.match ? '✅' : '❌ STALE RECT!'}`);
            
            if (!update.match) {
                console.log(`     ⚠️  PROBLEM: Using stale rect! Captured=${update.capturedTop}, Current=${update.currentTop}`);
            }
        } else {
            console.log(`   ❌ No update executed!`);
        }
        console.log('');
    });
    
    // Check final state
    const finalData = system.elements.get(element);
    console.log('Final state:');
    console.log(`  Element top: ${element.getBoundingClientRect().top}px`);
    console.log(`  LastRect top: ${finalData._lastElementRect?.top || 'null'}`);
    console.log(`  Match: ${Math.abs(element.getBoundingClientRect().top - (finalData._lastElementRect?.top || 0)) < 1 ? '✅' : '❌'}\n`);
    
    // Test: What happens if we call updateAllElements again?
    console.log('Testing: Call updateAllElements again (should update if position changed)...');
    system.updateAllElements();
    console.log(`  RAF callbacks queued: ${system.rafCallbacks.length}`);
    system.flushRAF();
    const finalUpdate = system.executedUpdates[0];
    if (finalUpdate) {
        console.log(`  ✅ Update executed`);
    } else {
        console.log(`  ❌ No update - position might be considered unchanged`);
        console.log(`     This could be the bug - lastRect might be preventing updates!`);
    }
}

testRapidScrolling();


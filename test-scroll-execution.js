/**
 * Test Scroll Execution and Update Batching
 * Simulates actual scroll behavior to find why updates stop
 */

class MockUpdateSystem {
    constructor() {
        this.elements = new Map();
        this.bgPositionUpdates = [];
        this.updateCallCount = 0;
        this.executedUpdates = [];
    }
    
    updateElement(element, scrollY, rect) {
        this.updateCallCount++;
        const elementData = this.elements.get(element);
        
        if (!elementData || !elementData.filterWrapper) {
            return null;
        }
        
        const lastRect = elementData._lastElementRect;
        const isPartiallyVisible = rect.bottom > 0 && rect.top < 1080; // Mock viewport height
        
        const positionChanged = !lastRect || 
            isPartiallyVisible ||
            Math.abs(rect.left - lastRect.left) > 1.0 || 
            Math.abs(rect.top - lastRect.top) > 1.0;
        
        if (positionChanged) {
            const bgPos = {
                elementRectTop: rect.top,
                backgroundPosition: -(rect.top + 100) // Mock calculation
            };
            
            // Return update function (like real code)
            return () => {
                this.executedUpdates.push({
                    element: element.id,
                    rectTop: rect.top,
                    bgPos: bgPos.backgroundPosition,
                    timestamp: Date.now()
                });
                elementData._lastElementRect = { left: rect.left, top: rect.top };
            };
        }
        
        return null;
    }
    
    updateAllElements() {
        this.bgPositionUpdates = [];
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
                    this.bgPositionUpdates.push(bgUpdate);
                }
            }
        });
        
        // Simulate RAF batching
        if (this.bgPositionUpdates.length > 0) {
            // Execute updates (simulating RAF)
            this.bgPositionUpdates.forEach(update => update());
        }
    }
}

function createMockElement(id, initialTop, height = 400) {
    let top = initialTop;
    return {
        id,
        className: id,
        getBoundingClientRect() {
            return {
                left: 100,
                top: top,
                right: 900,
                bottom: top + height,
                width: 800,
                height: height
            };
        },
        setTop(newTop) {
            top = newTop;
        }
    };
}

function simulateScrollSequence() {
    console.log('🔄 Simulating Scroll Sequence\n');
    console.log('═══════════════════════════════════════════════════════\n');
    
    const system = new MockUpdateSystem();
    const element = createMockElement('intro-container', 1000);
    
    system.elements.set(element, {
        filterWrapper: {},
        _lastElementRect: null
    });
    
    const positions = [
        { scroll: 0, elementTop: 1000, desc: 'Initial position' },
        { scroll: 100, elementTop: 900, desc: 'Scrolled 100px' },
        { scroll: 200, elementTop: 800, desc: 'Scrolled 200px' },
        { scroll: 300, elementTop: 700, desc: 'Scrolled 300px' },
        { scroll: 400, elementTop: 600, desc: 'Scrolled 400px' },
        { scroll: 500, elementTop: 500, desc: 'Scrolled 500px' },
        { scroll: 600, elementTop: 400, desc: 'Scrolled 600px' },
        { scroll: 700, elementTop: 300, desc: 'Scrolled 700px' },
        { scroll: 800, elementTop: 200, desc: 'Scrolled 800px' },
        { scroll: 900, elementTop: 100, desc: 'Scrolled 900px' },
        { scroll: 1000, elementTop: 0, desc: 'Top at viewport edge' },
        { scroll: 1050, elementTop: -50, desc: 'Top slightly outside (BUG SHOULD APPEAR HERE)' },
        { scroll: 1100, elementTop: -100, desc: 'Top further outside' },
        { scroll: 1200, elementTop: -200, desc: 'Top far outside' }
    ];
    
    let previousBgPos = null;
    let failures = [];
    
    positions.forEach((pos, idx) => {
        element.setTop(pos.elementTop);
        system.executedUpdates = []; // Clear previous
        system.updateAllElements();
        
        const update = system.executedUpdates.find(u => u.element === 'intro-container');
        const bgPos = update ? update.bgPos : null;
        const updated = !!update;
        
        const delta = previousBgPos !== null && bgPos !== null ? bgPos - previousBgPos : null;
        const expectedDelta = idx > 0 ? positions[idx].elementTop - positions[idx-1].elementTop : null;
        
        const status = updated ? '✅' : '❌';
        console.log(`${status} ${pos.desc}:`);
        console.log(`   Element top: ${pos.elementTop}px`);
        console.log(`   Updated: ${updated}`);
        console.log(`   Background Position: ${bgPos !== null ? bgPos.toFixed(0) : 'N/A'}px`);
        if (delta !== null) {
            console.log(`   Position Delta: ${delta.toFixed(0)}px (expected: ${expectedDelta}px)`);
            if (Math.abs(delta - expectedDelta) > 1) {
                console.log(`   ⚠️  Delta mismatch!`);
                failures.push({ position: pos, delta, expectedDelta });
            }
        }
        console.log('');
        
        previousBgPos = bgPos;
    });
    
    console.log('═══════════════════════════════════════════════════════');
    console.log('                    ANALYSIS');
    console.log('═══════════════════════════════════════════════════════\n');
    
    if (failures.length === 0) {
        console.log('✅ All positions updated correctly');
    } else {
        console.log(`❌ Found ${failures.length} positions where updates failed:`);
        failures.forEach(f => {
            console.log(`   - ${f.position.desc}: delta=${f.delta.toFixed(0)}px, expected=${f.expectedDelta}px`);
        });
    }
    
    console.log(`\nTotal update calls: ${system.updateCallCount}`);
    console.log(`Total executed updates: ${system.executedUpdates.length}`);
    
    return failures.length === 0 ? 0 : 1;
}

// Run simulation
if (require.main === module) {
    const exitCode = simulateScrollSequence();
    process.exit(exitCode);
}

module.exports = { simulateScrollSequence };


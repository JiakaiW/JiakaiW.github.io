/**
 * Automated Test Harness for Background Positioning
 * Tests glass effect background positioning with scroll attachment
 */

(function() {
    'use strict';
    
    const testResults = [];
    const outputDiv = document.getElementById('testOutput');
    
    function log(message, data = {}) {
        const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
        console.log(`[${timestamp}] ${message}`, data);
        
        const logEntry = document.createElement('div');
        logEntry.className = 'test-item';
        logEntry.innerHTML = `<strong>${message}</strong><br><pre class="value">${JSON.stringify(data, null, 2)}</pre>`;
        outputDiv.appendChild(logEntry);
        outputDiv.scrollTop = outputDiv.scrollHeight;
    }
    
    function getBackgroundPosition(element) {
        // Find the wrapper div with background
        const wrapper = element.querySelector('.glass-svg-filter-background');
        if (!wrapper) {
            return null;
        }
        
        const computedStyle = window.getComputedStyle(wrapper);
        const bgPosition = computedStyle.backgroundPosition;
        
        // Parse "x y" format (e.g., "-100px -200px")
        const match = bgPosition.match(/(-?\d+(?:\.\d+)?)px\s+(-?\d+(?:\.\d+)?)px/);
        if (match) {
            return {
                x: parseFloat(match[1]),
                y: parseFloat(match[2]),
                raw: bgPosition
            };
        }
        
        return { x: 0, y: 0, raw: bgPosition };
    }
    
    function getElementData(element) {
        const glassEdgeDistortion = window.glassEdgeDistortion;
        if (!glassEdgeDistortion) {
            return null;
        }
        
        return glassEdgeDistortion.elements.get(element);
    }
    
    function calculateExpectedPosition(element, scrollY, scrollX = 0) {
        const rect = element.getBoundingClientRect();
        const glassEdgeDistortion = window.glassEdgeDistortion;
        
        if (!glassEdgeDistortion) {
            return null;
        }
        
        const viewportCache = glassEdgeDistortion.viewportCache;
        
        if (!viewportCache || !viewportCache.offsetX) {
            // Cache might not be initialized yet
            glassEdgeDistortion.updateViewportCache();
        }
        const offsetX = viewportCache.offsetX || 0;
        const offsetY = viewportCache.offsetY || 0;
        
        // Replicate the calculation from updateWrapperBackgroundPosition
        const elementDocLeft = rect.left + scrollX;
        const elementDocTop = rect.top + scrollY;
        const bgLeft = elementDocLeft + offsetX;
        const bgTop = elementDocTop + offsetY;
        
        return {
            x: -bgLeft,
            y: -bgTop,
            elementDocLeft,
            elementDocTop,
            bgLeft,
            bgTop,
            offsetX,
            offsetY
        };
    }
    
    function measureCurrentState(element, scrollY, scrollX = 0) {
        const rect = element.getBoundingClientRect();
        const actualBgPos = getBackgroundPosition(element);
        const expectedBgPos = calculateExpectedPosition(element, scrollY, scrollX);
        const elementData = getElementData(element);
        
        return {
            scrollY,
            scrollX,
            elementRect: {
                left: rect.left,
                top: rect.top,
                width: rect.width,
                height: rect.height
            },
            actualBackgroundPosition: actualBgPos,
            expectedBackgroundPosition: expectedBgPos,
            elementData: elementData ? {
                hasFilterWrapper: !!elementData.filterWrapper,
                filterId: elementData.filterId,
                lastBgPos: elementData._lastBgPos
            } : null,
            viewportCache: glassEdgeDistortion.viewportCache
        };
    }
    
    async function scrollAndMeasure(element, deltaY, deltaX = 0) {
        const beforeState = measureCurrentState(element, window.scrollY, window.scrollX);
        
        // Scroll
        window.scrollBy(deltaX, deltaY);
        
        // Wait for scroll to complete and glass effect to update
        await new Promise(resolve => {
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    resolve();
                });
            });
        });
        
        // Additional wait for glass effect updates
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const afterState = measureCurrentState(element, window.scrollY, window.scrollX);
        
        const actualBgPos = afterState.actualBackgroundPosition;
        const expectedBgPos = afterState.expectedBackgroundPosition;
        const beforeActualBgPos = beforeState.actualBackgroundPosition;
        const beforeExpectedBgPos = beforeState.expectedBackgroundPosition;
        
        return {
            before: beforeState,
            after: afterState,
            scrollDelta: { x: deltaX, y: deltaY },
            backgroundPositionDelta: actualBgPos && beforeActualBgPos ? {
                x: actualBgPos.x - beforeActualBgPos.x,
                y: actualBgPos.y - beforeActualBgPos.y
            } : null,
            expectedBackgroundPositionDelta: expectedBgPos && beforeExpectedBgPos ? {
                x: expectedBgPos.x - beforeExpectedBgPos.x,
                y: expectedBgPos.y - beforeExpectedBgPos.y
            } : null
        };
    }
    
    async function runTestSuite() {
        const element = document.getElementById('testElement');
        let glassEdgeDistortion = window.glassEdgeDistortion;
        
        if (!element) {
            log('ERROR: Test element not found', {});
            return;
        }
        
        // Wait for glass effect to be available
        let retries = 0;
        while (!glassEdgeDistortion && retries < 10) {
            await new Promise(resolve => setTimeout(resolve, 200));
            glassEdgeDistortion = window.glassEdgeDistortion;
            retries++;
        }
        
        if (!glassEdgeDistortion) {
            log('ERROR: Glass edge distortion not initialized after waiting', {
                retries,
                windowKeys: Object.keys(window).filter(k => k.includes('glass'))
            });
            return;
        }
        
        // Ensure viewport cache is initialized
        if (glassEdgeDistortion.updateViewportCache) {
            glassEdgeDistortion.updateViewportCache();
        }
        
        // Ensure element is tracked
        if (!glassEdgeDistortion.elements.has(element)) {
            log('Adding element to glass effect tracking...', {});
            glassEdgeDistortion.addElement(element);
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Check if element was added
            if (!glassEdgeDistortion.elements.has(element)) {
                log('WARNING: Element was not added to tracking. Checking element size...', {
                    width: element.getBoundingClientRect().width,
                    height: element.getBoundingClientRect().height
                });
                // Try again
                glassEdgeDistortion.addElement(element);
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }
        
        log('=== Starting Test Suite ===', {});
        
        // Test 1: Initial position
        log('Test 1: Initial Position', {});
        window.scrollTo(0, 0);
        await new Promise(resolve => setTimeout(resolve, 200));
        const initialState = measureCurrentState(element, window.scrollY, window.scrollX);
        log('Initial State', initialState);
        testResults.push({ test: 'Initial Position', state: initialState });
        
        // Test 2: Scroll down 100px
        log('Test 2: Scroll Down 100px', {});
        const test2 = await scrollAndMeasure(element, 100, 0);
        log('Scroll 100px Results', test2);
        
        if (test2.backgroundPositionDelta) {
            const ratioY = test2.backgroundPositionDelta.y / test2.scrollDelta.y;
            const ratioX = test2.backgroundPositionDelta.x / test2.scrollDelta.x;
            log('Magnitude Ratio', {
                scrollDelta: test2.scrollDelta.y,
                bgPosDelta: test2.backgroundPositionDelta.y,
                ratio: ratioY.toFixed(3),
                expectedRatio: 1.0,
                match: Math.abs(ratioY - 1.0) < 0.1 ? 'PASS' : 'FAIL'
            });
            testResults.push({
                test: 'Scroll 100px',
                ratio: ratioY,
                pass: Math.abs(ratioY - 1.0) < 0.1,
                ...test2
            });
        }
        
        // Test 3: Scroll down 500px total
        log('Test 3: Scroll Down Additional 400px (500px total)', {});
        const test3 = await scrollAndMeasure(element, 400, 0);
        log('Scroll 400px More Results', test3);
        
        if (test3.backgroundPositionDelta) {
            const ratioY = test3.backgroundPositionDelta.y / test3.scrollDelta.y;
            log('Magnitude Ratio', {
                scrollDelta: test3.scrollDelta.y,
                bgPosDelta: test3.backgroundPositionDelta.y,
                ratio: ratioY.toFixed(3),
                expectedRatio: 1.0,
                match: Math.abs(ratioY - 1.0) < 0.1 ? 'PASS' : 'FAIL'
            });
            testResults.push({
                test: 'Scroll 400px More',
                ratio: ratioY,
                pass: Math.abs(ratioY - 1.0) < 0.1,
                ...test3
            });
        }
        
        // Test 4: Scroll back up 300px
        log('Test 4: Scroll Back Up 300px', {});
        const test4 = await scrollAndMeasure(element, -300, 0);
        log('Scroll Up 300px Results', test4);
        
        if (test4.backgroundPositionDelta) {
            const ratioY = test4.backgroundPositionDelta.y / Math.abs(test4.scrollDelta.y);
            log('Magnitude Ratio (Up)', {
                scrollDelta: test4.scrollDelta.y,
                bgPosDelta: test4.backgroundPositionDelta.y,
                ratio: ratioY.toFixed(3),
                expectedRatio: 1.0,
                match: Math.abs(ratioY - 1.0) < 0.1 ? 'PASS' : 'FAIL'
            });
            testResults.push({
                test: 'Scroll Up 300px',
                ratio: ratioY,
                pass: Math.abs(ratioY - 1.0) < 0.1,
                ...test4
            });
        }
        
        // Test 5: Element partially outside viewport (scroll to top)
        log('Test 5: Scroll to Top (Element Partially Outside)', {});
        window.scrollTo(0, 0);
        await new Promise(resolve => setTimeout(resolve, 200));
        const test5Before = measureCurrentState(element, window.scrollY, window.scrollX);
        log('Before Scroll (Top)', test5Before);
        
        window.scrollTo(0, 200);
        await new Promise(resolve => {
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    setTimeout(resolve, 100);
                });
            });
        });
        const test5After = measureCurrentState(element, window.scrollY, window.scrollX);
        log('After Scroll 200px (Element Partially Outside)', test5After);
        
        if (test5Before.actualBackgroundPosition && test5After.actualBackgroundPosition) {
            const deltaY = test5After.actualBackgroundPosition.y - test5Before.actualBackgroundPosition.y;
            const ratioY = deltaY / 200;
            log('Magnitude Ratio (Partial Viewport)', {
                scrollDelta: 200,
                bgPosDelta: deltaY,
                ratio: ratioY.toFixed(3),
                expectedRatio: 1.0,
                match: Math.abs(ratioY - 1.0) < 0.1 ? 'PASS' : 'FAIL'
            });
            testResults.push({
                test: 'Partial Viewport',
                ratio: ratioY,
                pass: Math.abs(ratioY - 1.0) < 0.1,
                before: test5Before,
                after: test5After
            });
        }
        
        // Generate final report
        generateReport();
    }
    
    function generateReport() {
        log('=== Test Suite Complete ===', {});
        
        const report = {
            timestamp: new Date().toISOString(),
            totalTests: testResults.length,
            passedTests: testResults.filter(t => t.pass !== false).length,
            failedTests: testResults.filter(t => t.pass === false).length,
            results: testResults,
            summary: testResults.map(t => ({
                test: t.test,
                ratio: t.ratio,
                pass: t.pass,
                scrollDelta: t.scrollDelta?.y,
                bgPosDelta: t.backgroundPositionDelta?.y
            }))
        };
        
        log('Final Report', report);
        
        // Output to console as JSON (on a single line for easier parsing)
        console.log('=== TEST REPORT (JSON) ===');
        console.log(JSON.stringify(report));
        
        // Also store in window for programmatic access
        window.testReport = report;
        
        // Update UI
        const summaryDiv = document.createElement('div');
        summaryDiv.className = 'test-item';
        summaryDiv.innerHTML = `
            <h3>Summary</h3>
            <p>Total Tests: ${report.totalTests}</p>
            <p>Passed: <span style="color: #0f0">${report.passedTests}</span></p>
            <p>Failed: <span style="color: #f00">${report.failedTests}</span></p>
            <p>Average Ratio: ${(testResults.filter(t => t.ratio).reduce((sum, t) => sum + Math.abs(t.ratio), 0) / testResults.filter(t => t.ratio).length).toFixed(3)}</p>
        `;
        outputDiv.appendChild(summaryDiv);
    }
    
    // Export function to run tests
    window.runBackgroundPositioningTests = runTestSuite;
    
    // Auto-run if DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(runTestSuite, 2000);
        });
    } else {
        setTimeout(runTestSuite, 2000);
    }
})();


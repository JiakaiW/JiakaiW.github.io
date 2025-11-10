/**
 * Automated Browser Test for Background Positioning
 * Uses Puppeteer to run tests in a headless browser
 * 
 * Install dependencies:
 *   npm install puppeteer
 * 
 * Run:
 *   node test-background-positioning-automated.js
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function runAutomatedTests() {
    console.log('🚀 Starting automated background positioning tests...\n');
    
    const browser = await puppeteer.launch({
        headless: 'new', // Use new headless mode
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });
    
    try {
        const page = await browser.newPage();
        
        // Set viewport size
        await page.setViewport({ width: 1920, height: 1080 });
        
        // Get the absolute path to the test HTML file
        const testHtmlPath = path.resolve(__dirname, 'test-background-positioning.html');
        const testHtmlUrl = `file://${testHtmlPath}`;
        
        console.log(`📄 Loading test page: ${testHtmlUrl}`);
        await page.goto(testHtmlUrl, { waitUntil: 'networkidle0', timeout: 30000 });
        
        // Wait for the test suite to complete
        console.log('⏳ Waiting for tests to complete...\n');
        
        // Capture console messages, especially JSON reports
        const consoleMessages = [];
        let jsonReport = null;
        
        page.on('console', msg => {
            const text = msg.text();
            consoleMessages.push(text);
            
            // Try to extract JSON report
            if (text.includes('TEST REPORT') && text.includes('{')) {
                try {
                    // Extract JSON from console message
                    const jsonMatch = text.match(/\{[\s\S]*\}/);
                    if (jsonMatch) {
                        jsonReport = JSON.parse(jsonMatch[0]);
                    }
                } catch (e) {
                    // Not valid JSON, continue
                }
            }
            
            if (text.includes('TEST REPORT') || text.includes('Test Suite') || text.includes('ERROR') || text.includes('WARNING')) {
                console.log(`[Browser] ${text}`);
            }
        });
        
        // Wait for test completion by checking for the summary div
        await page.waitForFunction(() => {
            const output = document.getElementById('testOutput');
            if (!output) return false;
            const summary = output.querySelector('h3');
            return summary && summary.textContent.includes('Summary');
        }, { timeout: 60000 });
        
        // Extract test results
        console.log('\n📊 Extracting test results...\n');
        
        const results = await page.evaluate(() => {
            const output = document.getElementById('testOutput');
            const testItems = Array.from(output.querySelectorAll('.test-item'));
            
            const results = {
                summary: {},
                tests: [],
                consoleLogs: []
            };
            
            // Extract summary
            const summaryDiv = testItems.find(item => item.querySelector('h3'));
            if (summaryDiv) {
                const summaryText = summaryDiv.textContent;
                const totalMatch = summaryText.match(/Total Tests: (\d+)/);
                const passedMatch = summaryText.match(/Passed:.*?(\d+)/);
                const failedMatch = summaryText.match(/Failed:.*?(\d+)/);
                const ratioMatch = summaryText.match(/Average Ratio: ([\d.]+)/);
                
                results.summary = {
                    totalTests: totalMatch ? parseInt(totalMatch[1]) : 0,
                    passed: passedMatch ? parseInt(passedMatch[1]) : 0,
                    failed: failedMatch ? parseInt(failedMatch[1]) : 0,
                    averageRatio: ratioMatch ? parseFloat(ratioMatch[1]) : null
                };
            }
            
            // Extract individual test results
            testItems.forEach(item => {
                const text = item.textContent;
                if (text.includes('Test') && (text.includes('Scroll') || text.includes('Position'))) {
                    const testNameMatch = text.match(/Test \d+: (.+?)(?:\n|$)/);
                    const ratioMatch = text.match(/ratio[:\s]+([\d.]+)/i);
                    const scrollMatch = text.match(/scrollDelta[:\s]+(-?\d+)/i);
                    const bgPosMatch = text.match(/bgPosDelta[:\s]+(-?\d+)/i);
                    
                    if (testNameMatch) {
                        results.tests.push({
                            name: testNameMatch[1],
                            ratio: ratioMatch ? parseFloat(ratioMatch[1]) : null,
                            scrollDelta: scrollMatch ? parseInt(scrollMatch[1]) : null,
                            bgPosDelta: bgPosMatch ? parseInt(bgPosMatch[1]) : null,
                            rawText: text
                        });
                    }
                }
            });
            
            return results;
        });
        
        // Use JSON report from console if available, otherwise use extracted results
        if (jsonReport) {
            console.log('📋 Using JSON report from console\n');
            Object.assign(results, jsonReport);
        }
        
        // Print results
        console.log('═══════════════════════════════════════════════════════');
        console.log('                    TEST RESULTS');
        console.log('═══════════════════════════════════════════════════════\n');
        
        if (results.summary) {
            console.log('Summary:');
            console.log(`  Total Tests: ${results.summary.totalTests}`);
            console.log(`  Passed: ${results.summary.passed} ✅`);
            console.log(`  Failed: ${results.summary.failed} ${results.summary.failed > 0 ? '❌' : ''}`);
            if (results.summary.averageRatio !== null) {
                console.log(`  Average Ratio: ${results.summary.averageRatio.toFixed(3)}`);
                console.log(`  Expected Ratio: 1.000 (for 1:1 mapping)`);
                const deviation = Math.abs(results.summary.averageRatio - 1.0);
                console.log(`  Deviation: ${deviation.toFixed(3)} ${deviation < 0.1 ? '✅' : '❌'}`);
            }
            console.log('');
        }
        
        if (results.tests.length > 0) {
            console.log('Individual Tests:');
            results.tests.forEach((test, index) => {
                console.log(`\n  ${index + 1}. ${test.name}`);
                if (test.ratio !== null) {
                    const pass = Math.abs(test.ratio - 1.0) < 0.1;
                    console.log(`     Ratio: ${test.ratio.toFixed(3)} ${pass ? '✅' : '❌'}`);
                    console.log(`     Scroll Delta: ${test.scrollDelta}px`);
                    console.log(`     Background Position Delta: ${test.bgPosDelta}px`);
                    if (test.scrollDelta && test.bgPosDelta) {
                        const actualRatio = test.bgPosDelta / test.scrollDelta;
                        console.log(`     Actual Ratio: ${actualRatio.toFixed(3)}`);
                    }
                }
            });
        }
        
        // Save results to file
        const resultsFile = path.resolve(__dirname, 'test-results.json');
        fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2));
        console.log(`\n💾 Results saved to: ${resultsFile}`);
        
        // Take a screenshot
        const screenshotPath = path.resolve(__dirname, 'test-screenshot.png');
        await page.screenshot({ path: screenshotPath, fullPage: true });
        console.log(`📸 Screenshot saved to: ${screenshotPath}`);
        
        // Determine exit code
        const allTestsPassed = results.summary && results.summary.failed === 0;
        const ratioAcceptable = results.summary && results.summary.averageRatio !== null && 
                                 Math.abs(results.summary.averageRatio - 1.0) < 0.1;
        
        console.log('\n═══════════════════════════════════════════════════════');
        if (allTestsPassed && ratioAcceptable) {
            console.log('                    ✅ ALL TESTS PASSED');
            console.log('═══════════════════════════════════════════════════════\n');
            return 0;
        } else {
            console.log('                    ❌ SOME TESTS FAILED');
            console.log('═══════════════════════════════════════════════════════\n');
            return 1;
        }
        
    } catch (error) {
        console.error('❌ Error running tests:', error);
        return 1;
    } finally {
        await browser.close();
    }
}

// Run if executed directly
if (require.main === module) {
    runAutomatedTests()
        .then(exitCode => {
            process.exit(exitCode);
        })
        .catch(error => {
            console.error('Fatal error:', error);
            process.exit(1);
        });
}

module.exports = { runAutomatedTests };


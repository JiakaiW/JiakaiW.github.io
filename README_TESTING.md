# Automated Background Positioning Tests

This directory contains automated tests for the glass effect background positioning system.

## Setup

1. Install Node.js dependencies:
```bash
npm install
```

This will install Puppeteer, which is used to control a headless Chrome browser.

## Running Tests

### Automated Browser Test (Recommended)

Run the automated test suite that opens a browser and performs scrolling:

```bash
npm test
```

Or directly:
```bash
node test-background-positioning-automated.js
```

This will:
1. Launch a browser (visible by default, set `headless: true` in the script for CI/CD)
2. Load `test-background-positioning.html`
3. Wait for tests to complete automatically
4. Extract and display results
5. Save results to `test-results.json`
6. Take a screenshot (`test-screenshot.png`)
7. Exit with code 0 (success) or 1 (failure)

### Manual Browser Test

Open `test-background-positioning.html` in a browser to see tests run with visual feedback.

## Test Output

The automated test outputs:
- **Summary**: Total tests, passed/failed counts, average ratio
- **Individual Tests**: Each test's ratio, scroll delta, and background position delta
- **JSON Report**: Detailed results saved to `test-results.json`
- **Screenshot**: Full page screenshot saved to `test-screenshot.png`

## Understanding Results

### Ratio

The test measures the **magnitude ratio**:
```
ratio = backgroundPositionDelta / scrollDelta
```

- **Expected**: `1.0` (for 1:1 mapping - background moves same amount as scroll)
- **Actual**: May be smaller (e.g., `0.2`) indicating the bug

### Test Scenarios

1. **Initial Position**: Baseline measurement
2. **Scroll Down 100px**: Small scroll test
3. **Scroll Down 400px More**: Larger scroll test
4. **Scroll Back Up 300px**: Reverse direction test
5. **Partial Viewport**: Element partially outside viewport

## CI/CD Integration

For continuous integration, modify `test-background-positioning-automated.js`:

```javascript
const browser = await puppeteer.launch({
    headless: true, // Set to true for CI
    args: ['--no-sandbox', '--disable-setuid-sandbox']
});
```

The script exits with:
- `0` if all tests pass and ratio is acceptable
- `1` if any tests fail or ratio deviates significantly

## Troubleshooting

### Tests don't run

- Ensure `test-background-positioning.html` exists
- Check that `assets/js/glass-edge-distortion.js` is accessible
- Verify background image exists at `/assets/background.jpg`

### Browser doesn't launch

- Ensure Puppeteer is installed: `npm install`
- Check Node.js version (requires Node 14+)
- On Linux, may need additional dependencies for Chromium

### Tests timeout

- Increase timeout in `waitForFunction` calls
- Check browser console for errors
- Verify glass effect initializes correctly


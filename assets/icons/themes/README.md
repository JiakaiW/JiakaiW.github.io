# Theme Icons

This folder contains SVG icons for research themes displayed on the home page.

## Files:

- `superconducting.svg` - Concentric circles representing superconducting circuits
- `qec.svg` - Checkmark in a box representing quantum error correction
- `tensor.svg` - 3x3 grid representing tensor networks
- `neural.svg` - Multi-layer neural network diagram

## Usage:

These icons are referenced in `/_data/research_themes.yml` and automatically included in the home page.

## Guidelines for Creating New Icons:

1. **ViewBox**: Use `viewBox="0 0 100 100"` for consistency
2. **Color**: Use `currentColor` for strokes and fills so they inherit the theme color
3. **Stroke Width**: Use 2-3px for main elements, 1px for connections
4. **Simplicity**: Keep designs clean and recognizable at small sizes
5. **Format**: Save as plain SVG (no embedded styles or metadata)

## Example Template:

```svg
<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <!-- Your icon elements here -->
    <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" stroke-width="3"/>
</svg>
```


# Current Styling Documentation

## Overview

This document provides a comprehensive overview of how styling is currently implemented across the website. The site uses a combination of traditional CSS approaches with some modern glassmorphism effects, particularly on the home page.

## Architecture

### File Structure

```
/styles.css                    # Main stylesheet - base styles, layout, navigation
/assets/css/
  ├── home.css                # Home page specific styles (liquid glass effects)
  ├── docs.css                # Technical documentation styles
  ├── footer.css              # Footer component styles
  ├── gallery.css             # Photo gallery styles
  ├── timeline.css            # Timeline widget styles (liquid glass)
  └── tech-docs.css           # Tech docs page styles
```

### CSS Organization

1. **Base Styles** (`styles.css`): Global variables, base elements, layout
2. **Component Styles**: Page-specific or component-specific stylesheets
3. **Theme System**: CSS variables for colors and theming

## CSS Variables System

### Color Palette

```css
:root {
    --color-light-grey: #2e2e2e;
    --color-dark-grey: #1a1a1a;
    --color-black: #000000;
    --color-white: #ffffff;
    --color-primary: #5d8fb3;      /* Primary blue */
    --color-hover: #555;            /* Hover state gray */
    --font-family: Arial, sans-serif;
}
```

### Usage Pattern

- Variables are defined in `:root` for global access
- Dark mode uses the same variables but overrides specific properties
- Color values are hardcoded in some places (inconsistent usage)

## Background System

### Main Background (`styles.css`)

**Default Background:**
```css
body {
    background: linear-gradient(135deg, 
        #000000 0%, #0a0a0a 25%, #000000 50%, 
        #0a0a0a 75%, #000000 100%);
    background-attachment: fixed;
    background-size: 400% 400%;
    animation: gradientShift 15s ease infinite;
}
```

**Features:**
- Animated gradient that shifts position
- Fixed attachment for parallax-like effect
- Subtle texture overlay using `::before` pseudo-element

**Premium Background** (Gallery & Tech Docs):
```css
body:has(.photo-grid),
body:has(.tech-docs-page) {
    background: 
        /* Multiple radial gradients for depth */
        radial-gradient(ellipse 90vw 120vh at 20% 10%, rgba(88, 76, 8, 0.44) 0%, transparent 60%),
        radial-gradient(ellipse 90vw 60vh at 80% 20%, rgba(117, 12, 12, 0.194) 0%, transparent 50%),
        radial-gradient(ellipse 140vw 110vh at 50% 80%, rgba(40, 40, 67, 0.2) 0%, transparent 70%),
        /* Base gradient */
        linear-gradient(135deg, #000000 0%, #0a0a0a 15%, ...);
}
```

**Key Characteristics:**
- Multiple light sources simulated with radial gradients
- Complex color stops for depth
- Fixed attachment for consistency

## Navigation System

### Header Structure

```css
header {
    background-color: var(--color-dark-grey);
    padding: 0.5em 0;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    width: 100%;
    z-index: 100;
}
```

### Navigation Menu

**Desktop:**
- Horizontal flex layout
- Dropdown menus on hover
- Transitions for smooth interactions

**Mobile:**
- Hamburger menu button
- Slide-in menu with backdrop blur
- Full-width overlay

**Mobile Menu Styling:**
```css
.nav-menu {
    backdrop-filter: blur(40px) saturate(180%);
    -webkit-backdrop-filter: blur(40px) saturate(180%);
    background: rgba(0, 0, 0, 0.4);
    border-right: 1px solid rgba(255, 255, 255, 0.2);
}
```

### Dropdown Menus

**Structure:**
- Positioned absolutely
- Opacity/visibility transitions
- Transform animations for slide-in effect

**Styling:**
```css
.dropdown-content {
    background: var(--color-light-grey);
    backdrop-filter: blur(10px);
    border-radius: 8px;
    opacity: 0;
    visibility: hidden;
    transform: translateY(-10px);
    transition: all 0.3s ease;
}
```

## Current Glass Effects

### Liquid Glass Implementation

The site uses a "liquid glass" effect inspired by Apple's design language, implemented on:

1. **Intro Container** (`.intro-container`)
2. **Theme Blocks** (`.theme-block`)
3. **Timeline Container** (`.timeline-container`)
4. **Timeline Projects** (`.timeline-project`)

### Three-Layer Glass Structure

Each glass element uses three layers:

#### 1. Base Layer
```css
background: linear-gradient(135deg, 
    rgba(93, 143, 179, 0.15) 0%, 
    rgba(137, 207, 240, 0.08) 50%,
    rgba(93, 143, 179, 0.12) 100%);
backdrop-filter: blur(20px) saturate(180%);
-webkit-backdrop-filter: blur(20px) saturate(180%);
border-radius: 24px;
border: 1px solid rgba(255, 255, 255, 0.18);
```

#### 2. Highlight Layer (`::before`)
```css
.element::before {
    background: linear-gradient(135deg, 
        rgba(255, 255, 255, 0.25) 0%,
        rgba(255, 255, 255, 0.05) 50%,
        rgba(255, 255, 255, 0) 100%);
    /* Mask technique for border highlight */
    -webkit-mask-composite: xor;
    mask-composite: exclude;
}
```

#### 3. Illumination Layer (`::after`)
```css
.element::after {
    background: radial-gradient(circle at 50% 0%, 
        rgba(137, 207, 240, 0.2) 0%,
        transparent 60%);
    opacity: 0.6;
}
```

### Glass Effect Properties

**Backdrop Filter:**
- `blur(20-24px)`: Creates frosted glass effect
- `saturate(160-180%)`: Enhances colors behind glass
- Requires `-webkit-` prefix for Safari

**Shadows:**
```css
box-shadow: 
    0 8px 32px rgba(93, 143, 179, 0.15),    /* Main shadow */
    0 2px 8px rgba(0, 0, 0, 0.08),          /* Close shadow */
    inset 0 1px 0 rgba(255, 255, 255, 0.1); /* Inner highlight */
```

**Hover States:**
- Increased opacity on highlight/illumination layers
- Enhanced shadows
- Transform effects (translateY, scale)
- Theme-specific color tints

## Card Components

### Project Cards (`.card`)

**Structure:**
- Image background
- Text overlay with backdrop blur
- Hover effects with scale transforms

**Styling:**
```css
.card {
    background: transparent;
    border-radius: 30px;
    overflow: hidden;
    aspect-ratio: 5/4;
}

.card-text {
    background-color: rgba(51, 51, 51, 0.7);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
}
```

### Expanded Cards (`.expanded-card`)

**Modal Overlay:**
- Fixed positioning
- Backdrop blur on overlay
- Glass effect on card itself

```css
.expanded-card {
    background: rgba(30, 30, 30, 0.6);
    backdrop-filter: blur(16px) saturate(100%);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 30px;
}
```

### News Items (`.news-item`)

**Styling:**
```css
.news-item {
    background: linear-gradient(135deg, 
        rgba(93, 143, 179, 0.15) 0%, 
        rgba(46, 46, 46, 0.3) 100%);
    border: 2px solid var(--category-border, rgba(93, 143, 179, 0.3));
    border-radius: 15px;
}
```

**Features:**
- Category-specific border colors
- Top border animation on hover
- Transform effects

## Photo Gallery

### Photo Cards (`.photo-card`)

**Styling:**
```css
.photo-card {
    background: linear-gradient(135deg, 
        rgba(93, 143, 179, 0.15) 0%, 
        rgba(46, 46, 46, 0.3) 100%);
    border: 2px solid rgba(93, 143, 179, 0.3);
    border-radius: 20px;
}
```

**Hover Effects:**
- Radial gradient overlay
- Enhanced border color
- Transform and shadow changes

## Search System

### Search Overlay

**Structure:**
- Fixed overlay with backdrop blur
- Search input container
- Results container

**Styling:**
```css
.search-overlay {
    backdrop-filter: blur(7px);
    background: rgba(0, 0, 0, 0.3);
}

.search-result-item {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(5px);
}
```

## Dark Mode

### Implementation

**Toggle System:**
- JavaScript-based class toggle (`.dark-mode`)
- Overrides specific properties

**Key Overrides:**
```css
.dark-mode {
    background-color: black;
    color: var(--color-white);
}

.dark-mode header,
.dark-mode footer {
    background-color: black;
}
```

**Limitations:**
- Not all components have dark mode variants
- Some hardcoded colors don't respect dark mode
- Glass effects use same parameters in both modes

## Responsive Design

### Breakpoints

**Mobile:** `@media (max-width: 768px)`
- Hamburger menu
- Stacked layouts
- Adjusted padding/spacing

**Tablet:** `@media (max-width: 1024px)`
- Grid adjustments
- Font size reductions

**Desktop:** `@media (min-width: 1400px)`
- Increased max-widths
- More columns in grids

### Mobile-Specific Features

1. **Transparent Header:**
```css
@media (max-width: 768px) {
    header {
        background-color: transparent;
        backdrop-filter: blur(10px);
    }
}
```

2. **Mobile Menu:**
- Slide-in animation
- Full-width overlay
- Enhanced backdrop blur

## Animation System

### Keyframe Animations

**Gradient Shift:**
```css
@keyframes gradientShift {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
}
```

**Fade In Animations:**
- Cards: `cardFadeIn`
- Photos: `photoFadeIn`
- News items: `newsItemFadeIn`
- Theme blocks: `themeBlockFadeIn`

**Staggered Delays:**
```css
.card {
    animation-delay: calc(var(--card-index, 0) * 0.2s);
}
```

### Transitions

**Common Patterns:**
- `transition: all 0.3s ease` - General transitions
- `transition: transform 0.3s ease` - Transform-only
- `transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1)` - Smooth easing

## Performance Optimizations

### GPU Acceleration

```css
.card {
    will-change: transform;
    transform: translateZ(0); /* Force GPU layer */
}
```

### Isolation Contexts

```css
.intro-container {
    isolation: isolate; /* Creates stacking context */
}
```

### Backdrop Filter Considerations

- Can be GPU-intensive
- Used selectively on key elements
- Fallbacks for unsupported browsers

## Accessibility

### Contrast

- Text colors maintain WCAG AA contrast
- Glass backgrounds use sufficient opacity
- Borders provide visual separation

### Visual Noise

- Limited glass-on-glass layering
- Smooth, non-distracting animations
- Clear focus states

### Readability

- Balanced blur amounts
- Proper font weights/sizes
- Z-index layering for content

## Browser Support

### Modern Features Used

- `backdrop-filter` (Chrome 76+, Safari 9+, Firefox 103+)
- CSS Grid (Universal support)
- CSS Variables (Universal support)
- `:has()` selector (Chrome 105+, Safari 15.4+)

### Fallbacks

- Solid backgrounds when backdrop-filter unavailable
- Standard shadows when advanced effects fail
- Graceful degradation

## Current Limitations

### Inconsistencies

1. **Mixed Styling Approaches:**
   - Some elements use glass effects
   - Others use solid backgrounds
   - Inconsistent border treatments

2. **Color System:**
   - Hardcoded colors in many places
   - CSS variables not fully utilized
   - Theme colors scattered

3. **Glass Effect Coverage:**
   - Only on home page elements
   - Not applied to navigation/footer consistently
   - Different blur amounts across components

4. **Dark Mode:**
   - Incomplete implementation
   - Some elements don't adapt
   - Glass effects same in both modes

### Performance Concerns

1. **Backdrop Filter Overuse:**
   - Multiple layers can be expensive
   - No performance monitoring
   - May cause jank on low-end devices

2. **Animation Complexity:**
   - Multiple simultaneous animations
   - No `prefers-reduced-motion` support
   - Some animations may be unnecessary

## Component-Specific Details

### Header/Navigation

**Current State:**
- Solid background (`var(--color-dark-grey)`)
- Transparent on mobile with blur
- Dropdown menus have glass effect

**Glass Effect:** Partial (mobile only, dropdowns)

### Footer

**Current State:**
- Solid background (`var(--color-dark-grey)`)
- Transparent on premium background pages
- Simple social links

**Glass Effect:** None (except on premium pages)

### Cards

**Current State:**
- Mixed approaches
- Some have backdrop blur
- Some have solid backgrounds

**Glass Effect:** Partial

### Buttons/Controls

**Current State:**
- Mostly solid backgrounds
- Simple hover states
- No glass effects

**Glass Effect:** None

## Summary

The current styling system is a hybrid approach:

1. **Base Layer:** Traditional CSS with solid backgrounds
2. **Accent Layer:** Modern glass effects on key home page elements
3. **Mixed Implementation:** Inconsistent application of glass effects

**Strengths:**
- Good foundation with CSS variables
- Modern glass effects where implemented
- Responsive design
- Accessibility considerations

**Areas for Improvement:**
- Consistent glass effect application
- Better color system utilization
- Complete dark mode support
- Performance optimization
- Unified design language

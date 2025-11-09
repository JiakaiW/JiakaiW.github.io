# Architecture Documentation

## Overview

This document describes the architecture and structure of the Jiakai Wang personal website. The site is built using Jekyll for static site generation and follows a modular architecture for both JavaScript and CSS.

## Directory Structure

```
JiakaiW.github.io/
├── _data/                    # Jekyll data files (YAML)
│   ├── projects.yml
│   ├── research_themes.yml
│   └── timeline_projects.yml
├── _includes/                # Jekyll includes (reusable HTML components)
│   ├── components/
│   │   └── glass-filters.html  # SVG filter definitions
│   ├── footer.html
│   ├── head.html            # Head section with CSS/JS includes
│   ├── navigation.html
│   └── overlays.html        # Overlay components (search, card, photo)
├── _layouts/                # Jekyll layouts
│   ├── default.html         # Main layout template
│   └── tech-docs.html
├── assets/
│   ├── css/
│   │   ├── base/            # Foundation styles
│   │   │   ├── variables.css    # CSS custom properties (design tokens)
│   │   │   ├── reset.css        # CSS reset and base element styles
│   │   │   ├── typography.css   # Typography rules
│   │   │   └── layout.css       # Page structure and layout
│   │   ├── components/      # Reusable component styles
│   │   │   ├── glass-effects.css    # Glass morphism effects (single source)
│   │   │   ├── navigation.css       # Header and navigation
│   │   │   ├── search-overlay.css   # Search functionality
│   │   │   ├── card-overlay.css     # Card and overlay components
│   │   │   ├── photo-overlay.css    # Photo expansion overlay
│   │   │   ├── code-blocks.css      # Code block styling
│   │   │   ├── carousel.css         # Image carousel
│   │   │   ├── intro-section.css    # Homepage intro section
│   │   │   ├── theme-grid.css       # Research themes grid
│   │   │   └── news-section.css     # News items section
│   │   └── pages/            # Page-specific styles
│   │       ├── docs.css             # Technical documentation page
│   │       ├── gallery.css          # Photo gallery page
│   │       ├── tech-docs.css        # Tech docs layout page
│   │       └── timeline.css         # Timeline widget page
│   └── js/
│       ├── modules/         # ES6 modules (modular architecture)
│       │   ├── core/        # Core functionality
│       │   │   ├── overlay-manager.js   # Unified overlay management
│       │   │   ├── search-manager.js    # Search functionality (Lunr.js)
│       │   │   └── page-init.js         # Page initialization and global exports
│       │   ├── components/  # UI components
│       │   │   ├── project.js           # Project class
│       │   │   ├── research-theme.js    # ResearchTheme class
│       │   │   ├── theme-manager.js     # ThemeManager class
│       │   │   ├── news-loader.js       # News loading (re-exports from news-manager)
│       │   │   ├── news-manager.js      # Unified news manager
│       │   │   └── timeline.js          # Timeline component
│       │   └── utils/       # Utility functions
│       │       ├── mobile-menu.js       # Mobile navigation menu
│       │       ├── gallery.js           # Gallery scrolling
│       │       ├── event-delegation.js  # Event delegation system
│       │       └── error-handler.js     # Error handling utility
│       ├── home.js          # Compatibility wrapper (imports home-modular.js)
│       ├── main.js          # Compatibility wrapper (imports main-modular.js)
│       ├── home-modular.js  # Home page initialization
│       ├── main-modular.js  # Main entry point
│       ├── timeline-modular.js  # Timeline page entry point
│       ├── news-modular.js      # News page entry point
│       └── [glass effects]  # Specialized glass rendering scripts
└── [content files]          # Markdown content files
```

## JavaScript Architecture

### Module System

The site uses ES6 modules for better code organization and dependency management. All modules are located in `assets/js/modules/` and follow a clear structure:

#### Core Modules (`modules/core/`)

Core modules provide essential functionality used across the site:

- **`overlay-manager.js`**: Singleton class managing all overlay functionality
  - Card expansion (fetches content from URLs)
  - Photo expansion
  - Search overlay toggle
  - Keyboard shortcuts (Escape key)
  - Exports: `overlayManager` (singleton), `OverlayManager` (class)

- **`search-manager.js`**: Search functionality using Lunr.js
  - Builds search index from `/assets/search-index.json`
  - Handles search queries with debouncing
  - Renders search results
  - Exports: `searchManager` (singleton), `SearchManager` (class)

- **`page-init.js`**: Page initialization and global function exports
  - Sets up global functions for backward compatibility
  - Initializes dark mode
  - Sets up event delegation system
  - Sets up search input handlers
  - Keyboard shortcuts (Cmd/Ctrl+K for search)
  - Exports: None (side effects only)

#### Component Modules (`modules/components/`)

Component modules represent UI components and their logic:

- **`project.js`**: Project class representing a research project
  - Properties: title, description, url, image, status
  - Methods: `render()`, `getStatusBadge()`, `getStatusText()`
  - Exports: `Project` class

- **`research-theme.js`**: ResearchTheme class representing a research theme
  - Properties: id, title, description, projects array
  - Methods: `addProject()`, `renderProjects()`, `renderProjectPreviews()`, status counts
  - Exports: `ResearchTheme` class

- **`theme-manager.js`**: ThemeManager class managing all research themes
  - Loads projects data from `/projects-data.json`
  - Initializes themes and populates with projects
  - Handles theme expansion
  - Exports: `ThemeManager` class

- **`news-loader.js`**: News loading (deprecated, re-exports from news-manager)
  - Re-exports `loadNews()` from `news-manager.js` for backward compatibility
  - Exports: `loadNews()` function

- **`news-manager.js`**: Unified news manager
  - Handles both homepage preview (6 items) and full news page
  - Fetches news from `/news-feed.json`
  - Renders news items with category styling
  - Uses error handler for consistent error display
  - Exports: `loadNews()`, `loadAllNews()` functions

- **`timeline.js`**: Timeline component
  - SegmentedTimeline class for displaying project schedules
  - Fetches timeline data from `/timeline-data.json`
  - Renders timeline with time segments and project bars
  - Exports: `SegmentedTimeline` class, `initTimeline()` function

#### Utility Modules (`modules/utils/`)

Utility modules provide helper functions:

- **`mobile-menu.js`**: Mobile navigation menu toggle
  - Handles hamburger menu toggle
  - Closes menu on link click
  - Exports: `mobileMenuManager` (singleton), `MobileMenuManager` (class)

- **`gallery.js`**: Gallery scrolling functionality
  - Horizontal scrolling for gallery items
  - Exports: `scrollGallery()` function

- **`event-delegation.js`**: Event delegation system
  - Handles `data-action` attributes for declarative event handling
  - Replaces inline event handlers (onclick, oninput)
  - Supports actions: close-search, toggle-search, expand-card, expand-theme, etc.
  - Exports: `setupEventDelegation()` function

- **`error-handler.js`**: Error handling utility
  - Consistent error display with severity levels
  - User-friendly error messages
  - Fetch error handling
  - Exports: `showError()`, `handleFetchError()`, `withErrorHandling()`, `ErrorSeverity` enum

### Entry Points

- **`main.js`**: Compatibility wrapper that imports `main-modular.js`
  - Loaded on all pages via `_layouts/default.html`
  - Provides global functions via `page-init.js`

- **`home.js`**: Compatibility wrapper that imports `home-modular.js`
  - Loaded on homepage via `index.md`
  - Initializes theme manager and news loader

- **`timeline-modular.js`**: Timeline page entry point
  - Loaded on homepage via `index.md`
  - Initializes timeline component

- **`news-modular.js`**: News page entry point
  - Loaded on news page via `news/index.md`
  - Loads all news items

### Event Delegation System

The site uses a declarative event delegation system via `data-action` attributes:

- **`data-action`**: Specifies the action to perform (e.g., "expand-card", "toggle-search")
- **`data-action-param`**: Optional parameter for the action (e.g., card URL, theme ID)
- **`data-stop-propagation`**: Prevents event bubbling for overlay containers

**Supported Actions:**
- `close-search`, `toggle-search` - Search overlay
- `expand-card`, `close-card`, `close-expanded-card` - Card expansion
- `expand-photo`, `close-photo`, `close-expanded-photo` - Photo expansion
- `expand-theme` - Theme expansion (requires `data-action-param` with theme ID)
- `expand-card` - Card expansion (requires `data-action-param` with card URL)
- `toggle-mobile-menu` - Mobile navigation

**Benefits:**
- Separation of concerns (HTML/JS)
- Easier testing and maintenance
- Better accessibility
- No inline event handlers

### Backward Compatibility

Global functions are exported via `page-init.js` for backward compatibility:

- `toggleSearch()`, `closeSearch()`
- `expandCard()`, `closeExpandedCard()`
- `expandPhoto()`, `closeExpandedPhoto()`
- `toggleMobileMenu()`
- `scrollGallery()`
- `handleSearch()` (for inline oninput handlers)
- `expandTheme()` (for theme expansion)

## CSS Architecture

### Base Styles (`base/`)

Foundation styles that must load first:

1. **`variables.css`**: CSS custom properties (design tokens)
   - Color palette
   - Glass effect variables (blur, saturation, opacity)
   - Border radius, shadows, transitions
   - Must load first for other files to use variables

2. **`reset.css`**: CSS reset and base element styles
   - Base element styling (a, img)
   - Figure caption styling

3. **`typography.css`**: Typography rules
   - Font family, heading hierarchy
   - Paragraph styling

4. **`layout.css`**: Page structure and layout
   - HTML/body background and structure
   - Main content layout
   - Dark mode styles
   - Premium background pages

### Component Styles (`components/`)

Reusable component stylesheets:

1. **`glass-effects.css`**: Single source of truth for glass morphism
   - Base glass effect (`.glass-base`)
   - Variants: `.glass-light`, `.glass-heavy`, `.glass-subtle`, `.glass-dark`
   - Button variant: `.btn-glass`
   - Uses CSS variables from `variables.css`

2. **`navigation.css`**: Header and navigation
   - Header styling with glass effect
   - Navigation menu, dropdowns
   - Mobile hamburger menu
   - Search button

3. **`search-overlay.css`**: Search functionality
   - Search overlay and container
   - Search input and results
   - Result item styling

4. **`card-overlay.css`**: Card and overlay components
   - Card styles
   - Expanded card overlay
   - Photo grid
   - Close button

5. **`photo-overlay.css`**: Photo expansion overlay
   - Photo overlay container
   - Expanded photo display
   - Photo caption

6. **`code-blocks.css`**: Code block styling
   - Pre and code elements
   - Inline code
   - Language indicators
   - Scrollbar styling

7. **`carousel.css`**: Image carousel
   - Carousel container
   - Navigation buttons

8. **`intro-section.css`**: Homepage intro section
   - Intro container with glass effect
   - Image containers
   - Tags styling
   - Thumbs up animation

9. **`theme-grid.css`**: Research themes grid
   - Theme grid layout
   - Theme blocks with glass effect
   - Project previews
   - Expanded theme view

10. **`news-section.css`**: News items section
    - News container grid
    - News item cards with glass effect
    - News page header
    - View all button

### Page-Specific Styles (`pages/`)

Styles specific to individual pages:

1. **`docs.css`**: Technical documentation cards
   - Doc card grid layout
   - Card styling with reduced blur for image visibility
   - Content overlay styling

2. **`gallery.css`**: Photo gallery page
   - Photo grid layout
   - Photo card styling

3. **`tech-docs.css`**: Tech docs layout page
   - Page container styling
   - Content layout

4. **`timeline.css`**: Timeline widget page
   - Timeline container and segments
   - Project bars and tooltips

### Loading Order

CSS files are loaded in a specific order in `_includes/head.html`:

1. `variables.css` (must be first)
2. Base styles (reset, typography, layout)
3. `glass-effects.css` (before other components)
4. Component styles (navigation, search, etc.)
5. Page-specific styles (pages/gallery.css, pages/docs.css, etc.)
6. Footer styles

## HTML Structure

### Layouts

- **`default.html`**: Main layout template
  - Includes `head.html` (CSS/JS)
  - Includes `navigation.html` (header)
  - Includes `overlays.html` (overlay components)
  - Main content area
  - Includes `footer.html`

### Includes

- **`head.html`**: Head section with all CSS and some JS includes
- **`navigation.html`**: Navigation menu structure
- **`overlays.html`**: Overlay components (search, card, photo)
- **`footer.html`**: Footer content
- **`components/glass-filters.html`**: SVG filter definitions (reusable)

## Data Files

Jekyll data files in `_data/`:

- **`projects.yml`**: Project definitions
- **`research_themes.yml`**: Research theme definitions
- **`timeline_projects.yml`**: Timeline project data

## Design System

### CSS Variables

All design tokens are defined in `assets/css/base/variables.css`:

- **Colors**: Primary, secondary, accent colors
- **Glass Effects**: Blur, saturation, opacity values
- **Spacing**: Consistent spacing values
- **Shadows**: Layered shadow definitions
- **Transitions**: Animation timing

### Glass Morphism

The site uses a consistent glass morphism design system:

- Base glass effect with backdrop-filter
- Highlight and illumination layers (::before, ::after)
- Hover states with enhanced effects
- Multiple variants (light, heavy, subtle, dark)
- Dark mode support

## Dependencies

### External Libraries

- **Lunr.js**: Client-side search (loaded via CDN in `head.html`)
- **Jekyll**: Static site generator

### Internal Dependencies

- Glass effect scripts (WebGL, SVG filters) loaded conditionally in `default.html` based on `page.glass_effects` front matter
- ES6 modules loaded with `type="module"` attribute
- CSS variables must load before components
- Event delegation initialized in `page-init.js`

## Browser Support

- Modern browsers with ES6 module support
- CSS custom properties (CSS variables)
- `backdrop-filter` for glass effects (with fallbacks)
- `:has()` selector for premium background pages

## Card System

The site uses several types of cards for different purposes:

### Card Types

1. **Project Cards** (`.card`)
   - **Purpose**: Display project thumbnails with text overlay
   - **Location**: `projects/featured.md`
   - **Styling**: `assets/css/components/card-overlay.css`
   - **Interaction**: Expand to show full project content via overlay
   - **Event**: Uses `data-action="expand-card"` with `data-action-param` for URL

2. **Doc Cards** (`.doc-card`)
   - **Purpose**: Display technical documentation cards with thumbnails
   - **Location**: `tech-docs/index.md`
   - **Styling**: `assets/css/pages/docs.css`
   - **Features**: Background images visible through reduced blur glass effect
   - **Layout**: Grid layout with variable row spans based on image presence

3. **Theme Blocks** (`.theme-block`)
   - **Purpose**: Display research themes on homepage
   - **Location**: `index.md`
   - **Styling**: `assets/css/components/theme-grid.css`
   - **Interaction**: Expand to show projects within theme
   - **Event**: Uses `data-action="expand-theme"` with `data-action-param` for theme ID

4. **News Items** (`.news-item`)
   - **Purpose**: Display news/updates
   - **Location**: Homepage and `news/index.md`
   - **Styling**: `assets/css/components/news-section.css`
   - **Features**: Category badges, date display, glass effect

5. **Photo Cards** (`.photo-card`)
   - **Purpose**: Display photos in gallery
   - **Location**: `photo-grid/gallery.md`
   - **Styling**: `assets/css/components/card-overlay.css`
   - **Interaction**: Expand to full-size view

### Card Best Practices

- Use appropriate card type for content
- Ensure images are visible (adjust blur/opacity as needed)
- Use `data-action` attributes instead of inline handlers
- Maintain consistent spacing and sizing
- Test hover states and interactions

## Performance Considerations

- CSS files loaded in optimal order
- JavaScript modules loaded asynchronously with `defer`
- Glass effect scripts loaded conditionally based on page front matter
- Search index loaded asynchronously
- Images optimized and lazy-loaded where appropriate
- Event delegation reduces event listener overhead

## Future Improvements

1. **TypeScript Migration**: Gradually migrate to TypeScript for better type safety
2. **Testing Infrastructure**: Add unit tests for modules
3. **Documentation**: Add JSDoc comments to all modules (in progress)
4. **Build System**: Consider adding bundler for production optimization

## Migration Notes

- Legacy wrapper files (`home.js`, `main.js`) maintained for backward compatibility
- Global functions exported for backward compatibility (event delegation preferred)
- CSS variables replace hardcoded values throughout
- Glass effects consolidated from multiple files to single source
- Page-specific CSS moved to `pages/` directory
- Inline event handlers replaced with `data-action` attributes
- News and timeline scripts modularized
- Error handling standardized across modules


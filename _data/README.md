# Data Files

This folder contains YAML data files that are used throughout the site.

📖 **See [DATA_DRIVEN_ARCHITECTURE.md](../DATA_DRIVEN_ARCHITECTURE.md) for complete documentation**

## Overview

All website content is managed through data files:
- **`research_themes.yml`** - Theme metadata (title, description, icon)
- **`projects.yml`** - All project data with theme associations

Stats are **automatically calculated** from project data - no manual updates needed!

## Quick Start

### Add a New Project

Edit `projects.yml`:
```yaml
- id: my-project
  title: My Project Title
  description: Brief description
  url: /projects/my-project
  image: /path/to/image.png
  status: completed  # completed, ongoing, or potential
  themes:
    - theme-id-1
    - theme-id-2
```

Stats automatically update on next build!

### Add a New Theme

1. Create SVG icon in `/assets/icons/themes/new-theme.svg`
2. Add to `research_themes.yml`:
```yaml
- id: new-theme
  title: Theme Title
  description: Theme description
  icon: /assets/icons/themes/new-theme.svg
```
3. Tag projects with `new-theme` in their `themes` array

## Files

### research_themes.yml
Defines research themes (title, description, icon path).

**Stats are NOT stored here** - they're auto-calculated by `_plugins/theme_stats_generator.rb`

### projects.yml
Single source of truth for all project data.

Projects can belong to multiple themes and stats are automatically calculated.

## Generated Files

- `projects-data.json` - Auto-generated API endpoint for JavaScript
- Theme stats - Auto-injected into `site.data.research_themes` during build

## Benefits

- ✅ **Zero code changes** to add/update projects
- ✅ **Automatic stats** calculation
- ✅ **Clean separation** of content and code
- ✅ **Version control** friendly
- ✅ **Easy maintenance** by non-developers

## See Also

- [DATA_DRIVEN_ARCHITECTURE.md](../DATA_DRIVEN_ARCHITECTURE.md) - Complete guide
- [THEME_MANAGEMENT.md](../THEME_MANAGEMENT.md) - Theme management guide


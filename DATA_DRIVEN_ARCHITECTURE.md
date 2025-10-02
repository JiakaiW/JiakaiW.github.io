# Data-Driven Architecture Guide

This document explains the fully data-driven architecture of the research website, where content is completely decoupled from code.

## Overview

The website now uses a **data-driven architecture** where:
- **Content** is stored in YAML files (`_data/`)
- **Presentation** is handled by Jekyll templates and CSS
- **Logic** dynamically loads data via JSON APIs
- **Stats are auto-calculated** from project data

## Architecture Components

```
Content Layer (Data)
├── _data/
│   ├── research_themes.yml    # Theme definitions
│   └── projects.yml            # All project data
│
Template Layer (Jekyll)
├── _plugins/
│   └── theme_stats_generator.rb # Auto-calculates stats
├── projects-data.json           # API endpoint (generated)
├── news-feed.json              # News API (generated)
└── index.md                    # Theme rendering template
│
Presentation Layer
├── assets/css/home.css         # Styling
├── assets/js/home.js           # Dynamic logic
└── assets/icons/themes/        # SVG icons
```

## How It Works

### 1. **Content Creation** (YAML Files)

#### Add a New Project
Edit `_data/projects.yml`:

```yaml
- id: your-project
  title: Your Project Title
  description: Brief description of your project
  url: /projects/your-project  # or null if no page
  image: /path/to/image.png    # or null if no image
  status: completed            # completed, ongoing, or potential
  themes:
    - theme-id-1               # Can belong to multiple themes
    - theme-id-2
```

#### Add a New Theme
1. Edit `_data/research_themes.yml`:
```yaml
- id: new-theme
  title: New Theme Title
  description: Theme description
  icon: /assets/icons/themes/new-theme.svg
```

2. Create icon file: `/assets/icons/themes/new-theme.svg`

3. Add projects with `new-theme` in their `themes` array

**That's it!** Stats are auto-calculated, no code changes needed.

### 2. **Build Process** (Jekyll)

When Jekyll builds:

1. **Plugin runs** (`theme_stats_generator.rb`)
   - Scans `projects.yml`
   - Counts projects per theme by status
   - Injects stats into `research_themes` data

2. **JSON files generated**
   - `projects-data.json`: All projects + theme stats
   - `news-feed.json`: All news items sorted by date

3. **HTML generated**
   - `index.md` loops through `site.data.research_themes`
   - Stats are automatically included
   - SVG icons are embedded

### 3. **Runtime** (JavaScript)

When page loads:

1. **Fetch data**
   ```javascript
   await themeManager.loadProjectsData()  // Loads /projects-data.json
   ```

2. **Build theme structure**
   - Creates `ResearchTheme` objects
   - Creates `Project` objects
   - Associates projects with themes

3. **Render previews**
   - Dynamically generates project preview cards
   - Populates theme blocks

## File Structure

### Data Files

#### `_data/projects.yml`
**Purpose**: Single source of truth for all project data

**Structure**:
```yaml
- id: unique-id              # Unique identifier
  title: Display Title       # Project name
  description: One-sentence  # Brief description
  url: /page/path           # Link (or null)
  image: /image/path.png    # Thumbnail (or null)
  status: completed         # completed|ongoing|potential
  themes:                   # Array of theme IDs
    - theme1
    - theme2
```

**Benefits**:
- ✅ One file to manage all projects
- ✅ Projects can belong to multiple themes
- ✅ Easy to add/remove/modify
- ✅ Version control friendly
- ✅ No code changes needed

#### `_data/research_themes.yml`
**Purpose**: Theme metadata (title, description, icon)

**Structure**:
```yaml
- id: theme-id              # Unique identifier
  title: Theme Title        # Display title
  description: Description  # One-sentence description
  icon: /path/to/icon.svg  # SVG icon path
```

**Note**: Stats are NOT stored here - they're auto-calculated!

### Generated Files

#### `projects-data.json`
**Purpose**: API endpoint for JavaScript

**Auto-generated from**: `_data/projects.yml`

**Structure**:
```json
{
  "projects": [
    {
      "id": "project-id",
      "title": "Project Title",
      "description": "Description",
      "url": "/path",
      "image": "/image.png",
      "status": "completed",
      "themes": ["theme1", "theme2"]
    }
  ],
  "themeStats": {
    "theme1": {
      "completed": 2,
      "ongoing": 1,
      "potential": 3
    }
  }
}
```

## Adding Content

### Scenario 1: Add a New Completed Project

1. Edit `_data/projects.yml`:
```yaml
- id: my-new-project
  title: My Awesome Project
  description: This project does amazing things with quantum computing
  url: /projects/my-new-project
  image: /projects/my-new-project/images/main.png
  status: completed
  themes:
    - superconducting
    - qec
```

2. Create project page (optional): `/projects/my-new-project/my-new-project.md`

3. Build site: `bundle exec jekyll build`

4. **Done!** Project appears in both themes with correct stats.

### Scenario 2: Add a Potential Project (No Page Yet)

```yaml
- id: future-research
  title: Future Research Direction
  description: Exploring new approaches to quantum error correction
  url: null            # No page yet
  image: null          # No image yet
  status: potential    # Mark as potential
  themes:
    - qec
```

Stats auto-update to show "+1 Potential" in QEC theme.

### Scenario 3: Update Project Status

Change `status: ongoing` to `status: completed` in `projects.yml`.

Stats automatically update on next build.

### Scenario 4: Add a New Theme

1. Create icon: `/assets/icons/themes/photonics.svg`

2. Add to `_data/research_themes.yml`:
```yaml
- id: photonics
  title: Photonic Quantum Computing
  description: Quantum computing with photons
  icon: /assets/icons/themes/photonics.svg
```

3. Tag relevant projects in `projects.yml`:
```yaml
themes:
  - photonics
```

4. (Optional) Add theme-specific styling in `home.css`:
```css
.theme-block[data-theme="photonics"]:hover {
    background: linear-gradient(135deg, 
        rgba(255, 100, 150, 0.28) 0%, 
        rgba(137, 207, 240, 0.15) 50%,
        rgba(46, 46, 46, 0.18) 100%);
}
```

## Benefits of This Architecture

### 1. **Content-Code Separation**
- Content editors never touch HTML/CSS/JS
- Developers never touch content
- Clean separation of concerns

### 2. **Maintainability**
- Single source of truth for projects
- No duplicate data
- Stats always in sync
- Easy to audit and update

### 3. **Scalability**
- Add unlimited projects without code changes
- Add unlimited themes with minimal setup
- Projects can belong to multiple themes
- No performance impact

### 4. **Version Control Friendly**
- YAML diffs are human-readable
- Easy to review changes
- Merge conflicts are rare
- History is clear

### 5. **Type Safety**
- YAML validates structure
- Jekyll validates during build
- JavaScript has fallbacks for missing data

### 6. **Automatic Features**
- Stats auto-calculate
- JSON APIs auto-generate
- Counts always accurate
- No manual updates needed

## Migration from Old System

### Before (Hardcoded in JavaScript)
```javascript
scTheme.addProject(new Project(
    'Fluxonium Erasure',
    'Description...',
    '/projects/fluxonium_erasure',
    '/projects/fluxonium_erasure/images/lvl_diagram.png',
    'completed'
));
// Repeated 12+ times...
```

### After (Data-Driven)
```yaml
# _data/projects.yml
- id: fluxonium-erasure
  title: Fluxonium Erasure
  description: Description...
  url: /projects/fluxonium_erasure
  image: /projects/fluxonium_erasure/images/lvl_diagram.png
  status: completed
  themes:
    - superconducting
```

**Result**: ~200 lines of JS → 8 lines of YAML per project

## Advanced: Auto-Discovery from Project Files

### Current System
Projects are manually listed in `projects.yml`.

### Future Enhancement
Use Jekyll Collections to auto-discover projects:

1. Add to `_config.yml`:
```yaml
collections:
  projects:
    output: true
    permalink: /projects/:name/
```

2. Move frontmatter to project markdown files:
```yaml
---
title: Fluxonium Erasure
project_id: fluxonium-erasure
description: Description...
image: images/lvl_diagram.png
status: completed
themes:
  - superconducting
  - qec
---
Project content here...
```

3. Update `projects-data.json` to loop through `site.projects` instead of `site.data.projects`

**Benefit**: Add project by creating one file, no editing of YAML needed.

## Troubleshooting

### Stats Not Updating
1. Check project `themes` array includes valid theme ID
2. Rebuild site: `bundle exec jekyll build`
3. Clear browser cache
4. Check console for errors: `Failed to load projects data`

### Project Not Appearing
1. Verify YAML syntax is valid
2. Check `themes` array is not empty
3. Ensure `status` is one of: `completed`, `ongoing`, `potential`
4. Rebuild and refresh

### Theme Not Showing
1. Check `research_themes.yml` has entry with matching `id`
2. Verify icon file exists at specified path
3. Ensure at least one project references this theme
4. Check `index.md` loops through themes correctly

## Best Practices

### Project IDs
- Use kebab-case: `project-name`
- Keep them short but descriptive
- Never change IDs (breaks links)

### Descriptions
- Keep to 1-2 sentences
- Focus on impact/novelty
- No technical jargon
- Under 200 characters

### Images
- Use meaningful thumbnails (not raw data plots)
- Prefer PNG for diagrams, JPG for photos
- Optimize images (<100KB if possible)
- Use descriptive filenames

### Status Guidelines
- `completed`: Published work, finished projects
- `ongoing`: Active research, work in progress
- `potential`: Future directions, ideas, proposals

### Theme Assignment
- Assign 1-3 themes per project (avoid over-tagging)
- Use primary theme first in array
- Consider cross-disciplinary connections
- Be consistent across related projects

## Conclusion

This data-driven architecture provides:
- ✅ **Zero code changes** to add/update projects
- ✅ **Automatic stats** calculation
- ✅ **Clean separation** of content and code
- ✅ **Easy maintenance** by non-developers
- ✅ **Scalable** to hundreds of projects
- ✅ **Version control** friendly

The system is designed to grow with your research portfolio while remaining simple to maintain.


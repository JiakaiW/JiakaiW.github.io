# Modular Research Themes Refactoring

This document describes the modular structure for research themes on the home page.

## Overview

The research themes section has been refactored from inline HTML to a modular, data-driven structure.

## Structure

### Before (Inline HTML - 180 lines)

```html
<div class="theme-block" data-theme="superconducting">
    <div class="theme-icon">
        <svg viewBox="0 0 100 100">
            <!-- 100+ lines of SVG code -->
        </svg>
    </div>
    <h3>Title</h3>
    <p>Description</p>
    <!-- Repeated for each theme -->
</div>
```

### After (Modular - 25 lines)

```html
{% raw %}{% for theme in site.data.research_themes %}
<div class="theme-block" data-theme="{{ theme.id }}">
    <div class="theme-icon">
        {% include components/theme-block.html theme=theme %}
    </div>
    <h3>{{ theme.title }}</h3>
    <p>{{ theme.description }}</p>
</div>
{% endfor %}{% endraw %}
```

## File Organization

```
/_data/
  └── research_themes.yml          # Theme configuration data
  └── README.md                     # Documentation

/assets/icons/themes/
  ├── superconducting.svg          # Individual SVG icons
  ├── qec.svg
  ├── tensor.svg
  ├── neural.svg
  └── README.md                     # Icon guidelines

/assets/js/
  └── home.js                       # Project data (unchanged)

/assets/css/
  └── home.css                      # Styling (unchanged)

/index.md                           # Simplified theme rendering
```

## Benefits

### 1. **Maintainability**
- Edit theme info in one YAML file instead of HTML
- No need to touch HTML for title/description changes
- Clear separation between data, presentation, and logic

### 2. **Reusability**
- SVG icons can be reused in other parts of the site
- Theme data can be accessed from any page via `site.data.research_themes`

### 3. **Scalability**
- Add new themes by adding one entry to YAML + one SVG file
- No need to duplicate HTML structure

### 4. **Version Control**
- Clean diffs when changing theme data
- Easier to track what changed (data vs. structure)

### 5. **Developer Experience**
- Easier to understand the structure
- Less code duplication
- Better documentation

## Adding a New Theme

### Step 1: Create Icon SVG
Create `/assets/icons/themes/your-theme.svg`:
```svg
<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <!-- Your icon design using currentColor -->
</svg>
```

### Step 2: Add to Data File
Edit `/_data/research_themes.yml`:
```yaml
- id: your-theme
  title: Your Theme Title
  description: Your theme description
  icon: /assets/icons/themes/your-theme.svg
  stats:
    completed: 0
    ongoing: 1
    potential: 0
```

### Step 3: Add Projects (Optional)
Edit `/assets/js/home.js` to add project data for the theme.

### Step 4: Add Custom Styling (Optional)
Edit `/assets/css/home.css` to add theme-specific hover colors.

## Editing Existing Themes

### Change Title/Description
Edit `/_data/research_themes.yml` - changes apply immediately on next build.

### Change Icon
Edit the corresponding SVG file in `/assets/icons/themes/`.

### Change Stats
Update the `stats` section in `research_themes.yml`.

## Code Reduction

- **Before**: ~180 lines of repetitive HTML in `index.md`
- **After**: ~25 lines of template + 4 small SVG files + 1 YAML file
- **Reduction**: ~86% less code in the main file

## Conclusion

This refactoring makes the codebase more maintainable, scalable, and easier to understand while preserving all existing functionality.


# Theme Management Guide

This guide explains how to manage research themes and projects on the website.

## Architecture

The website uses a data-driven architecture with object-oriented JavaScript modules to manage research themes:

- **`Project` class**: Represents individual research projects (`assets/js/modules/components/project.js`)
- **`ResearchTheme` class**: Represents research themes containing multiple projects (`assets/js/modules/components/research-theme.js`)
- **`ThemeManager` class**: Manages all themes and user interactions (`assets/js/modules/components/theme-manager.js`)

## Adding a New Project

Projects are managed through data files, not directly in JavaScript. To add a new project:

### 1. Edit `_data/projects.yml`

Add your project to the projects list:

```yaml
- id: your-project-id
  title: Your Project Title
  description: Brief project description
  url: /projects/your-project-url  # or null if no page
  image: /projects/images/thumbnail.png  # or null if no image
  status: completed  # completed, ongoing, or potential
  themes:
    - theme-id-1  # Can belong to multiple themes
    - theme-id-2
```

### 2. Project Status Types

- **`completed`**: Finished projects with published results
- **`ongoing`**: Current research in progress
- **`potential`**: Future research directions or ideas

The theme statistics are automatically calculated from the projects data.

## Adding a New Theme

To add an entirely new research theme:

### 1. Update `_data/research_themes.yml`

Add a new theme entry:

```yaml
- id: new-theme-id
  title: Your Theme Title
  description: Brief description of the theme
  icon: /assets/icons/themes/new-theme.svg
```

### 2. Create Theme Icon

Create an SVG icon at `/assets/icons/themes/new-theme.svg` (100x100 viewBox recommended).

### 3. Add Projects

Add projects to `_data/projects.yml` with the new theme ID in the `themes` array.

### 4. (Optional) Add Custom Theme Colors

Add custom hover colors in `assets/css/components/theme-grid.css`:

```css
.theme-block[data-theme="new-theme-id"]:hover {
    border-color: rgba(YOUR, COLOR, HERE, 0.8);
    box-shadow: 0 15px 40px rgba(YOUR, COLOR, HERE, 0.4);
}

.theme-block[data-theme="new-theme-id"] .theme-icon {
    color: #YOUR-COLOR;
}
```

The theme will automatically appear on the homepage, and statistics will be calculated from the projects data.

## Current Themes

### 1. Superconducting Qubit Simulation (`superconducting`)
- Color: Blue (#5d8fb3)
- Focus: Circuit simulation, fluxonium design, FEA

### 2. Quantum Error Correction (`qec`)
- Color: Light Blue (#89CFF0)
- Focus: Hardware-aware QEC, measurement-free protocols, erasure codes

### 3. Tensor Networks (`tensor`)
- Color: Purple (#9c59b6)
- Focus: Tensor network methods for simulation and optimization

### 4. Neural Networks (`neural`)
- Color: Gold (#f1c40f)
- Focus: ML applications in quantum computing

## Styling Guidelines

### Theme Icons
- SVG format, 100x100 viewBox
- Use simple, recognizable symbols
- Match the theme's subject matter

### Color Scheme
- Primary: #5d8fb3 (Blue)
- Secondary: #89CFF0 (Light Blue)
- Accent 1: #9c59b6 (Purple)
- Accent 2: #f1c40f (Gold)
- Success: #2ecc71 (Green) for completed projects
- Warning: #f1c40f (Gold) for ongoing projects
- Info: #9b59b6 (Purple) for potential projects

## Best Practices

1. **Keep descriptions concise**: 1-2 sentences for theme blocks
2. **Use high-quality images**: Thumbnails should be at least 300x200px
3. **Update project counts**: The system auto-counts, but update the HTML display numbers
4. **Maintain consistency**: Use similar language patterns across themes
5. **Test responsiveness**: Check mobile, tablet, and desktop views

## Maintenance

- Regularly update project statuses as work progresses in `_data/projects.yml`
- Archive completed projects by changing their status
- Remove outdated potential projects
- Theme statistics are automatically calculated - no manual updates needed

## Troubleshooting

### Theme not expanding
- Check that the theme ID matches in `research_themes.yml`, `index.md`, and CSS
- Verify `themeManager` is initialized in the browser console
- Check browser console for JavaScript errors
- Ensure `data-action="expand-theme"` and `data-action-param` are set correctly

### Styling issues
- Clear browser cache
- Rebuild Jekyll site: `bundle exec jekyll build`
- Check CSS specificity if custom styles aren't applying
- Verify CSS files are loading in correct order

### Projects not displaying
- Verify project is added to `_data/projects.yml` with correct theme ID in `themes` array
- Check that the theme ID matches between `research_themes.yml` and `projects.yml`
- Ensure project data is properly formatted (YAML syntax)
- Rebuild Jekyll site to regenerate `projects-data.json`

### Statistics not updating
- Statistics are auto-calculated from `projects.yml`
- Rebuild Jekyll site: `bundle exec jekyll build`
- Check `_plugins/theme_stats_generator.rb` is working correctly



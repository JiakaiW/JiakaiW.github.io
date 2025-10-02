# Theme Management Guide

This guide explains how to manage research themes and projects on the website.

## Architecture

The website uses an object-oriented JavaScript architecture to manage research themes:

- **`Project` class**: Represents individual research projects
- **`ResearchTheme` class**: Represents research themes containing multiple projects
- **`ThemeManager` class**: Manages all themes and user interactions

## Adding a New Project

To add a new project to an existing theme, edit `/assets/js/home.js`:

### 1. Locate the `initializeThemes()` method in the `ThemeManager` class

### 2. Find the appropriate theme and add a new project

```javascript
// Example: Adding a project to the Superconducting theme
scTheme.addProject(new Project(
    'Project Title',                    // Title
    'Brief project description',        // Description
    '/projects/project-url',            // URL (or null if no page)
    '/projects/images/thumbnail.png',   // Image (or null if no image)
    'completed'                          // Status: 'completed', 'ongoing', or 'potential'
));
```

### Project Status Types

- **`completed`**: Finished projects with published results
- **`ongoing`**: Current research in progress
- **`potential`**: Future research directions or ideas

## Adding a New Theme

To add an entirely new research theme:

### 1. Update `/index.md`

Add a new theme block in the theme grid:

```html
<div class="theme-block" data-theme="new-theme-id" onclick="expandTheme('new-theme-id')">
    <div class="theme-icon">
        <!-- Add SVG icon here -->
    </div>
    <h3 class="theme-title">Your Theme Title</h3>
    <p class="theme-description">
        Brief description of the theme
    </p>
    <div class="theme-stats">
        <span class="stat"><strong>0</strong> Completed Projects</span>
        <span class="stat"><strong>0</strong> Ongoing Directions</span>
    </div>
</div>
```

### 2. Update `/assets/js/home.js`

Add the theme initialization in the `initializeThemes()` method:

```javascript
const newTheme = new ResearchTheme(
    'new-theme-id',
    'Your Theme Title',
    'Detailed description of the theme'
);

// Add projects
newTheme.addProject(new Project(...));

// Register the theme
this.themes.set('new-theme-id', newTheme);
```

### 3. (Optional) Add custom theme colors in `/assets/css/home.css`

```css
.theme-block[data-theme="new-theme-id"]:hover {
    border-color: rgba(YOUR, COLOR, HERE, 0.8);
    box-shadow: 0 15px 40px rgba(YOUR, COLOR, HERE, 0.4);
}

.theme-block[data-theme="new-theme-id"] .theme-icon {
    color: #YOUR-COLOR;
}
```

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

- Regularly update project statuses as work progresses
- Archive completed projects by changing their status
- Remove outdated potential projects
- Update theme statistics in the HTML when adding/removing projects

## Troubleshooting

### Theme not expanding
- Check that the theme ID matches in HTML, JavaScript, and CSS
- Verify `themeManager` is initialized in the console
- Check browser console for JavaScript errors

### Styling issues
- Clear browser cache
- Rebuild Jekyll site: `bundle exec jekyll build`
- Check CSS specificity if custom styles aren't applying

### Projects not displaying
- Verify project is added in `initializeThemes()`
- Check that the theme ID is correct
- Ensure project data is properly formatted



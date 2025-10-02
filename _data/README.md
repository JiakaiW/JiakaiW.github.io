# Data Files

This folder contains YAML data files that are used throughout the site.

## research_themes.yml

Defines the research themes displayed on the home page.

### Structure:

```yaml
- id: theme-id              # Unique identifier (used in CSS and JS)
  title: Theme Title        # Display title
  description: Description  # Theme description
  icon: /path/to/icon.svg  # Path to SVG icon file
  stats:
    completed: 0            # Number of completed projects
    ongoing: 0              # Number of ongoing projects
    potential: 0            # Number of potential projects
```

### Adding a New Theme:

1. Create an SVG icon in `/assets/icons/themes/your-theme.svg`
2. Add a new entry to `research_themes.yml` with the above structure
3. Add project data in `/assets/js/home.js` in the `initializeThemes()` method
4. (Optional) Add theme-specific hover colors in `/assets/css/home.css`

### Editing Existing Themes:

Simply edit the YAML file - changes will be reflected automatically on the next build.

## Benefits of This Structure:

- **Separation of Concerns**: Data, styling, and logic are separated
- **Easy to Maintain**: Edit theme info without touching HTML
- **Reusable Icons**: SVG files can be used elsewhere
- **Version Control Friendly**: Clean diffs when making changes


# Quick Start: Data-Driven Content Management

## 🎯 Goal
Add or modify research projects and themes **without touching any code**.

## ✅ What's Been Set Up

Your website now has a **fully data-driven architecture**:

- ✨ All projects defined in `_data/projects.yml`
- 🎨 All themes defined in `_data/research_themes.yml`
- 📊 **Stats auto-calculate** from project data
- 🔄 Jekyll auto-generates JSON API
- 📱 JavaScript dynamically loads content

## 🚀 Common Tasks

### Add a New Project

1. Open `_data/projects.yml`
2. Add entry:

```yaml
- id: my-new-project          # Unique ID (kebab-case)
  title: My New Project       # Display name
  description: Brief description of what this project does
  url: /projects/my-project   # Link to project page (or null)
  image: /path/to/image.png   # Thumbnail image (or null)
  status: completed           # completed | ongoing | potential
  themes:                     # Which themes this belongs to
    - superconducting
    - qec
```

3. Save file
4. Build: `bundle exec jekyll build`
5. Done! Stats automatically update.

### Update Project Status

Change the `status` field:
- `ongoing` → `completed` when work finishes
- `potential` → `ongoing` when starting work
- `completed` → stays completed

Stats update automatically on next build.

### Add a New Theme

1. Create SVG icon: `/assets/icons/themes/my-theme.svg`

2. Add to `_data/research_themes.yml`:
```yaml
- id: my-theme
  title: My New Theme
  description: One-sentence description
  icon: /assets/icons/themes/my-theme.svg
```

3. Tag projects with `my-theme` in their `themes` array

4. (Optional) Add custom colors in `/assets/css/home.css`:
```css
.theme-block[data-theme="my-theme"]:hover {
    background: linear-gradient(135deg, 
        rgba(255, 100, 150, 0.28) 0%, 
        rgba(137, 207, 240, 0.15) 50%,
        rgba(46, 46, 46, 0.18) 100%);
}

.theme-block[data-theme="my-theme"] .theme-icon {
    color: #ff6496;
}
```

### Change Theme Description

Edit `_data/research_themes.yml` - changes apply immediately on next build.

### Remove a Project

Delete or comment out its entry in `_data/projects.yml`. Stats auto-update.

## 📁 File Structure

```
_data/
├── projects.yml           ← All project data (edit this!)
└── research_themes.yml    ← Theme metadata (edit this!)

_plugins/
└── theme_stats_generator.rb  ← Auto-calculates stats (don't edit)

assets/
├── icons/themes/         ← SVG icons for themes
├── js/home.js           ← Loads projects from JSON
└── css/home.css         ← Styling (optional edits)

projects-data.json        ← Auto-generated API (don't edit)
```

## 🔍 How It Works

1. **Edit YAML** → You update `projects.yml` or `research_themes.yml`
2. **Jekyll Build** → Plugin calculates stats, generates JSON
3. **Page Load** → JavaScript fetches JSON, renders dynamically
4. **Stats Update** → Counts are always accurate automatically

## 📊 Current Stats (Auto-Calculated)

Based on your current `projects.yml`:

- **Superconducting**: 2 completed, 1 ongoing, 1 potential
- **QEC**: 2 completed, 1 ongoing, 3 potential
- **Tensor Networks**: 0 completed, 0 ongoing, 2 potential
- **Neural Networks**: 0 completed, 1 ongoing, 2 potential

## ✨ Benefits

### Before (Hardcoded)
```javascript
// Had to edit JavaScript file
scTheme.addProject(new Project(
    'Fluxonium Erasure',
    'Description...',
    '/projects/fluxonium_erasure',
    '/projects/fluxonium_erasure/images/lvl_diagram.png',
    'completed'
));
// Stats manually updated in YAML
```

### After (Data-Driven)
```yaml
# Just edit YAML file
- id: fluxonium-erasure
  title: Fluxonium Erasure
  description: Description...
  url: /projects/fluxonium_erasure
  image: /projects/fluxonium_erasure/images/lvl_diagram.png
  status: completed
  themes:
    - superconducting
# Stats automatically calculated!
```

## 🔄 Workflow

### Standard Update
1. Edit `_data/projects.yml`
2. Run `bundle exec jekyll build`
3. Refresh browser
4. Done!

### With Live Reload
1. Run `bundle exec jekyll serve`
2. Edit YAML files
3. Page auto-refreshes
4. See changes immediately

## 🐛 Troubleshooting

### Stats not updating?
1. Rebuild: `bundle exec jekyll build`
2. Check browser console for errors
3. Verify `projects-data.json` was generated

### Project not showing?
1. Check YAML syntax (use YAML validator)
2. Verify `themes` array is not empty
3. Ensure `status` is valid: `completed`, `ongoing`, or `potential`

### Theme not appearing?
1. Check icon file exists
2. Verify at least one project has this theme
3. Rebuild site

## 📚 Full Documentation

- [DATA_DRIVEN_ARCHITECTURE.md](DATA_DRIVEN_ARCHITECTURE.md) - Complete guide
- [_data/README.md](_data/README.md) - Data files overview
- [MODULAR_THEMES.md](MODULAR_THEMES.md) - Theme structure

## 💡 Pro Tips

1. **Multi-theme projects**: Projects can belong to multiple themes
2. **No page needed**: Use `url: null` for potential projects
3. **No image**: Use `image: null` if no thumbnail available
4. **Consistent IDs**: Use kebab-case for IDs (e.g., `my-project`)
5. **Short descriptions**: Keep under 200 characters for best display

## 🎉 You're Done!

You now have a fully data-driven website. Add projects by editing YAML files - no code changes needed!


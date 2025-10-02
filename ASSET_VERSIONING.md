# Asset Versioning for Jekyll Website

This document explains the asset versioning system implemented to prevent browser caching issues and ensure users always see the latest version of your website.

## Overview

The asset versioning system automatically appends version parameters to static assets (CSS, JavaScript, images, etc.) based on their content hash. This ensures that when you update any asset, browsers will fetch the new version instead of using cached content.

## How It Works

### 1. Automatic Versioning
- **Content-based hashing**: Uses MD5 hash of file content to generate unique version parameters
- **Jekyll integration**: Leverages Jekyll's built-in `asset_url` filter for reliable versioning
- **Zero maintenance**: No manual version number management required

### 2. Configuration
The system is controlled by settings in `_config.yml`:

```yaml
# Asset versioning configuration
asset_versioning: true
asset_cache_bust: true
```

### 3. Implementation
Assets are referenced using Liquid filters instead of direct paths:

**Before (hardcoded paths):**
```html
<link rel="stylesheet" href="/assets/css/style.css">
<script src="/assets/js/main.js"></script>
```

**After (versioned paths):**
```html
<link rel="stylesheet" href="{{ '/assets/css/style.css' | asset_hash_versioned }}">
<script src="{{ '/assets/js/main.js' | asset_hash_versioned }}"></script>
```

## Available Filters

### Primary Filter
- `asset_hash_versioned` - Main filter for all asset types (recommended)
  - Uses content-based MD5 hash for reliable cache busting
  - Only changes when file content actually changes
  - Provides 8-character hash for clean URLs

### Alternative Filters
- `asset_versioned` - Uses timestamp-based versioning
  - Updates on every build regardless of content changes
  - Useful for development/testing scenarios

## Files Updated

The following files have been updated to use asset versioning:

### Templates
- `_includes/head.html` - CSS and favicon references
- `_layouts/default.html` - JavaScript references
- `_includes/navigation.html` - Resume PDF and search icon
- `_includes/footer.html` - Social media icons
- `index.md` - Home page specific assets

### Configuration
- `_config.yml` - Added versioning configuration
- `_plugins/asset_versioning.rb` - Custom Liquid filters

## Benefits

1. **Automatic Cache Busting**: No manual intervention needed
2. **Content-Based**: Only changes when file content actually changes
3. **Performance**: Long-term caching for unchanged assets
4. **Reliability**: Uses Jekyll's proven asset handling
5. **Maintainability**: Single configuration controls entire system

## Example Output

When enabled, asset URLs will look like:
```
/assets/css/style.css?v=db730cc6c
/assets/js/main.js?v=244a5d650
/assets/images/logo.png?v=45609868e
```

The version parameters are content-based MD5 hashes that only change when the file content changes.

## Disabling Versioning

To disable asset versioning, set in `_config.yml`:
```yaml
asset_versioning: false
asset_cache_bust: false
```

## Testing

To verify versioning is working:

1. **Build the site**: `jekyll build`
2. **Check output**: Look for versioned URLs in `_site/` files
3. **Browser testing**: Use developer tools to verify new assets are fetched
4. **Content changes**: Modify an asset and rebuild to see version change

## Troubleshooting

### Common Issues

1. **Assets not loading**: Check that paths start with `/` in filter calls
2. **Version not updating**: Ensure `asset_versioning: true` in config
3. **Build errors**: Verify all asset files exist at specified paths

### Debug Mode

Add to `_config.yml` for debugging:
```yaml
asset_versioning: true
asset_cache_bust: true
debug: true
```

## Best Practices

1. **Use `asset_url_versioned`** for most cases
2. **Test after changes** to ensure versioning works
3. **Keep assets organized** in logical directory structure
4. **Monitor build times** as versioning adds processing overhead
5. **Use CDN-friendly** versioning for production deployments

## Future Enhancements

Potential improvements:
- CDN integration
- Service worker cache management
- Asset bundling and minification
- Progressive loading strategies

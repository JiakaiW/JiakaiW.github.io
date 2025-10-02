# Jekyll plugin to automatically calculate and inject project stats into research themes
# This ensures stats are always in sync with the projects.yml data

Jekyll::Hooks.register :site, :pre_render do |site|
  # Get projects and themes data
  projects = site.data['projects'] || []
  themes = site.data['research_themes'] || []
  
  # Calculate stats for each theme
  themes.each do |theme|
    theme_id = theme['id']
    
    # Count projects for this theme
    completed = projects.count { |p| p['themes']&.include?(theme_id) && p['status'] == 'completed' }
    ongoing = projects.count { |p| p['themes']&.include?(theme_id) && p['status'] == 'ongoing' }
    potential = projects.count { |p| p['themes']&.include?(theme_id) && p['status'] == 'potential' }
    
    # Inject stats into theme
    theme['stats'] = {
      'completed' => completed,
      'ongoing' => ongoing,
      'potential' => potential
    }
  end
  
  # Log stats for debugging (optional)
  Jekyll.logger.info "Theme Stats:", "Auto-calculated project counts for #{themes.length} themes"
end


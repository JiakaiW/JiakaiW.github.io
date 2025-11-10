# frozen_string_literal: true

source "https://rubygems.org"

# Use Jekyll 4.x for local development
# GitHub Actions will use its own dependencies via actions/jekyll-build-pages@v1
gem "jekyll", "~> 4.2"

group :jekyll_plugins do
  gem "jekyll-timeago", "~> 0.13.1"
end

# Required for GitHub Pages compatibility (used by github-pages gem)
gem "faraday-retry", "~> 2.3"

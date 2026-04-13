---
layout: default
title: Research
permalink: /research/
---
<link rel="stylesheet" href="{{ '/assets/css/components/card-overlay.css' | asset_hash_versioned }}">
<link rel="stylesheet" href="{{ '/assets/css/components/theme-grid.css' | asset_hash_versioned }}">
<link rel="stylesheet" href="{{ '/assets/css/pages/research.css' | asset_hash_versioned }}">

<div class="research-page">
  <div class="research-page-header">
    <h1>Research</h1>
    <p class="research-page-subtitle">Quantum hardware theory — superconducting device physics, error correction, tensor networks, and machine learning.</p>
  </div>

  {% for theme in site.data.research_themes %}
  <section id="{{ theme.id }}" class="research-theme-section">
    <div class="research-theme-header">
      <div class="research-theme-icon" data-theme="{{ theme.id }}">
        {% assign icon_filename = theme.icon | split: '/' | last %}
        {% if icon_filename == 'superconducting.svg' %}{% include icons/themes/superconducting.svg %}
        {% elsif icon_filename == 'qec.svg' %}{% include icons/themes/qec.svg %}
        {% elsif icon_filename == 'tensor.svg' %}{% include icons/themes/tensor.svg %}
        {% elsif icon_filename == 'neural.svg' %}{% include icons/themes/neural.svg %}
        {% endif %}
      </div>
      <div class="research-theme-meta">
        <h2>{{ theme.title }}</h2>
        <p class="theme-description">{{ theme.description }}</p>
        {% if theme.stats %}
        <div class="theme-stats">
          {% if theme.stats.completed > 0 %}<span class="stat"><strong>{{ theme.stats.completed }}</strong> Completed</span>{% endif %}
          {% if theme.stats.ongoing > 0 %}<span class="stat"><strong>{{ theme.stats.ongoing }}</strong> Ongoing</span>{% endif %}
          {% if theme.stats.potential > 0 %}<span class="stat"><strong>{{ theme.stats.potential }}</strong> Potential</span>{% endif %}
        </div>
        {% endif %}
      </div>
    </div>
    <div class="projects-grid">
      {% for p in site.data.projects %}
        {% if p.themes contains theme.id %}
        <div class="project-item status-{{ p.status }}">
          {% if p.image %}<img class="project-thumbnail" src="{{ p.image }}" alt="{{ p.title }}" loading="lazy">{% endif %}
          <div class="project-content">
            <span class="project-badge {{ p.status }}">{{ p.status }}</span>
            <h4>{{ p.title }}</h4>
            <p>{{ p.description }}</p>
            {% if p.url %}<a href="{{ p.url }}" class="project-link">View project →</a>{% endif %}
          </div>
        </div>
        {% endif %}
      {% endfor %}
    </div>
  </section>
  {% endfor %}
</div>

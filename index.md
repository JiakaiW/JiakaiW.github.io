---
layout: default
title: Home
---

<!-- Home page component styles -->
<link rel="stylesheet" href="{{ '/assets/css/components/bento-hero.css' | asset_hash_versioned }}">
<link rel="stylesheet" href="{{ '/assets/css/components/card-overlay.css' | asset_hash_versioned }}">
<link rel="stylesheet" href="{{ '/assets/css/components/news-section.css' | asset_hash_versioned }}">
<link rel="stylesheet" href="{{ '/assets/css/pages/timeline.css' | asset_hash_versioned }}">
<script src="{{ '/assets/js/home.js' | asset_hash_versioned }}" type="module" defer></script>
<script src="{{ '/assets/js/timeline-modular.js' | asset_hash_versioned }}" type="module" defer></script>

{% include components/glass-filters.html %}

<div class="bento-hero">
    <div class="bento-bio">
        <div class="bento-bio-photo-block">
            <img class="bio-photo" src="/photo-grid/images/me.jpg" alt="Jiakai Wang">
        </div>
        <div class="bento-bio-content">
            <h1>Jiakai Wang</h1>
            <p class="bento-title">Physics PhD @ UW-Madison</p>
            <p class="bento-keywords">Quantum hardware theory · Quantum error correction · Tensor networks · Neural networks</p>
        </div>
        <div class="bento-advisor">
            <a href="https://mvavilov.github.io/" target="_blank">
                <img class="advisor-photo" src="/photo-grid/images/vavilov.jpg" alt="Prof. Maxim Vavilov">
            </a>
            <div class="advisor-text">
                <a class="advisor-name-link" href="https://mvavilov.github.io/" target="_blank">Prof. Maxim Vavilov</a>
                <p class="advisor-hiring-note">is actively hiring <span class="hiring-emphasis">highly motivated students!</span></p>
            </div>
        </div>
    </div>
    <div class="bento-themes-grid">
        {% for theme in site.data.research_themes %}
        <a class="theme-tile" href="/research/#{{ theme.id }}" data-theme="{{ theme.id }}">
            <div class="tile-icon">
                {% assign icon_filename = theme.icon | split: '/' | last %}
                {% if icon_filename == 'superconducting.svg' %}{% include icons/themes/superconducting.svg %}
                {% elsif icon_filename == 'qec.svg' %}{% include icons/themes/qec.svg %}
                {% elsif icon_filename == 'tensor.svg' %}{% include icons/themes/tensor.svg %}
                {% elsif icon_filename == 'neural.svg' %}{% include icons/themes/neural.svg %}
                {% endif %}
            </div>
            <span class="tile-title">{{ theme.title }}</span>
            <span class="tile-arrow">→</span>
        </a>
        {% endfor %}
    </div>
</div>


<section class="news-section">
    <h2 class="section-title">News & Updates</h2>
    <div class="news-container" id="newsContainer">
        <!-- News items will be loaded here by JavaScript -->
        <p class="loading-message">Loading news...</p>
    </div>
</section>

<section class="timeline-section">
    <div id="timeline-widget"></div>
</section>

{% include_relative photo-grid/gallery.md %}

---
layout: default
title: Home
---

<!-- Home page component styles -->
<link rel="stylesheet" href="{{ '/assets/css/components/intro-section.css' | asset_hash_versioned }}">
<link rel="stylesheet" href="{{ '/assets/css/components/card-overlay.css' | asset_hash_versioned }}">
<link rel="stylesheet" href="{{ '/assets/css/components/theme-grid.css' | asset_hash_versioned }}">
<link rel="stylesheet" href="{{ '/assets/css/components/news-section.css' | asset_hash_versioned }}">
<link rel="stylesheet" href="{{ '/assets/css/pages/timeline.css' | asset_hash_versioned }}">
<script src="{{ '/assets/js/home.js' | asset_hash_versioned }}" type="module" defer></script>
<script src="{{ '/assets/js/timeline-modular.js' | asset_hash_versioned }}" type="module" defer></script>

{% include components/glass-filters.html %}

<div class="intro-container">
    <div class="intro-image intro-image-left">
        <img src="/photo-grid/images/me.jpg" alt=" " />
        <p class="image-caption">During the superconductivity summer school at UMN we went to Minnehaha Falls and I got mud all over myself.</p>
    </div>
    <div class="intro-content">
        <h1>👋 I'm Jiakai Wang</h1>
        <h2>Physics Ph.D @ UW-Madison</h2>
        <h3>Quantum hardware theory<br>Quantum error correction<br>Tensor/neural networks</h3>
    </div>
    <div class="intro-image intro-image-right">
        <a href="https://mvavilov.github.io/" target="_blank"><img src="/photo-grid/images/vavilov.jpg" alt=" " /></a>
        <p class="image-caption"><a href="https://mvavilov.github.io/" target="_blank" style="color:rgb(206, 231, 255); text-decoration: none; font-weight: bold;">Prof. Maxim Vavilov</a> who I work with on superconducting-qubits, QEC and stuff. <br><strong style="color: #e74c3c; font-size: 20px;">Actively hiring students!</strong></p>
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

<section class="research-themes">
    <h2 class="section-title">Research Themes</h2>
    
    <div class="theme-grid">
        {% for theme in site.data.research_themes %}
            {% include components/theme-block.html theme=theme %}
        {% endfor %}
    </div>
</section>


{% include_relative photo-grid/gallery.md %}

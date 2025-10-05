---
layout: default
title: Home
---

<link rel="stylesheet" href="{{ '/assets/css/home.css' | asset_hash_versioned }}">
<script src="{{ '/assets/js/home.js' | asset_hash_versioned }}" defer></script>

<!-- SVG Filters for Liquid Glass Effect -->
<svg style="position: absolute; width: 0; height: 0;" aria-hidden="true">
    <defs>
        <filter id="liquid-glass-filter">
            <!-- Blur for depth -->
            <feGaussianBlur in="SourceGraphic" stdDeviation="0.5" result="blur"/>
            <!-- Displacement for refraction -->
            <feTurbulence type="fractalNoise" baseFrequency="0.01" numOctaves="2" result="turbulence"/>
            <feDisplacementMap in="blur" in2="turbulence" scale="3" xChannelSelector="R" yChannelSelector="G" result="displacement"/>
            <!-- Lighting for depth -->
            <feDiffuseLighting in="displacement" surfaceScale="1" diffuseConstant="0.8" result="lighting">
                <feDistantLight azimuth="45" elevation="60"/>
            </feDiffuseLighting>
            <feComposite in="SourceGraphic" in2="lighting" operator="arithmetic" k1="1" k2="0" k3="0" k4="0"/>
        </filter>
    </defs>
</svg>

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
    <h2 class="section-title">Latest News & Updates</h2>
    <div class="news-container" id="newsContainer">
        <!-- News items will be loaded here by JavaScript -->
        <p class="loading-message">Loading news...</p>
    </div>
</section>

<section class="research-themes">
    <h2 class="section-title">Research Themes</h2>
    
    <div class="theme-grid">
        {% for theme in site.data.research_themes %}
        <div class="theme-block" data-theme="{{ theme.id }}" onclick="expandTheme('{{ theme.id }}')">
            <div class="theme-info">
                <div class="theme-icon">
                    {% include_relative {{ theme.icon }} %}
                </div>
                <h3 class="theme-title">{{ theme.title }}</h3>
                <p class="theme-description">{{ theme.description }}</p>
                <div class="theme-stats">
                    {% if theme.stats.completed > 0 %}
                    <span class="stat"><strong>{{ theme.stats.completed }}</strong> Completed</span>
                    {% endif %}
                    {% if theme.stats.ongoing > 0 %}
                    <span class="stat"><strong>{{ theme.stats.ongoing }}</strong> Ongoing</span>
                    {% endif %}
                    {% if theme.stats.potential > 0 %}
                    <span class="stat"><strong>{{ theme.stats.potential }}</strong> Potential</span>
                    {% endif %}
                </div>
            </div>
            <div id="{{ theme.id }}-preview"></div>
        </div>
        {% endfor %}
    </div>
</section>


{% include_relative photo-grid/gallery.md %}

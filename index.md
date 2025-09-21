---
layout: default
title: Home
---

<link rel="stylesheet" href="/assets/css/home.css">
<script src="/assets/js/home.js" defer></script>

<div class="intro-container">
    <div class="intro-image">
        <img src="/photo-grid/images/me.jpg" alt=" " />
    </div>
    <div class="intro-content">
        <h1>👋 I'm Jiakai Wang</h1>
        <h2>I'm interested in superconducting qubit systems. </h2>
        <div class="tags">
            <span class="tag">Superconducting circuits finite element simulation</span>
            <span class="tag">HPC</span>
            <span class="tag">Cleanroom Fabrication</span>
            <span class="tag">Hardware-aware QEC</span>
        </div>
    </div>
</div>

{% include_relative projects/featured.md %}

{% include_relative photo-grid/gallery.md %}

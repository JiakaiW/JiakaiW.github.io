---
layout: default
title: Home
---

<link rel="stylesheet" href="{{ '/assets/css/home.css' | asset_hash_versioned }}">
<script src="{{ '/assets/js/home.js' | asset_hash_versioned }}" defer></script>

<div class="intro-container">
    <div class="intro-image">
        <img src="/photo-grid/images/me.jpg" alt=" " />
        <p class="image-caption">During the superconductivity summer school at UMN we went to Minnehaha Falls and I got mud all over myself.</p>
    </div>
    <div class="intro-content">
        <h1>👋 I'm Jiakai Wang</h1>
        <h2>Quantum Computing Researcher</h2>
        <p class="intro-description">
            I'm looking for motivated students (PhD, Master's, and undergraduates) to collaborate on cutting-edge quantum computing research. 
            Explore the research themes below to learn more about ongoing and potential projects.
        </p>
        <div class="tags">
            <span class="tag">Superconducting Circuits</span>
            <span class="tag">Quantum Error Correction</span>
            <span class="tag">High-Performance Computing</span>
            <span class="tag">Machine Learning for QC</span>
        </div>
    </div>
</div>

<section class="research-themes">
    <h2 class="section-title">Research Themes</h2>
    <p class="section-subtitle">Click on any theme to explore completed and ongoing projects</p>
    
    <div class="theme-grid">
        <!-- Theme 1: Superconducting Qubit Simulation -->
        <div class="theme-block" data-theme="superconducting" onclick="expandTheme('superconducting')">
            <div class="theme-icon">
                <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" stroke-width="3"/>
                    <circle cx="50" cy="50" r="20" fill="none" stroke="currentColor" stroke-width="2"/>
                    <circle cx="50" cy="50" r="10" fill="none" stroke="currentColor" stroke-width="2"/>
                    <path d="M 50 20 L 50 5" stroke="currentColor" stroke-width="2"/>
                    <path d="M 50 80 L 50 95" stroke="currentColor" stroke-width="2"/>
                    <path d="M 20 50 L 5 50" stroke="currentColor" stroke-width="2"/>
                    <path d="M 80 50 L 95 50" stroke="currentColor" stroke-width="2"/>
                </svg>
            </div>
            <h3 class="theme-title">Superconducting Qubit Simulation</h3>
            <p class="theme-description">
                Finite element simulation of superconducting circuits, fluxonium design, and device characterization
            </p>
            <div id="superconducting-preview"></div>
            <div class="theme-stats">
                <span class="stat"><strong>2</strong> Completed Projects</span>
                <span class="stat"><strong>3</strong> Ongoing Directions</span>
            </div>
        </div>

        <!-- Theme 2: Quantum Error Correction -->
        <div class="theme-block" data-theme="qec" onclick="expandTheme('qec')">
            <div class="theme-icon">
                <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                    <rect x="15" y="15" width="70" height="70" fill="none" stroke="currentColor" stroke-width="3" rx="5"/>
                    <path d="M 35 50 L 45 60 L 65 35" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
                    <circle cx="25" cy="25" r="3" fill="currentColor"/>
                    <circle cx="75" cy="25" r="3" fill="currentColor"/>
                    <circle cx="25" cy="75" r="3" fill="currentColor"/>
                    <circle cx="75" cy="75" r="3" fill="currentColor"/>
                </svg>
            </div>
            <h3 class="theme-title">Quantum Error Correction</h3>
            <p class="theme-description">
                Hardware-aware QEC schemes, measurement-free protocols, and erasure-based error correction
            </p>
            <div id="qec-preview"></div>
            <div class="theme-stats">
                <span class="stat"><strong>2</strong> Completed Projects</span>
                <span class="stat"><strong>2</strong> Ongoing Directions</span>
            </div>
        </div>

        <!-- Theme 3: Tensor Networks -->
        <div class="theme-block" data-theme="tensor" onclick="expandTheme('tensor')">
            <div class="theme-icon">
                <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="25" cy="25" r="8" fill="currentColor"/>
                    <circle cx="75" cy="25" r="8" fill="currentColor"/>
                    <circle cx="25" cy="75" r="8" fill="currentColor"/>
                    <circle cx="75" cy="75" r="8" fill="currentColor"/>
                    <circle cx="50" cy="50" r="8" fill="currentColor"/>
                    <line x1="25" y1="25" x2="50" y2="50" stroke="currentColor" stroke-width="2"/>
                    <line x1="75" y1="25" x2="50" y2="50" stroke="currentColor" stroke-width="2"/>
                    <line x1="25" y1="75" x2="50" y2="50" stroke="currentColor" stroke-width="2"/>
                    <line x1="75" y1="75" x2="50" y2="50" stroke="currentColor" stroke-width="2"/>
                </svg>
            </div>
            <h3 class="theme-title">Tensor Networks</h3>
            <p class="theme-description">
                Tensor network methods for quantum simulation and optimization
            </p>
            <div id="tensor-preview"></div>
            <div class="theme-stats">
                <span class="stat"><strong>0</strong> Completed Projects</span>
                <span class="stat"><strong>2</strong> Potential Directions</span>
            </div>
        </div>

        <!-- Theme 4: Neural Networks -->
        <div class="theme-block" data-theme="neural" onclick="expandTheme('neural')">
            <div class="theme-icon">
                <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="20" cy="30" r="6" fill="currentColor"/>
                    <circle cx="20" cy="70" r="6" fill="currentColor"/>
                    <circle cx="50" cy="20" r="6" fill="currentColor"/>
                    <circle cx="50" cy="50" r="6" fill="currentColor"/>
                    <circle cx="50" cy="80" r="6" fill="currentColor"/>
                    <circle cx="80" cy="30" r="6" fill="currentColor"/>
                    <circle cx="80" cy="70" r="6" fill="currentColor"/>
                    <line x1="26" y1="30" x2="44" y2="20" stroke="currentColor" stroke-width="1.5"/>
                    <line x1="26" y1="30" x2="44" y2="50" stroke="currentColor" stroke-width="1.5"/>
                    <line x1="26" y1="70" x2="44" y2="50" stroke="currentColor" stroke-width="1.5"/>
                    <line x1="26" y1="70" x2="44" y2="80" stroke="currentColor" stroke-width="1.5"/>
                    <line x1="56" y1="20" x2="74" y2="30" stroke="currentColor" stroke-width="1.5"/>
                    <line x1="56" y1="50" x2="74" y2="30" stroke="currentColor" stroke-width="1.5"/>
                    <line x1="56" y1="50" x2="74" y2="70" stroke="currentColor" stroke-width="1.5"/>
                    <line x1="56" y1="80" x2="74" y2="70" stroke="currentColor" stroke-width="1.5"/>
                </svg>
            </div>
            <h3 class="theme-title">Neural Networks</h3>
            <p class="theme-description">
                Machine learning applications for quantum computing, from decoder optimization to circuit design
            </p>
            <div id="neural-preview"></div>
            <div class="theme-stats">
                <span class="stat"><strong>0</strong> Completed Projects</span>
                <span class="stat"><strong>2</strong> Potential Directions</span>
            </div>
        </div>
    </div>
</section>

{% include_relative photo-grid/gallery.md %}

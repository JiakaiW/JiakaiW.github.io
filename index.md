---
layout: default
title: Home
hide_footer: true
hide_header: true
---

<link rel="stylesheet" href="{{ '/assets/css/pages/home-design.css' | asset_hash_versioned }}">
<script src="{{ '/assets/js/home-design.js' | asset_hash_versioned }}" type="module" defer></script>

<div class="jw-home">

  <!-- ── Top nav ───────────────────────────────────────────── -->
  {% include jw-topnav.html home_link="#top" link_base="" %}

  <!-- ── Hero ─────────────────────────────────────────────── -->
  <section class="jw-hero jw-main" id="top">
    <div class="jw-hero-grid">
      <div class="jw-hero-main">
        <h1 class="jw-hero-name">Jiakai Wang<span class="jw-hero-cursor"></span></h1>
        <p class="jw-hero-role"><span class="mono">Physics PhD — UW-Madison</span></p>
        <p class="jw-hero-thesis">Hamiltonian engineering and hardware-aware error correction for superconducting quantum processors.</p>

        <dl class="jw-hero-defs">
          <div>
            <dt><span class="mono muted">advisor</span></dt>
            <dd><a href="https://mvavilov.github.io/" target="_blank" rel="noopener">Prof. Maxim Vavilov ↗</a></dd>
          </div>
          <div>
            <dt><span class="mono muted">group</span></dt>
            <dd>Vavilov Group / Dept. of Physics</dd>
          </div>
          <div>
            <dt><span class="mono muted">status</span></dt>
            <dd>
              <span class="jw-availability">
                <span class="jw-blinker"></span>
                Open to summer internships.
              </span>
            </dd>
          </div>
        </dl>

        <div class="jw-hero-actions">
          <a class="btn btn-primary" href="{{ '/assets/Jiakai_resume.pdf' | asset_hash_versioned }}" target="_blank"><span class="mono">RESUME_</span></a>
          <a class="btn" href="https://github.com/JiakaiW" target="_blank" rel="noopener"><span class="mono">GITHUB_</span></a>
          <a class="btn" href="https://www.linkedin.com/in/jiakaiW/" target="_blank" rel="noopener"><span class="mono">LINKEDIN_</span></a>
          <a class="btn" href="mailto:jwang2648atwisc.edu"><span class="mono">MAIL_</span></a>
        </div>
      </div>

      <aside class="jw-hero-card">
        <div class="jw-hero-card-head">
          <span class="mono muted">PORTRAIT.PNG</span>
          <span class="mono muted">640 × 640</span>
        </div>
        <div class="jw-hero-portrait">
          <img src="/photo-grid/images/me.jpg" alt="Jiakai Wang">
        </div>
        <div class="jw-hero-card-foot">
          <div><span class="mono muted">LOC</span><div class="jw-foot-val">Madison, WI</div></div>
          <div><span class="mono muted">TZ</span><div class="jw-foot-val">UTC−5</div></div>
          <div><span class="mono muted">UPTIME</span><div class="jw-foot-val"><span class="mono accent">4y 7mo</span></div></div>
        </div>
      </aside>
    </div>
  </section>

  <!-- ── Main content ─────────────────────────────────────── -->
  <div class="jw-main">

    <!-- 01 Research -->
    <section id="research" class="jw-section">
      <header class="jw-section-head">
        <div class="jw-section-head-left">
          <span class="jw-section-index mono">01</span>
          <span class="jw-section-label mono">RESEARCH</span>
        </div>
        <div class="jw-section-aside mono muted">4 themes · 8 projects</div>
      </header>
      <h2 class="jw-section-title"><span class="jw-prompt">&gt;</span> What I work on</h2>
      <p class="jw-lead">Quantum hardware theory across four threads — superconducting qubit design, error-correction protocols, and two numerical directions I'm developing for Hamiltonian engineering: tensor networks (large-scale circuit analysis) and generative ML (qubit control). Click a theme to see what's published, in prep, or planned.</p>
      <div id="jw-theme-explorer">
        <div class="jw-explorer">
          <div class="jw-explorer-tabs"></div>
          <div class="jw-explorer-detail"></div>
        </div>
      </div>
    </section>

    <!-- 02 Timeline -->
    <section id="timeline" class="jw-section">
      <header class="jw-section-head">
        <div class="jw-section-head-left">
          <span class="jw-section-index mono">02</span>
          <span class="jw-section-label mono">TIMELINE</span>
        </div>
        <div class="jw-section-aside mono muted">gantt · 2021–2027</div>
      </header>
      <h2 class="jw-section-title"><span class="jw-prompt">&gt;</span> Project schedule</h2>
      <div class="jw-gantt" id="jw-gantt"></div>
    </section>

    <!-- 03 Publications -->
    <section id="publications" class="jw-section">
      <header class="jw-section-head">
        <div class="jw-section-head-left">
          <span class="jw-section-index mono">03</span>
          <span class="jw-section-label mono">PUBLICATIONS</span>
        </div>
        <div class="jw-section-aside mono muted">papers, talks, posters</div>
      </header>
      <h2 class="jw-section-title"><span class="jw-prompt">&gt;</span> Papers, talks, posters</h2>
      <div id="jw-publications"></div>
    </section>

    <!-- 04 Tech Docs -->
    <section id="techdocs" class="jw-section">
      <header class="jw-section-head">
        <div class="jw-section-head-left">
          <span class="jw-section-index mono">04</span>
          <span class="jw-section-label mono">TECH DOCS</span>
        </div>
        <div class="jw-section-aside mono muted" id="jw-techdocs-count">7 guides</div>
      </header>
      <h2 class="jw-section-title"><span class="jw-prompt">&gt;</span> Technical writing</h2>
      <p class="jw-lead">Guides, tutorials, and notes on tools I actually use — Blender for quantum visualization, HPC workflows, ML training infrastructure, and prompt patterns for research.</p>
      <div id="jw-techdocs"></div>
    </section>

    <!-- 05 Updates -->
    <section id="updates" class="jw-section jw-section-tight">
      <header class="jw-section-head">
        <div class="jw-section-head-left">
          <span class="jw-section-index mono">05</span>
          <span class="jw-section-label mono">UPDATES</span>
        </div>
        <div class="jw-section-aside mono muted">git log --oneline</div>
      </header>
      <h2 class="jw-section-title"><span class="jw-prompt">&gt;</span> Recent signal</h2>
      <div id="jw-news"></div>
    </section>

  </div><!-- /jw-main -->

  <!-- ── Footer ────────────────────────────────────────────── -->
  {% include jw-footer.html %}


</div><!-- /jw-home -->

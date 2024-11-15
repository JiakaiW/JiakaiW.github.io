---
layout: default
title: Home
---

# 👋 I'm Jiakai Wang

Master of Physics @ UW-Madison (2024-2025), previously Data Science @ UW-Madison (2021-2024), Software Engineering @ South China Univ of Tech (2019-2021)

<div class="tags">
    <span class="tag">🔬 Quantum Computing</span>
    <span class="tag">🛠️ Quantum Error Correction Codes</span>
    <span class="tag">🛡️ Fault-Tolerant Quantum Computing</span>
    <span class="tag">🔭 Atomic Molecular & Optical physics</span>
    <span class="tag">📊 Statistics</span>
    <span class="tag">🤖 Machine Learning</span>
    <span class="tag">💻 CPU/GPU HPC</span>
    <span class="tag">🧠 LLM prompt engineering</span>
    <span class="tag">🎨 Blender</span> <!-- Changed emoji to a paint palette -->
</div>

<style>
  .tags {
    margin-top: 1em;
    display: flex;
    flex-wrap: wrap; /* Allow tags to wrap to the next line */
  }
  .tag {
    background-color: #5d8fb3; /* Change background color to #5d8fb3 */
    color: white;
    padding: 0.5em;
    border-radius: 7.5px;
    margin: 0.5em; /* Add margin to prevent overlap */
    display: inline-block;
  }
  .dark-mode .tag {
    background-color: #333; /* Change background color to dark grey in dark mode */
  }
</style>

# Featured Projects

<div class="card-container">
    <a href="/past_projects/fluxonium_erasure/" class="card">
        <div class="card-image">
            <img src="/files/2024/JJ_Chain.png" alt="Superconducting Qubits">
        </div>
        <div class="card-text">
            Single-mode fluxonium artificial atom as erasure qubit
        </div>
    </a>
    <a href="/past_projects/mfqec/" class="card">
        <div class="card-image">
            <img src="/files/2023/circ_simple.png" alt="QEC">
        </div>
        <div class="card-text">
            Measurement-free Steane code for neutral atoms
        </div>
    </a>
    <a href="/past_projects/hpc/" class="card">
        <div class="card-image">
            <img src="/files/HTCHPC.jpg" alt="QEC">
        </div>
        <div class="card-text">
            High-performance packages to facilitate research
        </div>
    </a>
</div>

<style>
  .card-container {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 1em;
    margin-top: 2em;
  }
  .card {
    background-color: #d3d3d3; /* Match header/footer background color */
    color: black; /* Change text color to black in light mode */
    border-radius: 30px;
    overflow: hidden;
    text-decoration: none;
    width: 300px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .card-image {
    width: 100%;
    height: 200px;
    overflow: hidden;
  }
  .card-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 0; /* Override round edges for images */
  }
  .card-text {
    padding: 0.5em; /* Reduce padding */
    text-align: center;
    color: black; /* Ensure text color is black in light mode */
  }
  .dark-mode .card {
    background-color: #333;
  }
  .dark-mode .card-text {
    color: white; /* Ensure text color is white in dark mode */
  }
</style>

# Research interests:

<div class="card-container">
    <a href="/potential_directions/agents/" class="card">
        <div class="card-image">
            <img src="/files/agents.png" alt="agents">
        </div>
        <div class="card-text">
            LLM prompt engineering
        </div>
    </a>
    <a href="/potential_directions/ftqc/" class="card">
        <div class="card-image">
            <img src="/files/arch.png" alt="FTQC">
        </div>
        <div class="card-text">
            FTQC architecture upon qLDPC codes for photonic / ion trap / scqubits
        </div>
    </a>
    <a href="/potential_directions/novel_SCqubits/" class="card">
        <div class="card-image">
            <img src="/files/2024/JJ_Chain.png" alt="QC">
        </div>
        <div class="card-text">
            Algorithmic novel superconducting qubit design
        </div>
    </a>
    <a href="/potential_directions/hpc_app/" class="card">
        <div class="card-image">
            <img src="/files/HPC.png" alt="QC">
        </div>
        <div class="card-text">
            HPC for QEC
        </div>
    </a>
</div>


# Random pics

<div class="gallery-wrapper">
  <button class="gallery-arrow left" onclick="scrollGallery(-1)">&#10094;</button>
  <div class="gallery-container">
    <div class="gallery-item">
      <img src="/files/photo.jpg" alt="My Photo">
      <p class="caption">me presenting a poster at IMSI workshop on Quantum Hardware</p>
    </div>
    <div class="gallery-item">
      <img src="/files/tracker.jpg" alt="My Photo with a bunch of sheep">
      <p class="caption">Damn! Years of midwestern life really can<br>turn a city boy into a rural Wisconsinite!</p>
    </div>
    <div class="gallery-item">
      <img src="/files/sheep.jpg" alt="My Photo with a bunch of sheep">
      <p class="caption">Sheeps are cute though.</p>
    </div>
  </div>
  <button class="gallery-arrow right" onclick="scrollGallery(1)">&#10095;</button>
</div>

<style>
  .gallery-wrapper {
    display: flex;
    align-items: center; /* Center items vertically */
  }
  .gallery-arrow {
    background-color: rgba(0, 0, 0, 0.5);
    color: white;
    border: none;
    padding: 10px;
    cursor: pointer;
    z-index: 1;
  }
  .gallery-arrow.left {
    margin-right: 10px;
  }
  .gallery-arrow.right {
    margin-left: 10px;
  }
  .gallery-invisible {
    position: absolute;
    top: 0; 
    bottom: 0;
    width: 30%;
    cursor: pointer;
  }
  .gallery-invisible.left {
    left: 0;
  }
  .gallery-invisible.right {
    right: 0;
  }
  .caption {
    word-wrap: break-word; /* Ensure captions wrap within the width of the image */
    max-width: 100%; /* Ensure captions do not exceed the width of the image */
  }
</style>

<script>
  function scrollGallery(direction) {
    const container = document.querySelector('.gallery-container');
    const itemWidth = container.querySelector('.gallery-item').offsetWidth + 20; // 20 is the margin
    container.scrollBy({ left: direction * itemWidth, behavior: 'smooth' });
  }
</script>
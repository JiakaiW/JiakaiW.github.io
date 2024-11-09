---
layout: default
title: Home
---

# 👋 Welcome to Jiakai Wang's Portfolio

My skills and interests include:

<div class="tags">
    <span class="tag">🔬 Quantum Computing</span>
    <span class="tag">🛠️ Quantum Error Correction Codes</span>
    <span class="tag">🛡️ Fault-Tolerant Quantum Computing</span>
    <span class="tag">🔭 Atomic Molecular & Optical physics</span>
    <span class="tag">📊 Statistics</span>
    <span class="tag">🤖 Machine Learning</span>
    <span class="tag">💻 CPU/GPU HPC</span>
    <span class="tag">🧠 (deployement of) LLM</span>
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


I'm currently in a physics master program student speicialied in quantum computing at University of Wisconsin-Madison. Previously, I obtained a Data Science Bachelor's degree at UW-Madison. 

I'm interested in modern AI application, fault-tolerant quantum computing logical operations, specifically for qubit-efficient qLDPC codes. 

Since qLDPC code are still not implemented yet, I'm also interested in the physical implementations. I previously specialize in superconducting qubits, but I'm also curious about integrated photonics, QCCD ion traps platforms.








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
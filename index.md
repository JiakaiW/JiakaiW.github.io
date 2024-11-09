---
layout: default
title: Home
---

# 👋 Welcome to Jiakai Wang's Portfolio

I'm currently in a physics master program student speicialied in quantum computing at University of Wisconsin-Madison. Previously, I obtained a Data Science Bachelor's degree at UW-Madison. 

I'm interested in modern AI application, fault-tolerant quantum computing logical operations, specifically for qubit-efficient qLDPC codes. 

Since qLDPC code are still not implemented yet, I'm also interested in the physical implementations. I previously specialize in superconducting qubits, but I'm also curious about integrated photonics, QCCD ion traps platforms.




# Random pics

<div class="gallery-wrapper">
  <div class="gallery-container">
    <div class="gallery-item">
      <img src="/files/photo.jpg" alt="My Photo">
      <p>me presenting a poster at IMSI workshop on Quantum Hardware</p>
    </div>
    
    <div class="gallery-item">
      <img src="/files/tracker.jpg" alt="My Photo with a bunch of sheep">
      <p>Damn! Years of midwestern life really can turn a city boy into a rural Wisconsinite!</p>
    </div>
    
    <div class="gallery-item">
      <img src="/files/sheep.jpg" alt="My Photo with a bunch of sheep">
      <p>Sheeps are cute though.</p>
    </div>
  </div>
  <div class="gallery-invisible left" onclick="scrollGallery(-1)"></div>
  <div class="gallery-invisible right" onclick="scrollGallery(1)"></div>
</div>

<button class="gallery-arrow left" onclick="scrollGallery(-1)">&#10094;</button>
<button class="gallery-arrow right" onclick="scrollGallery(1)">&#10095;</button>

<style>
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
</style>

<script>
  function scrollGallery(direction) {
    const container = document.querySelector('.gallery-container');
    const itemWidth = container.querySelector('.gallery-item').offsetWidth + 20; // 20 is the margin
    container.scrollBy({ left: direction * itemWidth, behavior: 'smooth' });
  }
</script>
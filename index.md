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
    <div class="card" onclick="expandCard('past_projects/mfqec')">
        <div class="card-image">
            <img src="/files/2023/circ_simple.png" alt="MFQEC" />
        </div>
        <div class="card-text">
            Measurement-free quantum error correction
        </div>
    </div>
    <div class="card" onclick="expandCard('past_projects/fluxonium_erasure')">
        <div class="card-image">
            <img src="/files/2024/JJ_Chain.png" alt="Fluxonium" />
        </div>
        <div class="card-text">
            Fluxonium erasure
        </div>
    </div>
    <div class="card" onclick="expandCard('past_projects/hpc')">
        <div class="card-image">
            <img src="/files/HTCHPC.jpg" alt="HPC" />
        </div>
        <div class="card-text">
            High-Performance Computing
        </div>
    </div>
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
    background-color: #d3d3d3;
    color: black;
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
    border-radius: 0;
  }
  .card-text {
    padding: 0.5em;
    text-align: center;
    color: black;
  }
  .dark-mode .card {
    background-color: #333;
  }
  .dark-mode .card-text {
    color: white;
  }
</style>

# Research interests:

<div class="card-container">
    <div class="card" onclick="expandCard('agents')">
        <div class="card-image">
            <img src="/files/agents.png" alt="agents" />
        </div>
        <div class="card-text">
            LLM prompt engineering
        </div>
    </div>
    <div class="card" onclick="expandCard('ftqc')">
        <div class="card-image">
            <img src="/files/arch.png" alt="FTQC" />
        </div>
        <div class="card-text">
            FTQC architecture upon qLDPC codes for photonic / ion trap / scqubits
        </div>
    </div>
    <div class="card" onclick="expandCard('novel_SCqubits')">
        <div class="card-image">
            <img src="/files/2024/JJ_Chain.png" alt="QC" />
        </div>
        <div class="card-text">
            Algorithmic novel superconducting qubit design
        </div>
    </div>
    <div class="card" onclick="expandCard('hpc_app')">
        <div class="card-image">
            <img src="/files/HPC.png" alt="QC" />
        </div>
        <div class="card-text">
            HPC for QEC
        </div>
    </div>
</div>

<!-- Card Expansion Overlay -->
<div class="card-overlay" id="cardOverlay" onclick="closeExpandedCard()">
    <div class="expanded-card" onclick="event.stopPropagation()">
        <button class="close-button" onclick="closeExpandedCard()">×</button>
        <div class="expanded-content" id="expandedContent">
            <!-- Content will be loaded here -->
        </div>
    </div>
</div>

<script>
async function expandCard(cardId) {
    const overlay = document.getElementById('cardOverlay');
    const content = document.getElementById('expandedContent');
    
    try {
        // Determine the correct path based on the cardId
        let fetchPath;
        if (cardId.includes('past_projects')) {
            fetchPath = `/${cardId}/`;
        } else {
            fetchPath = `/potential_directions/${cardId}/`;
        }
        
        // Fetch the content
        const response = await fetch(fetchPath);
        const html = await response.text();
        
        // Extract the main content
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const mainContent = doc.querySelector('main').innerHTML;
        
        // Insert the content
        content.innerHTML = mainContent;
        
        // Position the overlay relative to current viewport
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        overlay.style.top = `${scrollTop}px`;
        
        // Show the overlay
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    } catch (error) {
        console.error('Error loading content:', error);
    }
}

function closeExpandedCard() {
    const overlay = document.getElementById('cardOverlay');
    overlay.classList.remove('active');
    document.body.style.overflow = ''; // Restore scrolling
    overlay.style.top = '0'; // Reset position
}
</script>

<style>
  .card {
    cursor: pointer;
    transition: transform 0.3s ease;
  }

  .card:hover {
    transform: translateY(-5px);
  }

  .card-overlay {
    position: absolute;
    left: 0;
    width: 100%;
    height: 100vh;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(10px);
    display: none;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }

  .card-overlay.active {
    display: flex;
  }

  .expanded-card {
    background: var(--color-dark-grey);
    width: 90%;
    max-width: 1200px;
    height: 80vh;
    border-radius: 30px;
    padding: 2em;
    position: relative;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
  }

  .expanded-content {
    flex: 1;
    overflow-y: auto;
    padding-right: 1em;
    margin-top: 0;
    padding-top: 0;
  }

  .expanded-content::-webkit-scrollbar {
    width: 8px;
  }

  .expanded-content::-webkit-scrollbar-track {
    background: var(--color-dark-grey);
  }

  .expanded-content::-webkit-scrollbar-thumb {
    background: var(--color-hover);
    border-radius: 4px;
  }

  .close-button {
    position: absolute;
    top: 1em;
    right: 1em;
    background: none;
    border: none;
    font-size: 2em;
    cursor: pointer;
    color: var(--color-white);
    padding: 0.2em 0.5em;
    border-radius: 50%;
    transition: background-color 0.3s ease;
    z-index: 2;
  }

  .close-button:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }

  .dark-mode .expanded-card {
    background: var(--color-dark-grey);
    color: var(--color-white);
  }

  .dark-mode .close-button {
    color: var(--color-white);
  }

  .dark-mode .close-button:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
</style>
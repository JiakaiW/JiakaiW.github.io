---
layout: default
title: quantumRAP
permalink: /past_projects/quantumRAP/
---

<div class="quantum-rap-container">
  <div class="rap-content">
    <div class="rap-image">
      <img src="/files/2025/rap_pic.jpeg" alt="RAP">
    </div>
    <div class="rap-info">
      <h1>quantumRAP</h1>
      <p><a href="https://suno.com/song/f2d4fba3-28bb-4b46-9429-01fdcc75ee36" target="_blank" class="rap-link">AI quantum RAP</a></p>
      <p class="rap-description">Yo, bro made rap music about superconducting qubits.</p>
      <div class="audio-player">
        <audio id="quantum-rap" controls preload="auto">
          <source src="/files/2025/Quantum EDM.mp3" type="audio/mpeg">
          Your browser does not support the audio element.
        </audio>
      </div>
      <div class="lyrics-container">
        <h2>Lyrics</h2>
        <div class="lyrics-text">
          <p>The Josephson junction unveiled the key,<br>
          Nonlinear wonders unlocked circuitry.<br><br>
          First came charge qubits, their potentials confined,<br>
          Flux qubits then followed, magnetic states aligned.<br><br>
          Transmons arrived, their noise subdued,<br>
          Robust designs set the superconducting mood.<br><br>
          Fluxonium emerged, with inductance so steep,<br>
          Exploring new regimes where the currents creep.<br><br>
          Bosonic modes sang in harmonic decay,<br>
          From 0-pi qubits to new arrays.<br><br>
          Composite qubits with hybrid goals,<br>
          Artificial molecules pushing quantum roles.<br><br>
          Hamiltonian symphonies, time evolution's tune,<br>
          Diabatic sweeps under a coherent moon.<br><br>
          Perturbation theory's my lyrical artillery,<br>
          Tunneling through the walls of classical futility.<br><br>
          Topological codes, braid logic in the core,<br>
          Quantum supremacy knocking on the classical door.<br><br>
          Landau-Zener crossings, avoided but near,<br>
          Superconducting qubits find coherence here.<br><br>
          10 millikelvin chill, dilution fridge reigns,<br>
          Quantum coherence thrives where the cold constrains.<br><br>
          Two-level systems spar cosmic radiation,<br>
          Shielding them tight through careful fabrication.<br><br>
          3D integration, qubits interlace,<br>
          Scaling up arrays in a superconducting space.<br><br>
          Tier-one fabs churn with ionized beams,<br>
          Chemical vapors layer nanoscale dreams.<br><br>
          Flip-chip designs bond with elegant force,<br>
          Through-silicon vias ensure the signal's course.<br><br>
          Power delivery streamlined at its source.<br>
          Hamiltonians coded in quantum design,<br><br>
          Avoiding decoherence one step at a time.<br>
          Readout resonators sing a spectral tone,<br><br>
          Processing data from states unknown.<br>
          Error correction layers fold into the mix,<br><br>
          Surface codes stabilize with lattice tricks.<br>
          Lattice surgery stitches, qubits rearrange,<br><br>
          Magic state distillation keeps the logic in range.<br>
          Low-density parity checks for errors unknown,<br><br>
          3D architectures make resilience home.<br>
          Long-range entangling links, connections in bloom,<br><br>
          Decoders learn faster with neural network room.<br>
          Transformers crunch syndrome data in stride,<br><br>
          Fault-tolerant designs pushing noise aside.<br>
          Cosmic rays test the shielded domain,<br><br>
          Superconducting arrays, resilient they remain.<br>
          Fabricating futures at the bleeding edge,<br><br>
          Advisors frame policies, nations hedge.<br>
          White House plans with quantum foresight,<br><br>
          Strategies evolve in this computational fight.<br>
          Fidelity's a goal, scaling's a race,<br><br>
          Architectures compete in this quantum space.</p>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
.quantum-rap-container {
  padding: 2em;
  color: white;
}

.rap-content {
  display: flex;
  gap: 2em;
  align-items: flex-start;
  max-width: 1200px;
  margin: 0 auto;
}

.rap-image {
  flex: 0 0 400px;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.rap-image img {
  width: 100%;
  height: auto;
  display: block;
}

.rap-info {
  flex: 1;
  min-width: 0;
}

.rap-link {
  font-size: 1.5em;
  color: var(--color-primary);
  text-decoration: none;
  display: inline-block;
  margin: 1em 0;
}

.rap-description {
  font-size: 1.2em;
  margin-bottom: 1.5em;
}

.audio-player {
  margin: 1.5em 0;
  width: 100%;
}

.audio-player audio {
  width: 100%;
  height: 40px;
}

.lyrics-container {
  margin-top: 2em;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
  padding: 1.5em;
}

.lyrics-container h2 {
  margin-bottom: 1em;
  color: var(--color-primary);
}

.lyrics-text {
  max-height: 300px;
  overflow-y: auto;
  padding-right: 1em;
  line-height: 1.6;
}

.lyrics-text::-webkit-scrollbar {
  width: 8px;
}

.lyrics-text::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
}

.lyrics-text::-webkit-scrollbar-thumb {
  background: var(--color-primary);
  border-radius: 4px;
}

@media (max-width: 900px) {
  .rap-content {
    flex-direction: column;
  }

  .rap-image {
    flex: 0 0 auto;
    max-width: 100%;
  }
}
</style>

<script>
document.addEventListener('DOMContentLoaded', function() {
  const audio = document.getElementById('quantum-rap');
  if (audio) {
    // Ensure audio keeps playing when card is expanded
    audio.addEventListener('play', function() {
      audio.setAttribute('data-playing', 'true');
    });
    
    audio.addEventListener('pause', function() {
      audio.setAttribute('data-playing', 'false');
    });
    
    // Handle visibility changes
    document.addEventListener('visibilitychange', function() {
      if (document.visibilityState === 'visible' && audio.getAttribute('data-playing') === 'true') {
        audio.play();
      }
    });
  }
});
</script>


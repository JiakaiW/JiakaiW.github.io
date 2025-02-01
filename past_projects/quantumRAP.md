---
layout: default
title: quantumRAP
permalink: /past_projects/quantumRAP/
---

<style>
/* Make sure body and html span full height and have no background */
html, body {
    min-height: 100vh;
    background: transparent !important;
}

/* Create a background wrapper that covers everything */
body::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: url('/files/2024/JJ_Chain.png');
    background-size: cover;
    background-position: center;
    background-attachment: fixed;
    z-index: -2;
}

/* Dark overlay for the entire page */
body::after {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    z-index: -1;
}

/* Override all header backgrounds and ensure proper z-index */
header,
.dark-mode header,
body.dark-mode header {
    background-color: transparent !important;
    position: relative;
    z-index: 100;
}

/* Override all footer backgrounds and ensure proper z-index */
footer,
#footer,
.dark-mode footer,
.dark-mode #footer,
body.dark-mode #footer {
    background-color: transparent !important;
    margin-top: 2em;
    position: relative;
    z-index: 1;
}

main {
    position: relative;
    z-index: 1;
    padding: 2em;
    max-width: none !important;
    width: 100%;
    margin: 0;
    min-height: calc(100vh - 200px);
    background: transparent !important;
    text-align: left;
}

/* Ensure text in header/footer remains visible */
.menu-link > a,
.search-button a,
.footer-section h3,
.social-link,
.footer-section p,
.dark-mode .menu-link > a,
.dark-mode .search-button a,
.dark-mode .footer-section h3,
.dark-mode .social-link,
.dark-mode .footer-section p {
    color: white !important;
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
    position: relative;
    z-index: 101;
}

/* Style dropdown menu to be semi-transparent */
.dropdown-content,
.dark-mode .dropdown-content {
    background: rgba(26, 26, 26, 0.8) !important;
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
    z-index: 102;
}

.dropdown-content a,
.dark-mode .dropdown-content a {
    color: white !important;
}

main > * {
    position: relative;
    z-index: 1;
    max-width: 1000px;
    margin-left: auto;
    margin-right: auto;
    color: white;
}

main h1 {
    font-size: 2em;
    margin-top: 1.5em;
    margin-bottom: 1em;
}

main p {
    margin-bottom: 1em;
    line-height: 1.6;
}

main a {
    color: var(--color-primary);
    text-decoration: none;
}

main a:hover {
    text-decoration: underline;
}

/* Add hover area for dropdown */
.menu-link {
    padding-bottom: 20px;
}

/* Create hover bridge for dropdown */
.dropdown-content::before {
    content: '';
    position: absolute;
    top: -20px;
    left: 0;
    right: 0;
    height: 20px;
    background: transparent;
}

/* Ensure dropdown items are clickable */
.dropdown-content a {
    position: relative;
    z-index: 103;
    display: block;
    padding: 0.8em 1.2em;
    color: white !important;
    transition: background-color 0.2s ease;
}

.dropdown-content a:hover {
    background-color: rgba(255, 255, 255, 0.1);
}

/* Background overlays */
body::before {
    z-index: -2;
}

body::after {
    z-index: -1;
}

main {
    z-index: 1;
}
</style>


<div style="display: flex; align-items: center; gap: 20px; height: 70vh;">
  <div style="flex: 1; max-width: 400px; height: 100%; overflow: hidden; margin-right: 20px; display: flex; align-items: center;">
    <img src="/files/2025/rap_pic.jpeg" style="width: 100%; height: auto;" alt="RAP">
  </div>
  <div style="flex: 2;">
    <h1>quantumRAP</h1>
    <p><a href="https://suno.com/song/f2d4fba3-28bb-4b46-9429-01fdcc75ee36" style="font-size: 1.5em;">AI quantum RAP</a> <br>Yo, bro made rap music about superconducting qubits.</p>
    <audio controls>
      <source src="/files/2025/Quantum EDM.mp3" type="audio/mpeg">
      Your browser does not support the audio element.
    </audio><br>
    <div class="lyrics-container" style="overflow-y: auto; max-height: 200px;">
      <p>The Josephson junction unveiled the key,<br>Nonlinear wonders unlocked circuitry.<br><br>First came charge qubits, their potentials confined,<br>Flux qubits then followed, magnetic states aligned.<br><br>Transmons arrived, their noise subdued,<br>Robust designs set the superconducting mood.<br><br>Fluxonium emerged, with inductance so steep,<br>Exploring new regimes where the currents creep.<br><br>Bosonic modes sang in harmonic decay,<br>From 0-pi qubits to new arrays.<br><br>Composite qubits with hybrid goals,<br>Artificial molecules pushing quantum roles.<br><br>Hamiltonian symphonies, time evolution's tune,<br>Diabatic sweeps under a coherent moon.<br><br>Perturbation theory's my lyrical artillery,<br>Tunneling through the walls of classical futility.<br><br>Topological codes, braid logic in the core,<br>Quantum supremacy knocking on the classical door.<br><br>Landau-Zener crossings, avoided but near,<br>Superconducting qubits find coherence here.<br><br>10 millikelvin chill, dilution fridge reigns,<br>Quantum coherence thrives where the cold constrains.<br><br>Two-level systems spar cosmic radiation,<br>Shielding them tight through careful fabrication.<br><br>3D integration, qubits interlace,<br>Scaling up arrays in a superconducting space.<br><br>Tier-one fabs churn with ionized beams,<br>Chemical vapors layer nanoscale dreams.<br><br>Flip-chip designs bond with elegant force,<br>Through-silicon vias ensure the signal's course.<br><br>Power delivery streamlined at its source.<br>Hamiltonians coded in quantum design,<br><br>Avoiding decoherence one step at a time.<br>Readout resonators sing a spectral tone,<br><br>Processing data from states unknown.<br>Error correction layers fold into the mix,<br><br>Surface codes stabilize with lattice tricks.<br>Lattice surgery stitches, qubits rearrange,<br><br>Magic state distillation keeps the logic in range.<br>Low-density parity checks for errors unknown,<br><br>3D architectures make resilience home.<br>Long-range entangling links, connections in bloom,<br><br>Decoders learn faster with neural network room.<br>Transformers crunch syndrome data in stride,<br><br>Fault-tolerant designs pushing noise aside.<br>Cosmic rays test the shielded domain,<br><br>Superconducting arrays, resilient they remain.<br>Fabricating futures at the bleeding edge,<br><br>Advisors frame policies, nations hedge.<br>White House plans with quantum foresight,<br><br>Strategies evolve in this computational fight.<br>Fidelity's a goal, scaling's a race,<br><br>Architectures compete in this quantum space.<br></p>
    </div>
  </div>
</div>


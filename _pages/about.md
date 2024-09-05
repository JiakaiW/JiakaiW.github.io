---
permalink: /
title: ""
author_profile: true
redirect_from: 
  - /about/
  - /about.html
---

------

# Leakage detection in Integer Fluxonium 

<a href="https://meetings.aps.org/Meeting/MAR24/Session/G47.8" target="_blank">Talk I gave</a>

(paper in progress)

During this project, I developed two Python packages focused on efficiency and reusability.

<a href="https://github.com/JiakaiW/CoupledQuantumSystems" target="_blank">CoupledQuantumSystems</a> encapsulates common workflows in hardware simulation and addresses niche problems in the numerical simulation and analysis of quantum object evolution. (early alpha stage)

<div align="center">
  <img src="/images/IFQ_detection.png" alt="IFQ_detection" width="600">
  <p><small><b>Figure 1:</b> The resonator gives the same response when coupled to computational states, but a different response when coupled to the leakage state.</small></p>
</div>

<a href="https://github.com/JiakaiW/EfficientSurfaceCodeSim" target="_blank">EfficientSurfaceCodeSim</a> abstracts the noise model into multiple layers, enabling support for deterministic error injection (for importance sampling) and posterior probability (for decoding erasure conversion circuits).

<div align="center">
  <img src="/images/QEC_tolerance.png" alt="QEC_tolerance" width="600">
  <p><small><b>Figure 2:</b> To achieve a target logical error rate ((a) 10e-6, (b) 10-12) at a given distance, physical error rates must be below a certain "tolerance" level. The erasure error rate in fluxonium-based qubits is small enough to be below the tolerance level for very low logical error rates at relatively small code distances. Future work can focus on achieving decoherence-limited gate protocols</small></p>
</div>

<div align="center">
  <img src="/images/importance_sampling.png" alt="importance_sampling" width="600">
  <p><small><b>Figure 3:</b> The package enables efficient sampling with a fixed number of errors, allowing various algorithms be utilized to estimate logical error rates at very low physical error rates.</small></p>
</div>


------

# Measurement-free quantum error correction with multiqubit gates

<a href="https://journals.aps.org/pra/abstract/10.1103/PhysRevA.108.062426" target="_blank">Paper</a>

<a href="https://meetings.aps.org/Meeting/MAR24/Session/A49.8" target="_blank">Talk I gave</a>

<div align="center">
  <img src="/images/MFQEC_circ.png" alt="MFQEC_circ" width="600">
  <p><small><b>Figure 4:</b> The MFQEC circuit utilizes combinatorial-design-based syndrome redundancy and logical ancillas to achieve fault tolerance.</small></p>
</div>

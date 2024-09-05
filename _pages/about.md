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

[Talk I gave](https://meetings.aps.org/Meeting/MAR24/Session/G47.8)

During this project, I developed two Python packages focused on efficiency and reusability.

[CoupledQuantumSystems](https://github.com/JiakaiW/CoupledQuantumSystems) encapsulates common workflows in hardware simulation and addresses niche problems in the numerical simulation and analysis of quantum object evolution. (early alpha stage)

<div align="center">
  <img src="/images/IFQ_detection.png" alt="IFQ_detection" width="500">
  <p><small><b>Figure 1:</b> The resonator gives the same response when coupled to computational states, but a different response when coupled to the leakage state.</small></p>
</div>

[EfficientSurfaceCodeSim](https://github.com/JiakaiW/EfficientSurfaceCodeSim) abstracts the noise model into multiple layers, enabling support for deterministic error injection (for importance sampling) and posterior probability (for decoding erasure conversion circuits).

<div align="center">
  <img src="/images/QEC_tolerance.png" alt="QEC_tolerance" width="500">
  <p><small><b>Figure 2:</b> To achieve a target logical error rate ((a) 10e-6, (b) 10-12 for) at a given distance, physical error rates must be below a certain "tolerance" level.</small></p>
</div>

<div align="center">
  <img src="/images/importance_sampling.png" alt="importance_sampling" width="500">
  <p><small><b>Figure 3:</b> The package enables efficient sampling with a fixed number of errors, allowing various algorithms be utilized to estimate logical error rates at very low physical error rates.</small></p>
</div>

(paper in progress)

------

# Measurement-free quantum error correction with multiqubit gates

[Paper](https://journals.aps.org/pra/abstract/10.1103/PhysRevA.108.062426)

[Talk I gave](https://meetings.aps.org/Meeting/MAR24/Session/A49.8)

<div align="center">
  <img src="/images/MFQEC_circ.png" alt="MFQEC_circ" width="500">
  <p><small><b>Figure 4:</b> The MFQEC circuit utilizes combinatorial-design-based syndrome redundancy and logical ancillas to achieve fault tolerance.</small></p>
</div>
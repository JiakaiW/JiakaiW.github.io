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

During this project, I wrote two Python packages with a focus on efficiency and reusability.

[CoupledQuantumSystems](https://github.com/JiakaiW/CoupledQuantumSystems) encapsulates some commonly used workflows in hardware simulation, and addresses some niche problems in numerical simulation and analysis of quantum object evolution.

<div align="center">
  <img src="/images/IFQ_detection.png" alt="IFQ_detection" width="500">
  <p>The resonator gives the same response when coupled to computational states, while giving different response when coupled to the leakage state.</p>
</div>

[EfficientSurfaceCodeSim](https://github.com/JiakaiW/EfficientSurfaceCodeSim) abstracts the noise model into multiple layers so they can support deterministic error injection (for importance sampling) and posterior probability (for decoding erasure conversion circuits.)

<div align="center">
  <img src="/images/QEC_tolerance.png" alt="QEC_tolerance" width="500">
  <p>To reach a certain logical error rate (10e-6 for (a), 10-12 for (b)) at certain distance, physical error rates has to be beneath certain level.</p>
</div>

(paper in progress)

------

# Measurement-free quantum error correction with multiqubit gates

[Paper](https://journals.aps.org/pra/abstract/10.1103/PhysRevA.108.062426)

[Talk I gave](https://meetings.aps.org/Meeting/MAR24/Session/A49.8)

<div align="center">
  <img src="/images/MFQEC_circ.png" alt="MFQEC_circ" width="500">
  <p>The FT MFQEC circuit.</p>
</div>
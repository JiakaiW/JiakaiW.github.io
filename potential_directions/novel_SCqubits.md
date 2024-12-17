---
layout: default
title: novel_SCqubits
permalink: /potential_directions/novel_SCqubits/
---
<div style="text-align: center;">
  <img src="/files/meme_algo.png" style="width: 500px;" alt="actual quantum hardware need accerlation">
  <p>There is a mismatch between what QML people want and what hardware providers have.</p>
</div>

### Because experimentalist phds are just busy figuring out cryostats, lasers and wiring stuff, why can't computer scientists who have more freedom help explore ideas on the hardware side? 

Modern physical qubit designs increasingly leverage techniques such as [erasure conversion](https://www.nature.com/articles/s41586-023-06438-1) and [bias-preserving gates](https://journals.aps.org/prx/abstract/10.1103/PhysRevX.12.021049). However, most studies on automated novel (non-bosonic) superconducting qubit discovery have focused on the ground and first excited states. Developing complex gate protocols that utilize multiple long-lived subspaces has the potential to reduce effective physical error rates to unprecedented levels. Achieving this goal may require the creation of an artificial analog of the optical-metastable-ground [omg](https://arxiv.org/pdf/2109.01272) structure in Ytterbium. To support the design of such complex artificial atoms, I am particularly interested in training and employing ML models capable of understanding lumped-element circuit descriptions, physical layouts, energy participation ratio  [(EPR)](https://qiskit-community.github.io/qiskit-metal/) simulation results, and level structures. I believe an ML model could greatly accelerate novel artificial atom and gate protocol design.

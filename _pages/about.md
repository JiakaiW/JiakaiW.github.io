---
permalink: /
title: ""
author_profile: true
redirect_from: 
  - /about/
  - /about.html
---

## Table of Contents
1. [Introduction](#introduction)
2. [Research interests:](#research-interests)
   - [Leakage detection in Integer Fluxonium ](#leakage-detection-in-integer-fluxonium )
      - [EfficientSurfaceCodeSim](#efficientSurfaceCodeSim)
      - [CoupledQuantumSystems](#coupledquantumsystems)
   - [Measurement-free quantum error correction with multiqubit gates](measurement-free-quantum-error-correction-with-multiqubit-gates)

# Research interests:

Hamiltonian simulation and optimization of superconducting qubits, implementation of quantum error correction, algorithms and software for quantum error correction



------

# Projects

## Leakage detection in Integer Fluxonium 

<a href="https://meetings.aps.org/Meeting/MAR24/Session/G47.8" target="_blank">Talk I gave</a>

(paper in progress)

During this project, I developed two Python packages focused on efficiency and reusability.

### EfficientSurfaceCodeSim

The first package is built to support simulation and decoding of quantum error correction with non-traditional error models. <a href="https://github.com/JiakaiW/EfficientSurfaceCodeSim" target="_blank">EfficientSurfaceCodeSim</a> abstracts a generic noise model into multiple layers, enabling support for deterministic error injection (for importance sampling) and posterior probability (for decoding erasure conversion circuits).

<div align="center">
  <img src="/images/PackageDescription.png" alt="EfficientSurfaceCodeSimPackageOrganization" width="600">
  <p><small><b>Figure 1:</b> The structure of EfficientSurfaceCodeSim is contained in the dashed blue rectangles. Text in green means the feature is not implemented yet but is a reasonable extension of the current design.</small></p>
</div>

### CoupledQuantumSystems

The second package, <a href="https://github.com/JiakaiW/CoupledQuantumSystems" target="_blank">CoupledQuantumSystems</a>, encapsulates common functionalities in hardware simulation and addresses niche problems in the numerical simulation and analysis of coupled quantum objects.

<div align="center">
  <img src="/images/CoupledQuantumSystems.png" alt="CoupledQuantumSystemsPackageOrganization" width="600">
  <p><small><b>Figure 2:</b> Workflow of using CoupledQuantumSystems to steamline superconducting qubits simulation workflow.</small></p>
</div>


A glimpse of some cool results based on using these packages:

<div align="center">
  <img src="/images/IFQ_detection.png" alt="IFQ_detection" width="600">
  <p><small><b>Figure 3:</b> The resonator gives the same response when coupled to computational states, but a different response when coupled to the leakage state. This protocol is a proof-of-concept numerical demonstration of leakage detection in fluxonium. </small></p>
</div>

<div align="center">
  <img src="/images/QEC_tolerance.png" alt="QEC_tolerance" width="600">
  <p><small><b>Figure 4:</b> To achieve a target logical error rate ((a) 10e-6, (b) 10-12) at a given distance, physical error rates must be below a certain "tolerance" level. Since superconducting qubit gate fidelities are mostly limited by coherence time, these tolerance levels can be interpreted as $T_2$ requirements. Our proposed qubit based on fluxonium is very promising in this regard.</small></p>
</div>

<div align="center">
  <img src="/images/importance_sampling.png" alt="importance_sampling" width="600">
  <p><small><b>Figure 5:</b> EfficientSurfaceCodeSim enables efficient simulation and decoding of the circuit when injected a fixed number of errors (at random locations). This allows various algorithms be utilized to estimate logical error rates at very low physical error rates. For example, once a fraction of the f(x) distribution is calculated, the whole landscape can be reconstructed by, say, compressed sensing. </small></p>
</div>


------

## Measurement-free quantum error correction with multiqubit gates

<a href="https://journals.aps.org/pra/abstract/10.1103/PhysRevA.108.062426" target="_blank">Paper</a>

<a href="https://meetings.aps.org/Meeting/MAR24/Session/A49.8" target="_blank">Talk I gave</a>

<div align="center">
  <img src="/images/MFQEC_circ.png" alt="MFQEC_circ" width="600">
  <p><small><b>Figure 6:</b> The MFQEC circuit utilizes combinatorial-design-based syndrome redundancy and logical ancillas to achieve fault tolerance.</small></p>
</div>

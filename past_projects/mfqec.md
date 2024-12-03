---
layout: default
title: MFQEC
permalink: /past_projects/mfqec/
---

# Measurement-free steane code with neutral atom multi-qubit gates

<div style="text-align: center;">
  <img src="/files/mfqec_paper.png" style="width: 800px;" alt="paper">
  <!-- <p>.</p> -->
</div>


Michael A. Perlin, Vickram N. Premakumar, Jiakai Wang, Mark Saffman, and Robert Joynt, "[Fault-tolerant measurement-free quantum error correction with multiqubit gates](https://journals.aps.org/pra/abstract/10.1103/PhysRevA.108.062426)", Phys. Rev. A 108, 062426 – Published 26 December 2023

[slides at APS march meeting 2024](/files/2023/APSMM24_MFQEC.pdf)

**Why measurement-free quantum error correction (MFQEC):** Quantum error correction (QEC) can be understood as pumping out entropy, and there's no rule that predicts measurement is necessary. Because the photon-scattering effect during neutral atom qubit measurement is detrimental to nearby qubit coherence, it would be advantageous if near-term small-scale QEC protocols don't rely on measurements. (Another approach to mitigate the adverse effect of measurement is to use atom movement and dedicated readout zones.)

**Challenges in MFQEC:** Even for measurement-based protocols, unreliable syndrome measurement requires special gadgets, including surface code, where lattice surgery requires multiple rounds of measurements to ensure fault-tolerance. (Although recent proposals of algorithmic fault-tolerance change this.) How to perform this classical processing with unreliable syndrome measurement using purely quantum operations is the crucial problem in MFQEC.

We find the Steane code augmentated with a) syndrome redundancy b) native multi-qubit gates c) logical ancilla to be fault-tolerance with realistic error from gate simulation.

<div style="text-align: center;">
  <img src="/files/2023/circ.png" style="width: 800px;" alt="the quantum circuit diagram for implementing measurement-free quantum error correction">
  <p>The quantum circuit diagram for implementing measurement-free quantum error correction.</p>
</div>


**Acknowledgements:** I'm super grateful for Michael, Mark and Bob who let me participate in this project! This is my first paper and tought me quantum error correction theroy, hamiltonian simulation, and gave me motivation to learn some of the recent developments like resource estimation, Flag scheme, biased noise and erasure conversion although I didn't use them in this project.
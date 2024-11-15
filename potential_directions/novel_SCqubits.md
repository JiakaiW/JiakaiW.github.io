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

For example, one of my immature guess is:

# Intuition: novel superconducting qubit design could add another 9 to gate fidelity.

## Specifically, it would be nice to engineering a superconducting qubit-version of omg (optical, metastable, ground) architecture [(reference)](https://arxiv.org/pdf/2109.01272) for these reasons:

a) Multiple long-lived subspaces would allow ways to engineer high-erasure ratio [(reference)](https://www.nature.com/articles/s41586-023-06438-1) and approximately bias-preserving gates [(referece)](https://journals.aps.org/prx/abstract/10.1103/PhysRevX.12.021049).

b) The selection rule (pattern in matrix elements) is not idea in fluxonium, or in novel qubit proposals. Controllability and coherence are often at conflict. 

## Potential ways to accomplish this?

a) Exploration with search / learning based algorithm on the circuit-level [(reference)](https://scqubits.readthedocs.io/en/v4.2/guide/circuit/ipynb/custom_circuit_root.html)

b) Optimization on the EDA level [(reference)](https://qiskit-community.github.io/qiskit-metal/)
---
layout: default
title: HPC
permalink: /past_projects/hpc/
---

# High-Performance Computing
<div style="text-align: right;">
      
</div>

---
# FlexibleQECSim
[FlexibleQECSim](https://github.com/JiakaiW/FlexibleQECSim) is a python package built on top of stim, that facilitate generating circuit for sampling (both direct Monte Carlo and importance sampling) and decoding (via generating decoding graph from circuit with posterior probabilities based on erasure detection results).

```bash
pip3 install git+https://github.com/JiakaiW/FlexibleQECSim
```

<div style="text-align: center;">
  <img src="/files/2024/FlexibleQECSim.png" style="width: 500px;" alt="Organization of the package FlexibleQECSim">
  <p>Organization of the package. Text in green are features not implemented yet.</p>
</div>

<div style="text-align: center;">
  <img src="/files/2024/importance.png" style="width: 800px;" alt="Example of importance sampling usage">
  <p>FlexibleQECSim enables efficient simulation and decoding of the circuit when injected a fixed number of errors (at random locations). This allows various algorithms be utilized to estimate logical error rates at very low physical error rates. For example, once a fraction of the f(x) distribution is calculated, the whole landscape can be reconstructed by, say, compressed sensing.
</p>
</div>


---

# A Pauli Frame simulator based on CUDA

[DEMO](https://github.com/JiakaiW/Stim_fork/tree/main). This will first appear in the form of a course project for ECE 759 taught by [Tsung-Wei Huang](https://tsung-wei-huang.github.io/).
<div style="text-align: center;">
  <img src="/files/2024/GPU_pauli_frame.png" style="width: 500px;" alt="GPU Pauli frame simulation">
  <p>preview.</p>
</div>

<div style="text-align: center;">
  <img src="/files/GPU_ILP.png" style="width: 500px;" alt="GPU Pauli frame simulation instruction level parallelism">
  <p>preview.</p>
</div>

<div style="text-align: center;">
  <img src="/files/GPU_demo_testing.png" style="width: 500px;" alt="preliminary results on speed up">
  <p>preview.</p>
</div>

<div style="text-align: center;">
  <img src="/files/GPU_compile.png" style="width: 500px;" alt="compiling from stim and GPU simulator source code">
  <p>preview.</p>
</div>
---

# CoupledQuantumSystems
If you count NumPy as HPC, then introducing [FlexibleQECSim](https://github.com/JiakaiW/CoupledQuantumSystems), a python package built on top of scqubits, qutip, dynamiqs to futher encapsulate commonly used workflows in hamiltonian simulation of superconducting qubits.

```bash
pip3 install git+https://github.com/JiakaiW/CoupledQuantumSystems
```

<div style="text-align: center;">
  <img src="/files/2024/CoupledQuantumSystems.png" style="width: 500px;" alt="Organization of the package CoupledQuantumSystems">
  <p>Organization of the package. Text in green are features not implemented yet.</p>
</div>

---
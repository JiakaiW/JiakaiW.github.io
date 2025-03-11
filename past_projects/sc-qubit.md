---
layout: default
title: Fluxonium Erasure Qubit
permalink: /past_projects/fluxonium_erasure/
---

# Fluxonium erasure qubit (to appear on arxiv soon)


**Why erasure qubit:** At the same total error rate, erasure errors that are mostly heralded (of known location) are easier to correct, and gives rise to higher threshold and larger logical error suppression exponent. While erasure qubits have been demonstrated on natural atoms or composite superconducting qubits, it will be cool if erasure qubit can be implemented on single-mode superconducting qubits. 

**We demonstrate that a single fluxonium artificial atom can be used as an erasure qubit, along with proposals for physical gates**


[APS March Meeting 2024 Fluxonium leakage detection, https://meetings.aps.org/Meeting/MAR24/Session/A49.8](/files/2024/APSMM24_fluxonium.pdf)

[IMSI quantum hardware workshop poster 2024](/files/2024/leakage_detection_poster.pdf)




<div style="text-align: center;">
<img src="/files/2024/lvl_diagram.png" style="width: 500px;" alt="qubit level structure">
<p>Fluxonium has a more complex potential and selection rules than transmon. We utilize the selection rule in <a href="https://journals.aps.org/prxquantum/abstract/10.1103/PRXQuantum.5.040318">integer fluxonium</a> to enhance the computational subspace coherence time and do trade-off with leakage process.</p>
</div>

## a) Two-outcome leakage detection measurement via tunable resonator

<img src="/files/readout.png" style="width: 500px;" alt="fluxonium erasure dispersive readout">

<div style="text-align: center;">
  <p>Dispersive readout can be used to detect leakage without harming qubit coherence in fluxonium. See analytical and numerical analysis on dephasing in the coming paper. </p>
</div>

## b) Two-outcome leakage detection measurement via transmon

<img src="/files/readout_transmon.png" style="width: 500px;" alt="fluxonium erasure transmon readout">

<div style="text-align: center;">
  <p>By adjusting non-linear resonator frequency and drive amplitude, we get another "degree of freedom" in the control compared to resonator based readout, making leakage detection less demanding on parameter selection. </p>
</div>

## c) "Erasure-bias" preserving gates

<img src="/files/bias_gate.png" style="width: 500px;" alt="fluxonium erasure transmon readout">

<div style="text-align: center;">
<p>Coherence time estimation shows that g-f <u>I</u>nteger<u> F</u>luxonium<u> Q</u>ubit (g-f IFQ) is an erasure-dominant qubit with super-long computational subspace coherence time, this feature needs to be preserve in gate operations. We show that by using large enough detuning, intermediate state decay is minimized, and additional leakage can be converted to erasure by the aforementioned leakage detection measurement via transmon. This established g-f IFQ as an erasure qubit.</p>
</div>
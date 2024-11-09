---
layout: default
title: SC-qubit
permalink: /sc-qubit/
---

# Analytical and numerical studies on superconducting qubits
<div style="text-align: right;">
    -- for the entertainment of my experimentalist friends
</div>


---

# 1. The fluxonium erasure qubit project:

[APS March Meeting 2024 Fluxonium leakage detection, https://meetings.aps.org/Meeting/MAR24/Session/A49.8](/files/2024/APSMM24_fluxonium.pdf)

[IMSI quantum hardware workshop poster 2024](/files/2024/leakage_detection_poster.pdf)

### 😂 Paper coming soon 

### Summary: We demonstrate a single fluxonium artificial atom can be used as an erasure qubit! Previous proposals for superconducting erasure qubits are all composite, like dual-rail transmon or fluxonium molecule.

<div style="text-align: center;">

<img src="/files/2024/fluxonium.png" style="width: 500px;" alt="qubit level structure">
<p>In this project, we utilize the selection rule in <a href="https://journals.aps.org/prxquantum/abstract/10.1103/PRXQuantum.5.040318">integer fluxonium</a> to enhance the computational subspace coherence time and do trade-off with leakage process.</p>

</div>

## a) Two-outcome leakage detection measurement via tunable resonator

<div style="text-align: center;">
  <img src="/files/2024/readout.png" style="width: 800px;" alt="leakage detection diagram">
  <p>Dispersive readout can be used to detect leakage without harming qubit coherence in fluxonium! See analytical and numerical analysis on dephasing in the coming paper. </p>
</div>

## b) Two-outcome leakage detection measurement via transmon

<div style="text-align: center;">
  <img src="/files/2024/tmon.png" style="width: 500px;" alt="leakage detection diagram">
  <p>By adjusting transmon frequency and drive amplitude, we get another "degree of freedom" in the control compared to resonator based readout, making leakage detection less demanding on parameter selection. </p>
</div>

## c) Erasure-preserving gates

<div style="text-align: center;">
<img src="/files/2024/raman.png" style="width: 800px;" alt="raman gate that preserve erasure-dominant error structure">
<p>Coherence time estimation shows that g-f <u>I</u>nteger<u> F</u>luxonium<u> Q</u>ubit (g-f IFQ) is an erasure-dominant qubit with super-long computational subspace coherence time, this feature needs to be preserve in gate operations. We show that by using large enough detuning, intermediate state decay is minimized, and additional leakage can be converted to erasure by the aforementioned leakage detection measurement via transmon. This established g-f IFQ as an erasure qubit.</p>
</div>


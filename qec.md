---
layout: default
title: QEC
permalink: /qec/
---

# "NISQ is dead" 

<div style="text-align: right;">
    -- says a famous guy
</div>

---

# FlexibleQECSim
[FlexibleQECSim](https://github.com/JiakaiW/FlexibleQECSim)
A QEC-simulation package built on top of stim

<pre style="background-color: #f1f1f1; padding: 10px; border-radius: 5px; display: flex; align-items: center; justify-content: space-between; border: none;">
  <code>pip3 install git+https://github.com/JiakaiW/FlexibleQECSim</code>
  <button onclick="copyToClipboard('pip3 install git+https://github.com/JiakaiW/FlexibleQECSim')" style="background-color: #008CBA; color: white; border: none; padding: 5px 10px; text-align: center; text-decoration: none; display: inline-block; font-size: 14px; border-radius: 5px; cursor: pointer; margin-left: 10px;">Copy to clipboard</button>
</pre>

<script>
function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(function() {
    alert('Copied to clipboard');
  }, function(err) {
    console.error('Could not copy text: ', err);
  });
}
</script>

---

# Measurement-free steane code with neutral atom multi-qubit gates

I'm super grateful for Michael, Mark and Bob who let me participate in this project! This is my first paper and tought me quantum error correction theroy, hamiltonian simulation, and gave me motivation to learn some of the recent developments like resource estimation, Flag scheme, biased noise and erasure conversion although I didn't use them in this project.

Michael A. Perlin, Vickram N. Premakumar, Jiakai Wang, Mark Saffman, and Robert Joynt, "[Fault-tolerant measurement-free quantum error correction with multiqubit gates](https://journals.aps.org/pra/abstract/10.1103/PhysRevA.108.062426)", Phys. Rev. A 108, 062426 – Published 26 December 2023

<div style="text-align: center;">
  <img src="/files/2023/circ.png" style="width: 800px;" alt="the quantum circuit diagram for implementing measurement-free quantum error correction">
  <p>The quantum circuit diagram for implementing measurement-free quantum error correction.</p>
</div>
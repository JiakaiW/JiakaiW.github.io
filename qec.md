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
[FlexibleQECSim](https://github.com/JiakaiW/FlexibleQECSim) is a python package built on top of stim, that facilitate generating circuit for sampling (both direct Monte Carlo and importance sampling) and decoding (via generating decoding graph from circuit with posterior probabilities based on erasure detection results).

<pre class="code-block">
  <code>pip3 install git+https://github.com/JiakaiW/FlexibleQECSim</code>
  <button class="copy-button" onclick="copyToClipboard('pip3 install git+https://github.com/JiakaiW/FlexibleQECSim')">Copy to clipboard</button>
</pre>

<script>
function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(function() {
    alert('Copied to clipboard');
  }, function(err) {
    console.error('Could not copy text: ', err);
  });
}

function toggleTheme() {
  const body = document.body;
  body.classList.toggle('dark-mode');
  const themeToggle = document.getElementById('theme-toggle');
  if (body.classList.contains('dark-mode')) {
    themeToggle.textContent = 'Switch to Light Mode';
  } else {
    themeToggle.textContent = 'Switch to Dark Mode';
  }
}
</script>

<div style="text-align: center;">
  <img src="/files/2024/FlexibleQECSim.png" style="width: 500px;" alt="Organization of the package FlexibleQECSim">
  <p>Organization of the package. Text in green are features not implemented yet.</p>
</div>

---

# Measurement-free steane code with neutral atom multi-qubit gates

I'm super grateful for Michael, Mark and Bob who let me participate in this project! This is my first paper and tought me quantum error correction theroy, hamiltonian simulation, and gave me motivation to learn some of the recent developments like resource estimation, Flag scheme, biased noise and erasure conversion although I didn't use them in this project.

Michael A. Perlin, Vickram N. Premakumar, Jiakai Wang, Mark Saffman, and Robert Joynt, "[Fault-tolerant measurement-free quantum error correction with multiqubit gates](https://journals.aps.org/pra/abstract/10.1103/PhysRevA.108.062426)", Phys. Rev. A 108, 062426 – Published 26 December 2023

<div style="text-align: center;">
  <img src="/files/2023/circ.png" style="width: 800px;" alt="the quantum circuit diagram for implementing measurement-free quantum error correction">
  <p>The quantum circuit diagram for implementing measurement-free quantum error correction.</p>
</div>
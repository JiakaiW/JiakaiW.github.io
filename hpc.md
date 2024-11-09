---
layout: default
title: HPC
permalink: /hpc/
---

# High-Performance Computing
<div style="text-align: right;">
      
</div>

---

# A Tableau simulator based on CUDA

DEMO soon available. This will first appear in the form of a course project for ECE 759 taught by [Tsung-Wei Huang](https://tsung-wei-huang.github.io/).

---

# CoupledQuantumSystems
If you count NumPy as HPC, then introducing [FlexibleQECSim](https://github.com/JiakaiW/CoupledQuantumSystems), a python package built on top of scqubits, qutip, dynamiqs to futher encapsulate commonly used workflows in hamiltonian simulation of superconducting qubits.

<pre class="code-block">
  <code>pip3 install git+https://github.com/JiakaiW/CoupledQuantumSystems</code>
  <button class="copy-button" onclick="copyToClipboard('pip3 install git+https://github.com/JiakaiW/CoupledQuantumSystems')">Copy to clipboard</button>
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
  <img src="/files/2024/CoupledQuantumSystems.png" style="width: 500px;" alt="Organization of the package CoupledQuantumSystems">
  <p>Organization of the package. Text in green are features not implemented yet.</p>
</div>

---
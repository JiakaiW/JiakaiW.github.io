---
layout: tech-docs
title: A Intuitive Guide to Superconducting Qubit Simulation
description: Guide to superconducting qubit simulation for undergraduates.
permalink: /tech-docs/undergrad_guide/
math: true
---

# A Intuitive Guide to Superconducting Qubit Simulation

Welcome! This guide is designed to introduce you to the research field of superconducting qubit simulation. The goal is to move you from basic quantum mechanics concepts to simulating real physical systems relatively quickly. We focus on intuition and "using wheels" (existing powerful libraries like `scqubits` and `qutip`) before diving into the complex engine room of our group's custom codebase.

## 1. The Circuit Model of Quantum Computation

Before understanding *how* we build qubits physically, it's helpful to understand the abstract model we are aiming for. In the standard "Circuit Model" of quantum computing, information is stored in **qubits**.

A qubit is a two-level effective quantum system. Just like a classical bit can be 0 or 1, a qubit state $\vert\psi\rangle$ is a superposition of two basis states, $\vert0\rangle$ and $\vert1\rangle$:

$$ \vert\psi\rangle = \alpha \vert0\rangle + \beta \vert1\rangle $$

Operations on these qubits are called **Gates**. Mathematically, a gate is simply a unitary matrix $U$ applied to the state vector: $\vert\psi_{final}\rangle = U \vert\psi_{initial}\rangle$.

The most fundamental single-qubit gates are described by the **Pauli Matrices**:

$$
\sigma_x = \begin{pmatrix} 0 & 1 \\ 1 & 0 \end{pmatrix}, \quad
\sigma_y = \begin{pmatrix} 0 & -i \\ i & 0 \end{pmatrix}, \quad
\sigma_z = \begin{pmatrix} 1 & 0 \\ 0 & -1 \end{pmatrix}
$$

* $\sigma_x$ acts like a "NOT" gate (flips $\vert0\rangle \leftrightarrow \vert1\rangle$).
* $\sigma_z$ adds a phase.

In our simulations, we represent the **statevector** as a column vector of complex numbers. For example:
$$ \vert0\rangle = \begin{pmatrix} 1 \\ 0 \end{pmatrix}, \quad \vert1\rangle = \begin{pmatrix} 0 \\ 1 \end{pmatrix} $$

**Measurement** (Collapsing):
When we measure a qubit state $\vert\psi\rangle = \alpha \vert0\rangle + \beta \vert1\rangle$, we don't get the vector back. We get either $\vert0\rangle$ (with probability $\vert\alpha\vert^2$) or $\vert1\rangle$ (with probability $\vert\beta\vert^2$). The state "collapses" to the measured outcome.

**Example: Applying a Gate**
Let's apply a "NOT" gate ($\sigma_x$) to the ground state $\vert0\rangle$ using matrix multiplication:

$$
\sigma_x \vert0\rangle = \begin{pmatrix} 0 & 1 \\ 1 & 0 \end{pmatrix} \begin{pmatrix} 1 \\ 0 \end{pmatrix} = \begin{pmatrix} 0\cdot 1 + 1\cdot 0 \\ 1\cdot 1 + 0\cdot 0 \end{pmatrix} = \begin{pmatrix} 0 \\ 1 \end{pmatrix} = \vert1\rangle
$$

We successfully flipped the qubit!

## 2. The Physical Qubit: Particle in a 1D Potential

In reality, superconducting qubits are electrical circuits. However, we map their physics to a simpler problem: **a particle in a 1D potential well**.

### Linear Algebra Tool: Diagonalization

Before solving the physics, let's look at the math tool we use.
In Linear Algebra, a matrix $M$ represents a coupled system. If $M$ has off-diagonal terms, the variables are "mixed" together.

**Diagonalization** is the process of changing our coordinate system (finding the **Eigenvectors**) so that the matrix becomes diagonal.

* In this new basis, the off-diagonal "couplings" disappear.
* The system decouples into independent modes (Eigenvalues).

Here is a visual example of a $2 \times 2$ matrix:

* **Left**: Original Matrix (coupled).
* **Middle**: Diagonalized Matrix (uncoupled).
* **Right**: The transformation matrix (The Eigenvectors).

![Diagonalization Visual](/tech-docs/undergrad_guide/diagonalization_matrix.png)

### The Physics: Potential Energy Landscape

Now, consider a particle moving in a 1D landscape defined by a **Potential Energy** function $V(x)$.

* **Classical Physics**: A ball rolls down the hill and speeds up (converts Potential $\to$ Kinetic energy).
* **Quantum Physics**: The particle is described by a wavefunction $\psi(x)$. The "hills" confine the wavefunction.

### From Continuous to Discrete: The Grid

How do we solve this numerically? We use the **Time-Independent Schrödinger Equation**:
$$ H \vert\psi\rangle = E \vert\psi\rangle $$
where $H = \text{Kinetic} + \text{Potential} = -\frac{\hbar^2}{2m}\frac{d^2}{dx^2} + V(x)$.

To solve this on a computer, we discretize the position $x$ into a **Grid** of $N$ points.
The wavefunction becomes a vector: $\psi(x) \to [\psi_0, \psi_1, ..., \psi_{N-1}]$.

**The Hamiltonian Matrix**:

1. **Potential Energy**: Easy! It depends only on position $x_i$, so it is diagonal: $H_{ii} = V(x_i)$.
2. **Kinetic Energy**: This involves the second derivative $\frac{d^2}{dx^2}$. How do we compute curvature on a grid? We look at neighbors!
    $$ \frac{d^2\psi}{dx^2} \approx \frac{\psi_{i+1} - 2\psi_i + \psi_{i-1}}{dx^2} $$
    This formula connects site $i$ to its neighbors $i+1$ and $i-1$. In the matrix, this creates **off-diagonal** terms ($H_{i, i+1}$).

This gives us a large matrix. When we **Diagonalize** it, we get the stationary wavefunctions:

![Grid Discretization](/tech-docs/undergrad_guide/grid_discretization.png)

* **Top Left**: The Hamiltonian matrix (Potential on diagonal + Kinetic off-diagonal).
* **Top Right**: The Diagonalized Hamiltonian (Eigenvalues).
* **Bottom Left**: The **Eigenvector Matrix** $U$. The columns are the wavefunctions.
* **Bottom Right**: The resulting wavefunctions fitting in the potential well (corresponding to the columns of $U$).

### Using `scqubits`

We *could* build these matrices manually for every circuit (Fluxonium, Transmon, etc.), but that is tedious. The `scqubits` library automates this. It "knows" the correct potential $V(\phi)$ and kinetic terms for various superconducting circuits.

Here is how we visualize a Fluxonium qubit using `scqubits`:

![Fluxonium Wavefunctions](/tech-docs/undergrad_guide/fluxonium_wavefunctions.png)

*In the plot above, notice that for $\Phi_{ext} = 0.5 \Phi_0$, the potential is symmetric (a double well). The ground state $\vert0\rangle$ (blue) and first excited state $\vert1\rangle$ (orange) are symmetric and antisymmetric combinations of states in the left and right wells.*

### Matrix Elements

To control the qubit (drive transitions between levels), we usually couple it to a microwave drive or another qubit via an operator, typically the charge operator $\hat{n}$.

The strength of this coupling depends on the **matrix element**: $\langle i \vert \hat{n} \vert j \rangle$.

* If this element is large, we can easily drive transitions between $i$ and $j$.
* If it is small or zero (due to selection rules), the transition is forbidden.

Let's look at the matrix elements for our Fluxonium:

![Fluxonium Matrix Elements](/tech-docs/undergrad_guide/fluxonium_matrix_elements.png)

**Key Observation:** Look at the element $\langle 0 \vert \hat{n} \vert 1 \rangle$ (row 0, col 1). It is essentially zero!
This is because of the parity symmetry at $\Phi_{ext}=0.5$. This is actually a **desirable feature** for protection against relaxation (which we will discuss in Section 4), but it means we cannot drive the 0-1 transition directly with a simple charge drive. We might need a Raman process or to tune away from this point.

## 3. Time Evolution: From Discrete Steps to Schrödinger

So far we've looked at *static* properties (energy levels). Now let's look at *dynamics*: how the state changes over time.

### The Physics of Small Steps

**Brief Calculus Recap: What is $dt$?**
In calculus, we learn that smooth change is simply a series of tiny, discrete steps.
$$ T = \sum dt $$

When simulating physics, we must choose this $dt$ carefully.

* **Fixed Step Size**: Constant $dt$. Simple, efficient for JIT compilation.
* **Adaptive Step Size**: Computer changes $dt$ based on how fast the wavefunction changes.

![ODE Steps Comparison](/tech-docs/undergrad_guide/ode_steps.png)

### The Schrödinger Equation

If we make the time step $dt$ infinitely small, the update rule becomes the **Schrödinger Equation**:
$$ i\hbar \frac{d}{dt}\vert\psi(t)\rangle = H(t) \vert\psi(t)\rangle $$
This equation says: The Hamiltonian $H$ determines the **speed and direction** of the state vector's rotation in Hilbert space.

### Free Evolution & Qubit Frequency

What happens if we just leave the qubit alone?
From Section 2, we found the **Diagonal Hamiltonian** with energies $E_0$ and $E_1$:

$$
H_{diag} = \begin{pmatrix} E_0 & 0 \\ 0 & E_1 \end{pmatrix}
$$

The Schrödinger equation tells us that each level oscillates at its own frequency $\omega_n = E_n/\hbar$:
$$ \vert\psi(t)\rangle = \alpha e^{-i E_0 t/\hbar} \vert0\rangle + \beta e^{-i E_1 t/\hbar} \vert1\rangle $$

**Relative Phase Matters**:
In quantum mechanics, the overall "global phase" can be ignored. We can factor out $e^{-i E_0 t/\hbar}$:
$$ \vert\psi(t)\rangle \propto \alpha \vert0\rangle + \beta e^{-i \frac{(E_1 - E_0)}{\hbar} t} \vert1\rangle $$

The only thing that changes is the **relative phase** between $\vert0\rangle$ and $\vert1\rangle$, which rotates at the **Qubit Frequency**:
$$ \omega_{01} = \frac{E_1 - E_0}{\hbar} $$

On the **Bloch Sphere**, this looks like a rotation around the Z-axis (Larmor Precession).

```python
import numpy as np
import qutip as qt
import matplotlib.pyplot as plt

# 1. Define the System
# Qubit frequency (Energy gap)
w01 = 2 * np.pi * 1.0 # 1 GHz (in angular frequency)
# Hamiltonian in the computational basis {|0>, |1>}
# Diagonal matrix with energies E0 and E1.
# Let's set E0 = 0, E1 = w01.
H = 0.5 * w01 * qt.sigmaz() 
# Note: Simulating in the frame where H is diagonal (which we found in Section 2)

# 2. Initial State
# Start in the |+> state: superposition of |0> and |1>
psi0 = (qt.basis(2, 0) + qt.basis(2, 1)).unit()

# 3. Use QuTiP to evolve time
# Simulate partial period so we see the rotation (not a full closed circle)
times = np.linspace(0, 0.8, 100) 
result = qt.mesolve(H, psi0, times, [], [])

# 4. Visualization on Bloch Sphere
b = qt.Bloch()
b.add_states(psi0) # Start point
b.add_states(result.states[-1]) # End point

# Extract x, y, z coordinates for the trajectory
xs = [qt.expect(qt.sigmax(), state) for state in result.states]
ys = [qt.expect(qt.sigmay(), state) for state in result.states]
zs = [qt.expect(qt.sigmaz(), state) for state in result.states]

b.add_points([xs, ys, zs], meth='l') # 'l' for line
b.vector_color = ['r', 'g'] # Start=Red, End=Green
b.point_color = ['b'] # Trajectory=Blue
b.zlabel = ['$|0\\rangle$', '$|1\\rangle$']
b.view = [-40, 30] # Adjust view angle to see the 3D structure better
b.save('bloch_precession.png')
print("Saved bloch_precession.png")
```

![Bloch Precession](/tech-docs/undergrad_guide/bloch_precession.png)
*The state starts at X (front) and rotates around Z due to its own energy.*

## 4. Driving and Control

Now, how do we *control* the qubit? We apply external fields (microwaves).

### Rabi Oscillations

When we apply a microwave drive at the frequency $\omega_{d} \approx \omega_{01}$ (resonance), the qubit state oscillates between $\vert0\rangle$ and $\vert1\rangle$. This is called **Rabi oscillation**.

Analytically, the probability to find the qubit in state $\vert1\rangle$ is given by (the equation doesn't matter you just need to know there's such a thing call Rabi oscillation):
$$ P_1(t) = \frac{\Omega^2}{\Omega^2 + \Delta^2} \sin^2\left(\frac{\sqrt{\Omega^2 + \Delta^2}}{2}t\right) $$
where $\Omega$ is the Rabi frequency (drive amplitude) and $\Delta = \omega_d - \omega_{01}$ is the detuning.

At resonance ($\Delta=0$), this simplifies to $P_1(t) = \sin^2(\Omega t / 2)$.

We can simulate this using `qutip`. Below is the resonant case ($\Delta=0$):

```python
import numpy as np
import qutip as qt
import matplotlib.pyplot as plt

# Define the system
w01 = 2 * np.pi * 4.0  # 4 GHz Qubit
H0 = 0.5 * w01 * qt.sigmaz()

# Drive parameters
Omega = 2 * np.pi * 0.1 # 100 MHz drive strength
psi0 = qt.basis(2, 0)   # Start in |0>
tlist = np.linspace(0, 50, 500) # 50 ns simulation

# --- Case 1: Resonant Driving (w_drive = w01) ---
w_drive = w01
# Rotating Wave Approximation (RWA) Hamiltonian in the rotating frame
# H_RWA = Delta/2 * sigma_z + Omega/2 * sigma_x
# At resonance, Delta = 0
H_resonant = 0.5 * Omega * qt.sigmax()

result_resonant = qt.mesolve(H_resonant, psi0, tlist, [], [qt.basis(2,1)*qt.basis(2,1).dag()])
prob_1_resonant = result_resonant.expect[0]

plt.figure(figsize=(6, 4))
plt.plot(tlist, prob_1_resonant, label=r'Population $|1\rangle$', color='orange')
plt.xlabel('Time (ns)')
plt.ylabel('Population')
plt.title('Rabi Oscillations (Resonant)')
plt.ylim(-0.1, 1.1)
plt.legend()
plt.grid(True)
plt.savefig('rabi_resonant.png')
print("Saved rabi_resonant.png")

# --- Case 2: Off-Resonant Driving ---
# Detuning Delta large enough to see incomplete transfer
Delta = 2.0 * Omega
H_off = 0.5 * Delta * qt.sigmaz() + 0.5 * Omega * qt.sigmax()

result_off = qt.mesolve(H_off, psi0, tlist, [], [qt.basis(2,1)*qt.basis(2,1).dag()])
prob_1_off = result_off.expect[0]

plt.figure(figsize=(6, 4))
plt.plot(tlist, prob_1_off, label=r'Population $|1\rangle$', color='orange')
plt.plot(tlist, np.zeros_like(tlist) + (Omega**2/(Omega**2+Delta**2)), '--', color='grey', label='Max Theory')
plt.xlabel('Time (ns)')
plt.ylabel('Population')
plt.title('Rabi Oscillations (Off-Resonant $\Delta = 2\Omega$)')
plt.ylim(-0.1, 1.1)
plt.legend()
plt.grid(True)
plt.savefig('rabi_off_resonant.png')
print("Saved rabi_off_resonant.png")

```

![Rabi Oscillations (Resonant)](/tech-docs/undergrad_guide/rabi_resonant.png)

### Off-Resonant Driving

What happens if `w_drive` is not exactly `w01`?

* Detailed experimentation is left as an exercise, but intuitively: you will see incomplete flips. The qubit vector on the Bloch sphere won't go all the way to the South Pole ($\vert1\rangle$).

Here is the simulation for an off-resonant drive where the detuning $\Delta = \omega_d - \omega_{01}$ is significantly large (e.g., $2 \times$ Amplitude):

![Off-Resonant Rabi](/tech-docs/undergrad_guide/rabi_off_resonant.png)

Notice that the population of $\vert1\rangle$ (orange) never reaches 1.0!

### Rabi-oscillation in Real Multi-Level Qubits

All physical qubits are actually multi-level systems. We only *want* to use the first two levels $\vert0\rangle$ and $\vert1\rangle$.
If we drive the qubit too hard, or if the energy gap to the next level ($E_{12} = E_2 - E_1$) is too close to our qubit frequency ($E_{01} = E_1 - E_0$), we might accidentally excite the state $\vert2\rangle$. This is called **leakage**.

Transmon qubits often have weak anharmonicity (meaning $E_{12} \approx E_{01}$).

Here is a simulation of a Transmon with $E_J/E_C \approx 20$ driven by a strong pulse:

```python

import scqubits as scq
import qutip as qt
import numpy as np
import matplotlib.pyplot as plt

# 1. Define a Transmon with weak anharmonicity
# EJ/EC = 20 (e.g., EJ=10, EC=0.5)
transmon = scq.Transmon(
    EJ=10.0,
    EC=0.5,
    ng=0.0,
    ncut=30
)

# 2. Extract Hamiltonian and Operators for the first 3 levels (0, 1, 2)
# We want to see leakage from qubit subspace (0,1) to level 2.
evals, evecs = transmon.eigensys(evals_count=3)
# Creating Qutip objects for the 3-level system
# H0 is diagonal with energies relative to ground state
energies = evals - evals[0]
w01 = energies[1]
w12 = energies[2] - energies[1]
anharmonicity = w12 - w01 
print(f"Anharmonicity (alpha): {anharmonicity/(2*np.pi)} GHz (if E in GHz*2pi)")

# H0 in the eigenbasis |0>, |1>, |2>
H0 = qt.Qobj(np.diag(energies))

# Charge operator matrix elements for driving
# We compute matrix only for top 3 levels
# scqubits provides a helper to get the table directly
n_op_table = transmon.matrixelement_table('n_operator', evals_count=3)
n_op_matrix = np.array(n_op_table)


charge_op = qt.Qobj(n_op_matrix)

# 3. Time Evolution
# Drive at w01 frequency
w_drive = w01 
# Strong drive to cause leakage
# If drive is too weak, we won't see much leakage (RWA works well).
# If drive is strong (approaches anharmonicity), we leak.
amp = w01 * 0.05 # Drive amplitude

# H(t) = H0 + A * n * cos(w_d t)
H_t = [H0, [charge_op, f'{amp} * cos({w_drive} * t)']]

tlist = np.linspace(0, 50, 500)
psi0 = qt.basis(3, 0) # Start in |0>

# Projectors to measure population
P0 = qt.basis(3, 0) * qt.basis(3, 0).dag()
P1 = qt.basis(3, 1) * qt.basis(3, 1).dag()
P2 = qt.basis(3, 2) * qt.basis(3, 2).dag()

result = qt.mesolve(H_t, psi0, tlist, [], [P0, P1, P2])

# 4. Plotting
plt.figure(figsize=(8,5))
plt.plot(tlist, result.expect[0], label='P(|0>)')
plt.plot(tlist, result.expect[1], label='P(|1>)')
plt.plot(tlist, result.expect[2], label='P(|2>) [Leakage]', linestyle='--')
plt.xlabel('Time')
plt.ylabel('Population')
plt.title(f'Transmon (EJ/EC=20) High-Power Drive\nLeakage to |2> (Anharmonicity ~ {anharmonicity:.2f})')
plt.legend()
plt.tight_layout()
plt.savefig('transmon_leakage.png')
print("Saved transmon_leakage.png")
```

![Transmon Leakage](/tech-docs/undergrad_guide/transmon_leakage.png)

Notice the dashed green line? That is the population of the $\vert2\rangle$ state rising. Once the information leaks out of our computational subspace ($\vert0\rangle, \vert1\rangle$), standard error correction becomes much harder. This is a key constraint in designing fast gates!

### Introduction to Pulse Control

How do we avoid this leakage? We can't just change the qubit physics, so we must change our drive, or **Pulse Control**.

To drive the qubit, we apply a **modulated pulse**. This consists of a high-frequency carrier wave (at $\omega_d$) multiplied by a slowly varying **Envelope** function $E(t)$:

$$ \text{Drive}(t) = E(t) \cdot \cos(\omega_d t) $$

Instead of a simple "Square Pulse" (where $E(t)$ is a boxcar function), we use shaped pulses like a **Gaussian**. Why?

* **Time Domain**: A square pulse has sharp edges.
* **Frequency Domain**: Sharp edges in time correspond to broad tails in frequency (a Sinc function spectrum). These broad tails can overlap with the $\vert1\rangle \to \vert2\rangle$ transition frequency, causing leakage even if our main drive is resonant with $\vert0\rangle \to \vert1\rangle$.
* **Solution**: A Gaussian pulse is smooth in time, so its spectrum is also a Gaussian (narrow, no broad tails). This minimizes "spectral bleeding" into other transitions.

The plot below shows the difference. Notice how the Square Pulse (blue) has significant energy spread across frequencies, while the Gaussian (orange) is tightly confined.

```python

import numpy as np
import matplotlib.pyplot as plt
from scipy.fft import fft, fftfreq

# Time domain parameters
T = 100.0  # Total duration
fs = 100.0 # Sampling frequency
t = np.linspace(0, T, int(T*fs), endpoint=False)
width = 20.0 # Pulse width
center = T / 2.0

# 1. Define Envelopes
# Square Pulse
square_pulse = np.zeros_like(t)
mask = (t > (center - width/2)) & (t < (center + width/2))
square_pulse[mask] = 1.0

# Gaussian Pulse
sigma = width / 4.0 # Defined so most mass is within width
gaussian_pulse = np.exp(-(t - center)**2 / (2 * sigma**2))

# Modulation (Cosine at drive freq)
# Ideally we look at the envelope spectrum for leakage explanation (rwa), 
# but let's show the full signal to be rigorous or just envelopes?
# The user asked for "modulated pulse".
w_d = 2 * np.pi * 1.0 # 1 GHz drive (Lowered to see oscillations clearly)

# modulated_square = square_pulse * np.cos(w_d * t)
# modulated_gaussian = gaussian_pulse * np.cos(w_d * t)

# To clearly see spectral leakage "near" the drive, it is cleaner to plot the 
# Fourier transform of the *envelope* (or the modulated signal shifted).
# If we plot the full modulated signal, the peak is at w_d, and we look at sidebands.
# Let's plot the modulated signal for "Time" (looks cool) but maybe just FT of envelope for "Freq"?
# Or FT of modulated signal. Let's do FT of modulated.
modulated_square = square_pulse * np.cos(w_d * t)
modulated_gaussian = gaussian_pulse * np.cos(w_d * t)

# 2. Fourier Transform
def get_spectrum(y, sample_rate):
    N = len(y)
    yf = fft(y)
    xf = fftfreq(N, 1/sample_rate)
    # Return only positive frequencies near the drive
    return xf, np.abs(yf)

freqs, spec_square = get_spectrum(modulated_square, fs)
freqs, spec_gaussian = get_spectrum(modulated_gaussian, fs)

# Shift to centered view? 
# Or just plot near 1 GHz
idx_min = np.searchsorted(freqs[:len(freqs)//2], 0.0)
idx_max = np.searchsorted(freqs[:len(freqs)//2], 2.0)
plot_freqs = freqs[idx_min:idx_max]
plot_spec_square = spec_square[idx_min:idx_max]
plot_spec_gaussian = spec_gaussian[idx_min:idx_max]

# Visualize
fig, axes = plt.subplots(2, 2, figsize=(10, 6))

# Top Left: Square Time
axes[0,0].plot(t, modulated_square, color='tab:blue')
axes[0,0].set_title('Square Pulse (Time)')
axes[0,0].set_ylabel('Amplitude')
axes[0,0].set_xlim(center - width, center + width) # Zoom in

# Top Right: Gaussian Time
axes[0,1].plot(t, modulated_gaussian, color='tab:orange')
axes[0,1].set_title('Gaussian Pulse (Time)')
axes[0,1].set_xlim(center - width, center + width)

# Bottom Left: Square Spectrum
# Normalize
plot_spec_square /= np.max(plot_spec_square)
axes[1,0].plot(plot_freqs, 20*np.log10(plot_spec_square + 1e-15), color='tab:blue')
axes[1,0].set_title('Square Spectrum (Broad Sidebands)')
axes[1,0].set_ylabel('Magnitude (dB)')
axes[1,0].set_xlabel('Frequency (GHz)')
# Removed shading as requested

# Bottom Right: Gaussian Spectrum
plot_spec_gaussian /= np.max(plot_spec_gaussian)
axes[1,1].plot(plot_freqs, 20*np.log10(plot_spec_gaussian + 1e-15), color='tab:orange')
axes[1,1].set_title('Gaussian Spectrum (Focused)')
axes[1,1].set_xlabel('Frequency (GHz)')
axes[1,1].set_ylim(-60, 5) # Same measure
axes[1,0].set_ylim(-60, 5)
# Removed shading as requested

plt.tight_layout()
plt.savefig('pulse_spectrum.png')
print("Saved pulse_spectrum.png")
```

![Pulse Spectrum](/tech-docs/undergrad_guide/pulse_spectrum.png)

### The Frontier: Pulse Optimization, JIT, and Auto-Diff

**Motivation: Optimal Control**
Often we don't just want to *simulate* a pulse; we want to *find the best* pulse. We want to shape the control fields $A(t)$ to make the gate as fast and accurate as possible. This is an optimization problem: we want to minimize the error at the end of the simulation.

**Auto-Differentiation (AD)**
To optimize efficiently, we need to know the "slope" (gradient) of the error with respect to every control parameter. Calculating this by running the simulation twice for every parameter (finite difference) is incredibly slow.
**Auto-differentiation** allows the computer to track the derivatives *through* the simulation integration steps (via the chain rule), giving us all gradients in one go.

**Just-In-Time (JIT) Compilation**
Python is flexible but slow. **JIT compilation** (used in libraries like JAX) translates your Python simulation into highly optimized machine code (XLA) before running it. This can speed up simulations by $1000\times$!

**Why Fixed Step is Back**
JIT compilers love predictability. They want to know exactly how much memory to allocate and how many loops to run *before* execution.

* **Adaptive Solvers**: The number of steps changes dynamically. This breaks the "static graph" assumption of many compilers, or requires expensive re-compilation.
* **Fixed Step Solvers**: The number of steps is constant. The compiler can unroll loops and optimize heavily.

*Conclusion*: While `qutip` (adaptive) is great for exploring, for advanced research in optimal control (using **JAX**), we often switch *back* to fixed step solvers to enable these massive speedups.

### Decoherence: $T_1$ and $T_2$

Real quantum systems are never perfectly isolated. They interact with the environment, losing information.

* **$T_1$ (Relaxation)**: The qubit spontaneously decays from $\vert1\rangle$ to $\vert0\rangle$, losing energy.
* **$T_2$ (Dephasing)**: The "clock" of the superposition phase gets scrambled, without necessarily losing energy.

In `qutip`, we model this by adding "collapse operators" (like the lowering operator $\sigma_-$) to the `mesolve` function shown above.

## 5. Coupled Systems

The real fun begins when we put two qubits together.

### Tensor Products

If Qubit A has space $\mathcal{H}_A$ (basis $\vert0\rangle_A, \vert1\rangle_A$) and Qubit B has $\mathcal{H}_B$ (basis $\vert0\rangle_B, \vert1\rangle_B$), the combined system lives in the **Tensor Product** space $\mathcal{H}_A \otimes \mathcal{H}_B$.

The basis states are now $\vert00\rangle, \vert01\rangle, \vert10\rangle, \vert11\rangle$.

If the qubits are **uncoupled**, the total Hamiltonian is just the sum of individual Hamiltonians acting on their respective subspaces:
$$ H_{total} = H_A \otimes I_B + I_A \otimes H_B $$

### Coupling and "Mixing"

We usually couple qubits capacitively, which often adds an interaction term like:
$$ H_{int} = J \cdot \hat{n}_A \otimes \hat{n}_B $$

and now
$$ H_{total} = H_A \otimes I_B + I_A \otimes H_B + H_{int} $$

When $J \neq 0$, the simple product states $\vert01\rangle$ or $\vert10\rangle$ might no longer be the exact eigenstates of energy.

When we diagonalize the coupled matrix:

* We use this mixing to perform two-qubit gates (like the CNOT gate). By driving one qubit, the coupling allows us to affect the state of the other.

Here is a visualization of "mixing" using a system of two coupled Fluxoniums (parameters from a real research example).

* **Left**: An uncoupled product state (e.g., $\vert4,2\rangle$) would exist perfectly at one index.
* **Right**: The actual eigenstate of the coupled system is a **superposition**. Notice how it has significant weights on multiple product states (hybridization).

```python
q1 = scq.Fluxonium(
    EJ = 4.62,
    EC = 1.4,
    EL = 1.4,
    flux = 0.5,
    cutoff = 50
)

q2 = scq.Fluxonium(
    EJ = 5.05,
    EC = 1.03,
    EL = 1.88,
    flux = 0.5,
    cutoff = 50
)

# 2. Couple them
# HilbertSpace object
hilbertspace = scq.HilbertSpace([q1, q2])
# Capacitive coupling
hilbertspace.add_interaction(
    g_strength = 0.350, # 350 MHz
    op1 = q1.n_operator,
    op2 = q2.n_operator
)
```

![Coupled Mixing](/tech-docs/undergrad_guide/coupled_mixing.png)

### Understanding Test: Selective Darkening (Advanced)

Now that you understand coupled systems and matrix elements, here is a challenge based on real research (Nesterov et al., 2022).

**The Goal**: Implement a CNOT gate using "Selective Darkening".
Instead of standard cross-resonance, we drive *both* qubits at the target's frequency $\omega_{01}^B$. By tuning the ratio of amplitudes, we can interfere destructively for the $\vert00\rangle \to \vert01\rangle$ transition (darkening it) while interfering constructively for $\vert10\rangle \to \vert11\rangle$.

**Exercise Steps**:

1. **Define Two Fluxoniums**: Use the parameters from the paper:
    * **Qubit A (Control)**: $E_L=1.09, E_C=1.06, E_J=4.62$ (GHz).
    * **Qubit B (Target)**: $E_L=1.88, E_C=1.03, E_J=5.05$ (GHz).
    * Flux $\Phi_{ext} = 0.5 \Phi_0$ for both.
2. **Couple Them**: Add a capacitive coupling $J_C = 350$ MHz.
3. **Find the Matrix Elements**: Calculate the coupled charge matrix elements $\langle i \vert \hat{n}_A \vert j \rangle$ and $\langle i \vert \hat{n}_B \vert j \rangle$.
4. **Solve for $\eta$**:
    The Selective Darkening condition equation is:
    $$ A_{q1}\langle 00 \vert \hat{n}_A \vert 01 \rangle + A_{q2}\langle 00 \vert \hat{n}_B \vert 01 \rangle = 0 $$
    Find the ratio $\eta = A_{q2} / A_{q1}$ that satisfies this.
5. **Verify**: Check if this same ratio allows $\vert10\rangle \to \vert11\rangle$ to happen (i.e., the sum is non-zero for that transition).
6. **Simulate**: Use qutip to simulate the driven system and produce plots of the expectation values.

*Hint: You will need to dig into the `scqubits.HilbertSpace` class to get matrix elements of the coupled system!*

---
layout: default
title: Publications/Talks
permalink: /publications-talks/
---

<style>
/* Make sure body and html span full height and have no background */
html, body {
    min-height: 100vh;
    background: transparent !important;
}

/* Create a background wrapper that covers everything */
body::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: url('/assets/JJ_Chain.png');
    background-size: cover;
    background-position: center;
    background-attachment: fixed;
    z-index: -2;
}

/* Dark overlay for the entire page */
body::after {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    z-index: -1;
}

/* Override all header backgrounds and ensure proper z-index */
header,
.dark-mode header,
body.dark-mode header {
    background-color: transparent !important;
    position: relative;
    z-index: 100;
}

/* Override all footer backgrounds and ensure proper z-index */
footer,
#footer,
.dark-mode footer,
.dark-mode #footer,
body.dark-mode #footer {
    background-color: transparent !important;
    margin-top: 2em;
    position: relative;
    z-index: 1;
}

main {
    position: relative;
    z-index: 1;
    padding: 2em;
    max-width: none !important;
    width: 100%;
    margin: 0;
    min-height: calc(100vh - 200px);
    background: transparent !important;
}

/* Ensure text in header/footer remains visible */
.menu-link > a,
.search-button a,
.footer-section h3,
.social-link,
.footer-section p,
.dark-mode .menu-link > a,
.dark-mode .search-button a,
.dark-mode .footer-section h3,
.dark-mode .social-link,
.dark-mode .footer-section p {
    color: white !important;
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
    position: relative;
    z-index: 101;
}

/* Style dropdown menu to be semi-transparent */
.dropdown-content,
.dark-mode .dropdown-content {
    background: rgba(26, 26, 26, 0.8) !important;
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
    z-index: 102;
}

.dropdown-content a,
.dark-mode .dropdown-content a {
    color: white !important;
}

main > * {
    position: relative;
    z-index: 1;
    max-width: 80%;
    margin-left: auto;
    margin-right: auto;
    color: white;
    text-align: left;
}

main h1 {
    font-size: 2em;
    margin-top: 1.5em;
    margin-bottom: 1em;
    text-align: left;
}

main p {
    margin-bottom: 1em;
    line-height: 1.6;
    text-align: left;
}

main a {
    color: var(--color-primary);
    text-decoration: none;
}

main a:hover {
    text-decoration: underline;
}

/* Add hover area for dropdown */
.menu-link {
    padding-bottom: 20px;
}

/* Create hover bridge for dropdown */
.dropdown-content::before {
    content: '';
    position: absolute;
    top: -20px;
    left: 0;
    right: 0;
    height: 20px;
    background: transparent;
}

/* Ensure dropdown items are clickable */
.dropdown-content a {
    position: relative;
    z-index: 103;
    display: block;
    padding: 0.8em 1.2em;
    color: white !important;
    transition: background-color 0.2s ease;
}

.dropdown-content a:hover {
    background-color: rgba(255, 255, 255, 0.1);
}

/* Background overlays */
body::before {
    z-index: -2;
}

body::after {
    z-index: -1;
}

main {
    z-index: 1;
}
</style>

# Publications
Michael A. Perlin, Vickram N. Premakumar, Jiakai Wang, Mark Saffman, and Robert Joynt, "[Fault-tolerant measurement-free quantum error correction with multiqubit gates](https://journals.aps.org/pra/abstract/10.1103/PhysRevA.108.062426)", Phys. Rev. A 108, 062426 – Published 26 December 2023

# Talks

[APS March Meeting 2024 Fluxonium leakage detection, slides](/files/2024/APSMM24_fluxonium.pdf), https://meetings.aps.org/Meeting/MAR24/Session/G47.8

[APS March Meeting 2024 Measurement-Free quantum error correction, slides](/files/2023/APSMM24_MFQEC.pdf), https://meetings.aps.org/Meeting/MAR24/Session/A49.8

# Posters

[IMSI quantum hardware workshop poster 2024, poster file](/files/2024/leakage_detection_poster.pdf), https://www.imsi.institute/quantum-hardware-poster-session/
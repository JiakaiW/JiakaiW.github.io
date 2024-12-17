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
    background-image: url('/files/2024/JJ_Chain.png');
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
    z-index: 1;
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
    z-index: 2;
}

/* Style dropdown menu to be semi-transparent */
.dropdown-content,
.dark-mode .dropdown-content {
    background: rgba(26, 26, 26, 0.8) !important;
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
    z-index: 3;
}

.dropdown-content a,
.dark-mode .dropdown-content a {
    color: white !important;
}

main > * {
    position: relative;
    z-index: 1;
    max-width: 1000px;
    margin-left: auto;
    margin-right: auto;
    color: white;
}

main h1 {
    font-size: 2em;
    margin-top: 1.5em;
    margin-bottom: 1em;
}

main p {
    margin-bottom: 1em;
    line-height: 1.6;
}

main a {
    color: var(--color-primary);
    text-decoration: none;
}

main a:hover {
    text-decoration: underline;
}
</style>

# Publications
Michael A. Perlin, Vickram N. Premakumar, Jiakai Wang, Mark Saffman, and Robert Joynt, "[Fault-tolerant measurement-free quantum error correction with multiqubit gates](https://journals.aps.org/pra/abstract/10.1103/PhysRevA.108.062426)", Phys. Rev. A 108, 062426 – Published 26 December 2023

# Talks

[APS March Meeting 2024 Fluxonium leakage detection](/files/2024/APSMM24_fluxonium.pdf), https://meetings.aps.org/Meeting/MAR24/Session/G47.8

[APS March Meeting 2024 Measurement-Free quantum error correction](/files/2023/APSMM24_MFQEC.pdf), https://meetings.aps.org/Meeting/MAR24/Session/A49.8

# Posters

[IMSI quantum hardware workshop poster 2024](/files/2024/leakage_detection_poster.pdf)
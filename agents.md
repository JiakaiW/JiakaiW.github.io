---
layout: default
title: LLM multi-agents
permalink: /agents/
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
    text-align: left;
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


# Big picture:

In the near future, academic researchers will be augmented with agentic AI systems. By breaking down complex task into smaller pieces, multiple LLM agents can together handle them.

For quantum computing, we want a team of agentic AI that has these roles: 

1) Administrator team: 
    - Represents the human user, posing questions and approving plans.
    - Greets human user

2) Science team:
    - Superconducting qubit specialist
    - Quantum error correction specialist

2) Programming team:
    - program user: uses the code for research
    - Architect: codebase organization
    - API writer: write requirements
    - SDE: implement requirements
    - Data analyst: 

3) 


## An agent is defined by 

1) Memory: this augments the knowledge an agent pocesses beyond what's trained into it.

2) Action space

3) Decision making

# Training the multi-agent team:

1) After assemblying the team, there's no way it can work out of the box. 
    How can we "teach" the agent team to do experiments? 

2) 
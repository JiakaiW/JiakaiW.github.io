---
layout: default
title: LLM multi-agents
permalink: /potential_directions/agents/
---

<!-- <style>
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
</style> -->

# Notes on building agentic system for research


# How to build domain-specific knwoledge base:

We don't need LlamaParse! ArXiv has the raw tex files of all papers! That can be used to fine-tune a model!

# Notes on Grammar checking

Lots of tasks in an academic lab can be broken down into smaller pieces digestable for local LLMs like 70b Llama.

1) Grammer checking example: Local agents can be asked to check the grammar sentence by sentence. 

```python
# First, install ollama and run it to let it download the models

from ollama import chat
import re

def check_grammar(sentences):
    # Create a prompt for grammar correction
    for sent in sentences:
        prompt = f"""You are a grammar checker for the LaTex draft of an academic paper. Correct the following sentence for obvious grammar mistakes. 
        You are not supposed to add quotation marks or modify other LaTex commands. Only return the corrected sentence without explanations or additional text.
        
        Sentence: "{sent}"
        Return your answer in a new line, beginning with "Corrected:" """
        
        response = chat(
            model='llama3.1',  # or any other model you prefer
            # model = 'deepseek-r1',
            messages=[{'role': 'user', 'content': prompt}],
        )
        
        # Extract the corrected text from response
        corrected_text = response['message']['content'].strip()
        yield corrected_text


def extract_sentences(latex_file):
    with open(latex_file, 'r', encoding='utf-8') as f:
        text = f.read()

    # Split into sentences, remove the space at the begining of each senteces, start from the 4th sentence
    sentences = [s.strip() for s in re.split(r'(?<=[.!?])\s+', text)][2:]
    return sentences

def process_latex_file(latex_file):
    sentences = extract_sentences(latex_file)
    for original, corrected in zip(sentences, check_grammar(sentences)):
        # First remove the thinking process (everything between and including <think> tags)
        corrected = re.sub(r'<think>[\s\S]*?</think>\s*', '', corrected)
        # Then extract only what comes after "Corrected:"
        corrected = re.sub(r'^.*?Corrected:\s*', '', corrected)
        
        # only display if they are different
        if original != corrected:
            print(f"old\n{original}\nnew:\n{corrected}\n\n")
latex_file = "main.tex"
process_latex_file(latex_file)
```

# Notes on paper polishing: logic checking, proof-reading:

TODO:

## Big picture:

LLM will help academic research labs in two ways:

1) Pulling knowledge from indexed proprietary knowledge base and help humans make decision
    - This requires the lab members to document their knowledge well. This is a natural extension of lab members organizing their code into code packages / manual books.

2) Using proprietary knowledge and multi-agent systems to build and implement experiments, then write paper drafts.

## Agent teams:

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

3) Writing team:
    - Paper write: write paper in tone that matches phd students.


## An agent is defined by 

1) Long-term memory/Knowledge base for RAG: this augments an agent beyond what's trained into it. This can be implemented by using LlamaParse for breaking down scientific papers, or indexing existing proprietary / commonly used codebase
    
2) Action space: The action space of different agents can be defined using existing multi-agent frameworks like AutoGen

3) Decision making



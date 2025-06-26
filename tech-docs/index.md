---
layout: tech-docs
title: Technical Documentation
---

# Technical Documentation

Welcome to my technical documentation section. Here you'll find various guides, tutorials, and documentation I've written about high-performance computing, quantum computing tools, and development practices.

{% assign docs = site.pages | where_exp: "page", "page.path contains 'tech-docs'" | where_exp: "page", "page.name == 'index.md'" | where_exp: "page", "page.url != '/tech-docs/'" %}

<div class="docs-grid">
{% for doc in docs %}
    {% assign folder_path = doc.path | split: "/" | reverse | slice: 1 | first %}
    <div class="doc-card {% if doc.thumbnail %}has-image{% endif %}">
        <a href="{{ doc.url }}">
            {% if doc.thumbnail %}
            <img src="{{ doc.thumbnail }}" alt="{{ doc.title }}">
            {% endif %}
            <div class="doc-content">
                <h2>{{ doc.title }}</h2>
                {% if doc.description %}
                <p>{{ doc.description }}</p>
                {% endif %}
            </div>
        </a>
    </div>
{% endfor %}
</div>
 


<style>
.publication-item {
    padding: 1.2em 1.5em;
    margin-bottom: 1em;
    background: linear-gradient(135deg, rgba(30, 30, 30, 0.3) 0%, rgba(46, 46, 46, 0.4) 100%);
    backdrop-filter: blur(12px) saturate(140%);
    -webkit-backdrop-filter: blur(12px) saturate(140%);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: var(--radius-sm);
}
.publication-title {
    font-size: 1.15em;
    font-weight: 600;
    margin-bottom: 0.4em;
    line-height: 1.4;
}
.publication-authors {
    font-size: 0.95em;
    color: rgba(255, 255, 255, 0.8);
    margin-bottom: 0.3em;
}
.publication-venue {
    font-size: 0.95em;
    color: rgba(255, 255, 255, 0.7);
    margin-bottom: 0.4em;
}
.publication-links {
    display: flex;
    gap: 1em;
    font-size: 0.9em;
}
.publication-links a {
    color: var(--color-primary) !important;
    text-decoration: none;
}
.publication-links a:hover {
    text-decoration: underline;
}
#publications-list .loading-msg {
    text-align: center;
    padding: 2em;
    color: rgba(255, 255, 255, 0.6);
}
</style>

# Publications

<div id="publications-list">
<noscript>

- Jiakai Wang, Raymond A. Mencia, Vladimir E. Manucharyan, Maxim G. Vavilov, "Proposal for erasure conversion in integer fluxonium qubits", arXiv:2603.21003 (2026)
- Michael A. Perlin, Vickram N. Premakumar, Jiakai Wang, Mark Saffman, Robert Joynt, "Fault-tolerant measurement-free quantum error correction with multiqubit gates", Phys. Rev. A 108, 062426 (2023)

</noscript>
</div>

<script type="module">
const ARXIV_IDS = '2007.09804,2603.21003';
const container = document.getElementById('publications-list');

container.innerHTML = '<p class="loading-msg">Loading publications from arXiv...</p>';

try {
    const response = await fetch(`https://export.arxiv.org/api/query?id_list=${ARXIV_IDS}&max_results=10`);
    if (!response.ok) throw new Error('arXiv API error');

    const xml = new DOMParser().parseFromString(await response.text(), 'text/xml');
    const entries = xml.querySelectorAll('entry');
    if (entries.length === 0) throw new Error('No results');

    const pubs = [];
    entries.forEach(entry => {
        const arxivId = entry.querySelector('id')?.textContent.split('/abs/')[1];
        const journalRefNodes = entry.getElementsByTagNameNS('http://arxiv.org/schemas/atom', 'journal_ref');
        const doiNodes = entry.getElementsByTagNameNS('http://arxiv.org/schemas/atom', 'doi');
        const published = entry.querySelector('published')?.textContent;
        const journalRef = journalRefNodes.length > 0 ? journalRefNodes[0].textContent.trim() : null;
        const doi = doiNodes.length > 0 ? doiNodes[0].textContent.trim() : null;

        let year;
        if (journalRef) {
            const m = journalRef.match(/\((\d{4})\)/);
            year = m ? parseInt(m[1]) : new Date(published).getFullYear();
        } else {
            year = new Date(published).getFullYear();
        }

        pubs.push({
            title: entry.querySelector('title')?.textContent.trim().replace(/\n/g, ' '),
            authors: Array.from(entry.querySelectorAll('author name')).map(a => a.textContent.trim()),
            arxivId,
            journalRef,
            doi,
            year,
            categories: Array.from(entry.querySelectorAll('category')).map(c => c.getAttribute('term')),
        });
    });

    pubs.sort((a, b) => b.year - a.year);

    container.innerHTML = pubs.map(pub => {
        const authors = pub.authors.map(a =>
            a.includes('Jiakai') || a.includes('Wang, Jiakai') ? `<strong>${a}</strong>` : a
        ).join(', ');

        let venue = '';
        if (pub.journalRef) {
            venue = `<div class="publication-venue"><strong>${pub.journalRef}</strong></div>
                     <div style="font-size:0.85em;color:rgba(255,255,255,0.5);">arXiv:${pub.arxivId}${pub.categories[0] ? ` [${pub.categories[0]}]` : ''}</div>`;
        } else {
            venue = `<div class="publication-venue">arXiv:${pub.arxivId}${pub.categories[0] ? ` [${pub.categories[0]}]` : ''}</div>`;
        }

        return `<div class="publication-item">
            <div class="publication-title">${pub.title}</div>
            <div class="publication-authors">${authors}</div>
            ${venue}
            <div class="publication-links">
                <a href="https://arxiv.org/abs/${pub.arxivId}" target="_blank">arXiv</a>
                <a href="https://arxiv.org/pdf/${pub.arxivId}.pdf" target="_blank">PDF</a>
                ${pub.doi ? `<a href="https://doi.org/${pub.doi}" target="_blank">DOI</a>` : ''}
            </div>
        </div>`;
    }).join('');

} catch (e) {
    console.error('Error loading publications:', e);
    container.innerHTML = `
        <div class="publication-item">
            <div class="publication-title">Proposal for erasure conversion in integer fluxonium qubits</div>
            <div class="publication-authors"><strong>Jiakai Wang</strong>, Raymond A. Mencia, Vladimir E. Manucharyan, Maxim G. Vavilov</div>
            <div class="publication-venue">arXiv:2603.21003 [quant-ph]</div>
            <div class="publication-links">
                <a href="https://arxiv.org/abs/2603.21003" target="_blank">arXiv</a>
                <a href="https://arxiv.org/pdf/2603.21003.pdf" target="_blank">PDF</a>
            </div>
        </div>
        <div class="publication-item">
            <div class="publication-title">Fault-tolerant measurement-free quantum error correction with multi-qubit gates</div>
            <div class="publication-authors">Michael A. Perlin, Vickram N. Premakumar, <strong>Jiakai Wang</strong>, Mark Saffman, Robert Joynt</div>
            <div class="publication-venue"><strong>Phys. Rev. A 108, 062426 (2023)</strong></div>
            <div class="publication-links">
                <a href="https://arxiv.org/abs/2007.09804" target="_blank">arXiv</a>
                <a href="https://arxiv.org/pdf/2007.09804.pdf" target="_blank">PDF</a>
                <a href="https://doi.org/10.1103/PhysRevA.108.062426" target="_blank">DOI</a>
            </div>
        </div>`;
}
</script>

# Talks
APS March Meeting 2026 Selective darkening gate for gof integer fluxonium erasure detection, https://summit.aps.org/events/MAR-C04/9

[APS March Meeting 2025 Erasure conversion in integer fluxonium qubits, pptx](/projects/fluxonium_erasure/images/Fluxonium_erasure.pptx), https://schedule.aps.org/smt/2025/events/MAR-J18/3

[APS March Meeting 2024 Fluxonium leakage detection, slides](/projects/fluxonium_erasure/images/APSMM24_fluxonium.pdf), https://meetings.aps.org/Meeting/MAR24/Session/G47.8

[APS March Meeting 2024 Measurement-Free quantum error correction, slides](/projects/mfqec/images/APSMM24_MFQEC.pdf), https://meetings.aps.org/Meeting/MAR24/Session/A49.8

# Posters

[IMSI quantum hardware workshop poster 2024, poster file](/projects/fluxonium_erasure/images/leakage_detection_poster.pdf), https://www.imsi.institute/quantum-hardware-poster-session/

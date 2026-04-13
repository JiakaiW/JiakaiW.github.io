
<style>
.publication-db {
    display: flex;
    flex-direction: column;
    width: 100%;
    margin: 2rem auto;
    border: var(--border-thickness) solid var(--color-border);
    border-radius: var(--radius-xl);
    background: var(--color-bg-base);
    overflow: hidden;
    box-shadow: var(--shadow-solid);
}
.db-header {
    display: grid;
    grid-template-columns: 2fr 1.5fr 1.5fr 120px;
    border-bottom: var(--border-thickness) solid var(--color-border);
    font-weight: 600;
    text-transform: uppercase;
    background: var(--color-bg-panes);
    color: var(--color-text-muted);
}
.db-header .db-cell {
    border-right: 1px dashed var(--color-border);
    padding: 0.75rem 1rem;
    font-size: 0.75rem;
}
.db-row {
    display: grid;
    grid-template-columns: 2fr 1.5fr 1.5fr 120px;
    border-bottom: var(--border-thickness) solid var(--color-border);
    transition: background var(--transition-base);
}
.db-row:hover {
    background: var(--color-hover-bg);
}
.db-row:hover .db-title {
    color: var(--color-hover-text);
}
.db-row:hover a {
    border-color: var(--color-accent-primary);
}
.db-row:hover a:hover {
    background: var(--color-accent-primary);
    color: var(--color-bg-base);
}
.db-row:last-child {
    border-bottom: none;
}
.db-cell {
    padding: 1rem;
    border-right: 1px dashed var(--color-border);
    font-family: var(--font-family-body);
    font-size: 0.85rem;
    display: flex;
    align-items: center;
}
.db-cell:last-child, .db-header .db-cell:last-child {
    border-right: none;
}
.db-title { font-weight: 600; color: var(--color-text-title); line-height: 1.4; display: block; transition: color var(--transition-fast); letter-spacing: 0.02em; }
.db-authors { color: var(--color-text-body); }
.db-venue { color: var(--color-text-muted); font-size: 0.8em; }
.db-links { display: flex; gap: 0.5rem; flex-wrap: wrap; }
.db-links a {
    border: 1px solid var(--color-accent-primary);
    padding: 2px 6px;
    text-decoration: none;
    color: var(--color-accent-primary);
    text-transform: uppercase;
    font-size: 0.75rem;
    font-weight: 700;
}
.db-links a:hover {
    background: var(--color-accent-primary);
    color: var(--color-bg-base);
}
@media (max-width: 768px) {
    .db-header { display: none; }
    .db-row { grid-template-columns: 1fr; }
    .db-cell { border-right: none; border-bottom: 1px dashed var(--color-border); padding: 0.75rem; }
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
        const arxivId = entry.querySelector('id')?.textContent.split['/abs/'](1);
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

    const headerHtml = `
        <div class="db-header">
            <div class="db-cell">TITLE</div>
            <div class="db-cell">AUTHORS</div>
            <div class="db-cell">VENUE / TIMESTAMP</div>
            <div class="db-cell">LINKS</div>
        </div>
    `;

    container.innerHTML = '<div class="publication-db">' + headerHtml + pubs.map(pub => {
        const authors = pub.authors.map(a =>
            a.includes('Jiakai') || a.includes('Wang, Jiakai') ? `<strong>${a}</strong>` : a
        ).join(', ');

        let venue = '';
        if (pub.journalRef) {
            venue = `<strong>${pub.journalRef}</strong><br>arXiv:${pub.arxivId}${pub.categories[0] ? ` [${pub.categories[0]}]` : ''}`;
        } else {
            venue = `arXiv:${pub.arxivId}${pub.categories[0] ? ` [${pub.categories[0]}]` : ''}`;
        }

        return `
        <div class="db-row">
            <div class="db-cell"><span class="db-title">${pub.title}</span></div>
            <div class="db-cell"><span class="db-authors">${authors}</span></div>
            <div class="db-cell"><span class="db-venue">${venue}</span></div>
            <div class="db-cell db-links">
                <a href="https://arxiv.org/abs/${pub.arxivId}" target="_blank">ARXIV_</a>
                <a href="https://arxiv.org/pdf/${pub.arxivId}.pdf" target="_blank">PDF_</a>
                ${pub.doi ? `<a href="https://doi.org/${pub.doi}" target="_blank">DOI_</a>` : ''}
            </div>
        </div>`;
    }).join('') + '</div>';

} catch (e) {
    console.error('Error loading publications:', e);
    container.innerHTML = `
        <div class="publication-db">
            <div class="db-header">
                <div class="db-cell">TITLE</div>
                <div class="db-cell">AUTHORS</div>
                <div class="db-cell">VENUE / TIMESTAMP</div>
                <div class="db-cell">LINKS</div>
            </div>
            <div class="db-row">
                <div class="db-cell"><span class="db-title">Proposal for erasure conversion in integer fluxonium qubits</span></div>
                <div class="db-cell"><span class="db-authors"><strong>Jiakai Wang</strong>, Raymond A. Mencia, Vladimir E. Manucharyan, Maxim G. Vavilov</span></div>
                <div class="db-cell"><span class="db-venue">arXiv:2603.21003 [quant-ph]</span></div>
                <div class="db-cell db-links">
                    <a href="https://arxiv.org/abs/2603.21003" target="_blank">ARXIV_</a>
                    <a href="https://arxiv.org/pdf/2603.21003.pdf" target="_blank">PDF_</a>
                </div>
            </div>
            <div class="db-row">
                <div class="db-cell"><span class="db-title">Fault-tolerant measurement-free quantum error correction with multi-qubit gates</span></div>
                <div class="db-cell"><span class="db-authors">Michael A. Perlin, Vickram N. Premakumar, <strong>Jiakai Wang</strong>, Mark Saffman, Robert Joynt</span></div>
                <div class="db-cell"><span class="db-venue"><strong>Phys. Rev. A 108, 062426 (2023)</strong></span></div>
                <div class="db-cell db-links">
                    <a href="https://arxiv.org/abs/2007.09804" target="_blank">ARXIV_</a>
                    <a href="https://arxiv.org/pdf/2007.09804.pdf" target="_blank">PDF_</a>
                    <a href="https://doi.org/10.1103/PhysRevA.108.062426" target="_blank">DOI_</a>
                </div>
            </div>
        </div>`;
}
</script>

<h2 class="section-title" style="margin-top:2em; margin-bottom:1em;">Talks & Posters</h2>

<div class="publication-db">
    <div class="db-header">
        <div class="db-cell">TITLE</div>
        <div class="db-cell">TYPE</div>
        <div class="db-cell">VENUE / TIMESTAMP</div>
        <div class="db-cell">LINKS</div>
    </div>

    <div class="db-row">
        <div class="db-cell"><span class="db-title">Selective darkening gate for gof integer fluxonium erasure detection</span></div>
        <div class="db-cell"><span class="db-authors">Talk</span></div>
        <div class="db-cell"><span class="db-venue">APS March Meeting 2026</span></div>
        <div class="db-cell db-links">
            <a href="https://summit.aps.org/events/MAR-C04/9" target="_blank">EVENT_</a>
        </div>
    </div>

    <div class="db-row">
        <div class="db-cell"><span class="db-title">Erasure conversion in integer fluxonium qubits</span></div>
        <div class="db-cell"><span class="db-authors">Talk</span></div>
        <div class="db-cell"><span class="db-venue">APS March Meeting 2025</span></div>
        <div class="db-cell db-links">
            <a href="/projects/fluxonium_erasure/images/Fluxonium_erasure.pptx" target="_blank">PPTX_</a>
            <a href="https://schedule.aps.org/smt/2025/events/MAR-J18/3" target="_blank">EVENT_</a>
        </div>
    </div>

    <div class="db-row">
        <div class="db-cell"><span class="db-title">Fluxonium leakage detection</span></div>
        <div class="db-cell"><span class="db-authors">Talk</span></div>
        <div class="db-cell"><span class="db-venue">APS March Meeting 2024</span></div>
        <div class="db-cell db-links">
            <a href="/projects/fluxonium_erasure/images/APSMM24_fluxonium.pdf" target="_blank">SLIDES_</a>
            <a href="https://meetings.aps.org/Meeting/MAR24/Session/G47.8" target="_blank">EVENT_</a>
        </div>
    </div>

    <div class="db-row">
        <div class="db-cell"><span class="db-title">Measurement-Free quantum error correction</span></div>
        <div class="db-cell"><span class="db-authors">Talk</span></div>
        <div class="db-cell"><span class="db-venue">APS March Meeting 2024</span></div>
        <div class="db-cell db-links">
            <a href="/projects/mfqec/images/APSMM24_MFQEC.pdf" target="_blank">SLIDES_</a>
            <a href="https://meetings.aps.org/Meeting/MAR24/Session/A49.8" target="_blank">EVENT_</a>
        </div>
    </div>

    <div class="db-row">
        <div class="db-cell"><span class="db-title">IMSI quantum hardware workshop</span></div>
        <div class="db-cell"><span class="db-authors">Poster</span></div>
        <div class="db-cell"><span class="db-venue">IMSI 2024</span></div>
        <div class="db-cell db-links">
            <a href="/projects/fluxonium_erasure/images/leakage_detection_poster.pdf" target="_blank">POSTER_</a>
            <a href="https://www.imsi.institute/quantum-hardware-poster-session/" target="_blank">EVENT_</a>
        </div>
    </div>
</div>

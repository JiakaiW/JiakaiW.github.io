/* Homepage interactive components — theme explorer, publications, gantt, news, tweaks */

// Module-scope data, hydrated by fetch() at DOMContentLoaded.
// Render functions read from these bindings; the explorer's tab-click handler
// also needs late access, so plain `let` + in-place assignment is simplest.
let themes = [];
let projects = [];
let timeline = [];
let news = [];
let techDocs = [];

const PUBLICATIONS = [
  { title:"Proposal for erasure conversion in integer fluxonium qubits",
    authors:["Jiakai Wang","Raymond A. Mencia","Vladimir E. Manucharyan","Maxim G. Vavilov"],
    venue:"arXiv:2603.21003 [quant-ph]", year:2026, arxiv:"2603.21003", doi:null },
  { title:"Fault-tolerant measurement-free quantum error correction with multiqubit gates",
    authors:["Michael A. Perlin","Vickram N. Premakumar","Jiakai Wang","Mark Saffman","Robert Joynt"],
    venue:"Phys. Rev. A 108, 062426", year:2023, arxiv:"2007.09804", doi:"10.1103/PhysRevA.108.062426" },
];

const TALKS = [
  { title:"Selective darkening gate for integer fluxonium erasure detection",
    type:"Talk", venue:"APS March Meeting 2026", date:"2026-03",
    link:"https://summit.aps.org/events/MAR-C04/9" },
  { title:"Erasure conversion in integer fluxonium qubits",
    type:"Talk", venue:"APS March Meeting 2025", date:"2025-03",
    link:"https://schedule.aps.org/smt/2025/events/MAR-J18/3" },
  { title:"Fluxonium leakage detection",
    type:"Talk", venue:"APS March Meeting 2024", date:"2024-03",
    link:"https://meetings.aps.org/Meeting/MAR24/Session/G47.8" },
  { title:"Measurement-free quantum error correction",
    type:"Talk", venue:"APS March Meeting 2024", date:"2024-03",
    link:"https://meetings.aps.org/Meeting/MAR24/Session/A49.8" },
  { title:"Integer fluxonium leakage detection",
    type:"Poster", venue:"IMSI Quantum Hardware Workshop", date:"2024-06",
    link:"https://www.imsi.institute/quantum-hardware-poster-session/" },
];

// ── Utilities ──────────────────────────────────────────────

function iconMask(id, size) {
  const img = document.createElement('img');
  img.src = `/assets/icons/themes/${id}.svg`;
  img.style.cssText = `width:${size}px;height:${size}px;-webkit-mask-image:url(/assets/icons/themes/${id}.svg);mask-image:url(/assets/icons/themes/${id}.svg);-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;-webkit-mask-position:center;mask-position:center;-webkit-mask-size:contain;mask-size:contain;background-color:currentColor;display:block;`;
  img.alt = id;
  return img;
}

function mono(text) {
  const s = document.createElement('span');
  s.className = 'mono';
  s.textContent = text;
  return s;
}

function hashCode(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i);
  return h;
}

// ── Theme Explorer ──────────────────────────────────────────

let activeTheme = 'all';

function renderThemeExplorer() {
  const container = document.getElementById('jw-theme-explorer');
  if (!container) return;

  const tabs = container.querySelector('.jw-explorer-tabs');
  const detail = container.querySelector('.jw-explorer-detail');
  if (!tabs || !detail) return;

  tabs.innerHTML = '';
  const allCounts = { all: projects.length };
  themes.forEach(t => { allCounts[t.id] = projects.filter(p => p.themes.includes(t.id)).length; });

  // All tab
  tabs.appendChild(makeThemeTab('all', null, 'All', allCounts.all));
  themes.forEach(t => tabs.appendChild(makeThemeTab(t.id, t.id, t.title, allCounts[t.id])));

  renderDetail(detail);
}

function makeThemeTab(id, iconId, title, count) {
  const btn = document.createElement('button');
  btn.className = `jw-theme-tab${iconId ? ` jw-theme-tab-${iconId}` : ''} ${id === activeTheme ? 'is-active' : ''}`;
  btn.dataset.themeId = id;

  if (iconId) {
    const iconWrap = document.createElement('span');
    iconWrap.className = 'jw-theme-tab-icon';
    iconWrap.appendChild(iconMask(iconId, 20));
    btn.appendChild(iconWrap);
  } else {
    const dot = document.createElement('span');
    dot.className = 'jw-theme-tab-dot';
    btn.appendChild(dot);
  }

  const titleSpan = document.createElement('span');
  titleSpan.className = 'jw-theme-tab-title';
  titleSpan.textContent = title;
  btn.appendChild(titleSpan);
  btn.appendChild(mono(String(count)));
  btn.querySelector('.mono').className = 'jw-theme-tab-count mono';

  btn.addEventListener('click', () => {
    activeTheme = id;
    document.querySelectorAll('.jw-theme-tab').forEach(b => b.classList.toggle('is-active', b.dataset.themeId === id));
    const detail = document.querySelector('.jw-explorer-detail');
    if (detail) renderDetail(detail);
  });
  return btn;
}

function renderDetail(detail) {
  detail.innerHTML = '';

  if (activeTheme !== 'all') {
    const theme = themes.find(t => t.id === activeTheme);
    if (theme) detail.appendChild(renderActiveThemeCard(theme));
  }

  const filtered = activeTheme === 'all' ? projects : projects.filter(p => p.themes.includes(activeTheme));
  detail.appendChild(renderProjectList(filtered));
}

function renderActiveThemeCard(theme) {
  const card = document.createElement('div');
  card.className = `jw-atc theme-${theme.id}`;

  const iconDiv = document.createElement('div');
  iconDiv.className = 'jw-atc-icon';
  iconDiv.appendChild(iconMask(theme.id, 56));
  card.appendChild(iconDiv);

  const body = document.createElement('div');
  body.className = 'jw-atc-body';
  const meta = document.createElement('div');
  meta.className = 'jw-atc-meta';
  meta.appendChild(mono(`THEME / ${(theme.tag || '').toUpperCase()}`));
  body.appendChild(meta);
  const h3 = document.createElement('h3');
  h3.textContent = theme.title;
  body.appendChild(h3);
  const p = document.createElement('p');
  p.textContent = theme.description;
  body.appendChild(p);
  const stats = document.createElement('div');
  stats.className = 'jw-atc-stats';
  [['completed','published'],['ongoing','in prep'],['potential','planned']].forEach(([key,label]) => {
    const d = document.createElement('div');
    const num = document.createElement('div');
    num.className = 'jw-stat-num mono';
    num.textContent = (theme.stats && theme.stats[key] != null) ? theme.stats[key] : 0;
    d.appendChild(num);
    const lbl = document.createElement('div');
    lbl.className = 'muted mono';
    lbl.textContent = label;
    d.appendChild(lbl);
    stats.appendChild(d);
  });
  body.appendChild(stats);
  card.appendChild(body);
  return card;
}

function renderProjectList(projectsArg) {
  const wrap = document.createElement('div');
  wrap.className = 'jw-project-list';

  const head = document.createElement('div');
  head.className = 'jw-project-list-head';
  ['idx','project','themes','yr','status',''].forEach(col => {
    const c = document.createElement('div');
    c.appendChild(mono(col.toUpperCase()));
    c.querySelector('.mono').classList.add('muted');
    head.appendChild(c);
  });
  wrap.appendChild(head);

  if (projectsArg.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'jw-project-row empty';
    empty.appendChild(mono('// no projects for this theme yet.'));
    wrap.appendChild(empty);
    return wrap;
  }

  projectsArg.forEach((p, i) => {
    const row = document.createElement('div');
    row.className = 'jw-project-row';

    // idx
    const idx = document.createElement('div');
    idx.className = 'jw-mono-idx';
    idx.appendChild(mono(String(i+1).padStart(2,'0')));
    idx.querySelector('.mono').classList.add('muted');
    row.appendChild(idx);

    // title + desc
    const titleCell = document.createElement('div');
    const title = document.createElement('div');
    title.className = 'jw-project-title';
    title.textContent = p.title;
    const desc = document.createElement('div');
    desc.className = 'jw-project-desc';
    desc.textContent = p.description;
    titleCell.appendChild(title);
    titleCell.appendChild(desc);
    row.appendChild(titleCell);

    // themes chips
    const themesCell = document.createElement('div');
    themesCell.className = 'jw-project-themes';
    p.themes.forEach(tid => {
      const chip = document.createElement('span');
      chip.className = `jw-chip jw-chip-${tid}`;
      chip.appendChild(iconMask(tid, 12));
      chip.querySelector('img').style.cssText += `background-color:var(--theme-${tid});`;
      chip.appendChild(mono(themes.find(t=>t.id===tid)?.short || tid));
      themesCell.appendChild(chip);
    });
    row.appendChild(themesCell);

    // year
    const yr = document.createElement('div');
    yr.className = 'jw-project-year';
    yr.appendChild(mono(p.year != null ? String(p.year) : '—'));
    row.appendChild(yr);

    // status pill
    const statusCell = document.createElement('div');
    statusCell.className = 'jw-project-status-cell';
    statusCell.appendChild(makePill(p.status));
    row.appendChild(statusCell);

    // link
    const linkCell = document.createElement('div');
    linkCell.className = 'jw-project-link-cell';
    if (p.url) {
      const a = document.createElement('a');
      a.href = p.url; a.target = '_blank'; a.rel = 'noopener';
      a.className = 'jw-project-link';
      a.appendChild(mono('OPEN_'));
      linkCell.appendChild(a);
    } else {
      const m = mono('—'); m.classList.add('muted'); linkCell.appendChild(m);
    }
    row.appendChild(linkCell);

    wrap.appendChild(row);
  });
  return wrap;
}

function makePill(status) {
  const labels = { completed:'PUBLISHED', ongoing:'IN PREP', potential:'PLANNED' };
  const pill = document.createElement('span');
  pill.className = `jw-pill jw-pill-${status}`;
  const dot = document.createElement('span');
  dot.className = `jw-dot jw-dot-${status}`;
  pill.appendChild(dot);
  pill.appendChild(mono(labels[status] || status));
  return pill;
}

// ── Publications ────────────────────────────────────────────

let activePubTab = 'papers';

function renderPublications() {
  const container = document.getElementById('jw-publications');
  if (!container) return;

  container.innerHTML = '';

  // Tabs
  const tabs = document.createElement('div');
  tabs.className = 'jw-pubs-tabs';
  [['papers',`PAPERS [${PUBLICATIONS.length}]`],['talks',`TALKS & POSTERS [${TALKS.length}]`]].forEach(([id,label]) => {
    const btn = document.createElement('button');
    btn.className = `jw-pubs-tab${activePubTab===id?' is-active':''}`;
    btn.dataset.tab = id;
    btn.appendChild(mono(label));
    btn.addEventListener('click', () => {
      activePubTab = id;
      document.querySelectorAll('.jw-pubs-tab').forEach(b => b.classList.toggle('is-active', b.dataset.tab === id));
      const tbl = document.getElementById('jw-pubs-table');
      if (tbl) { tbl.replaceWith(buildPubsTable()); }
    });
    tabs.appendChild(btn);
  });
  const rule = document.createElement('div');
  rule.style.cssText = 'flex:1;';
  tabs.appendChild(rule);
  container.appendChild(tabs);

  container.appendChild(buildPubsTable());
}

function buildPubsTable() {
  const wrap = document.createElement('div');
  wrap.id = 'jw-pubs-table';
  wrap.className = activePubTab === 'talks' ? 'jw-db jw-db-talks' : 'jw-db';

  if (activePubTab === 'papers') {
    // header
    const head = document.createElement('div');
    head.className = 'jw-db-head';
    ['TITLE','AUTHORS','VENUE','YR','LINKS'].forEach(h => {
      const c = document.createElement('div');
      c.className = 'jw-db-cell';
      c.appendChild(mono(h));
      head.appendChild(c);
    });
    wrap.appendChild(head);

    PUBLICATIONS.forEach(p => {
      const row = document.createElement('div');
      row.className = 'jw-db-row';

      const titleCell = document.createElement('div');
      titleCell.className = 'jw-db-cell';
      const t = document.createElement('div'); t.className = 'jw-db-title'; t.textContent = p.title;
      titleCell.appendChild(t); row.appendChild(titleCell);

      const authCell = document.createElement('div');
      authCell.className = 'jw-db-cell';
      const authDiv = document.createElement('div'); authDiv.className = 'jw-db-authors';
      p.authors.forEach((a, j) => {
        if (a.includes('Jiakai')) { const s = document.createElement('strong'); s.textContent = a; authDiv.appendChild(s); }
        else { authDiv.appendChild(document.createTextNode(a)); }
        if (j < p.authors.length - 1) authDiv.appendChild(document.createTextNode(', '));
      });
      authCell.appendChild(authDiv); row.appendChild(authCell);

      const venueCell = document.createElement('div');
      venueCell.className = 'jw-db-cell';
      const v = document.createElement('div'); v.className = 'jw-db-venue'; v.textContent = p.venue;
      venueCell.appendChild(v); row.appendChild(venueCell);

      const yrCell = document.createElement('div');
      yrCell.className = 'jw-db-cell';
      const yrM = mono(String(p.year)); yrM.classList.add('muted');
      yrCell.appendChild(yrM); row.appendChild(yrCell);

      const linkCell = document.createElement('div');
      linkCell.className = 'jw-db-cell';
      const links = document.createElement('div'); links.className = 'jw-db-links';
      if (p.arxiv) {
        const a1 = document.createElement('a'); a1.href = `https://arxiv.org/abs/${p.arxiv}`; a1.target='_blank'; a1.rel='noopener'; a1.appendChild(mono('ARXIV_')); links.appendChild(a1);
        const a2 = document.createElement('a'); a2.href = `https://arxiv.org/pdf/${p.arxiv}.pdf`; a2.target='_blank'; a2.rel='noopener'; a2.appendChild(mono('PDF_')); links.appendChild(a2);
      }
      if (p.doi) { const a3 = document.createElement('a'); a3.href = `https://doi.org/${p.doi}`; a3.target='_blank'; a3.rel='noopener'; a3.appendChild(mono('DOI_')); links.appendChild(a3); }
      linkCell.appendChild(links); row.appendChild(linkCell);

      wrap.appendChild(row);
    });
  } else {
    // Talks
    const head = document.createElement('div');
    head.className = 'jw-db-head';
    ['TITLE','TYPE','VENUE','DATE','LINK'].forEach(h => {
      const c = document.createElement('div'); c.className = 'jw-db-cell'; c.appendChild(mono(h)); head.appendChild(c);
    });
    wrap.appendChild(head);

    TALKS.forEach(t => {
      const row = document.createElement('div'); row.className = 'jw-db-row';

      const tc = document.createElement('div'); tc.className='jw-db-cell'; const td=document.createElement('div'); td.className='jw-db-title'; td.textContent=t.title; tc.appendChild(td); row.appendChild(tc);

      const tyc = document.createElement('div'); tyc.className='jw-db-cell'; const typ=document.createElement('span'); typ.className=`jw-ttype jw-ttype-${t.type.toLowerCase()}`; typ.appendChild(mono(t.type)); tyc.appendChild(typ); row.appendChild(tyc);

      const vc = document.createElement('div'); vc.className='jw-db-cell'; const vd=document.createElement('div'); vd.className='jw-db-venue'; vd.textContent=t.venue; vc.appendChild(vd); row.appendChild(vc);

      const dc = document.createElement('div'); dc.className='jw-db-cell'; const dm=mono(t.date); dm.classList.add('muted'); dc.appendChild(dm); row.appendChild(dc);

      const lc = document.createElement('div'); lc.className='jw-db-cell'; const ld=document.createElement('div'); ld.className='jw-db-links';
      if (t.link) { const a=document.createElement('a'); a.href=t.link; a.target='_blank'; a.rel='noopener'; a.appendChild(mono('EVENT_')); ld.appendChild(a); }
      lc.appendChild(ld); row.appendChild(lc);

      wrap.appendChild(row);
    });
  }
  return wrap;
}

// ── Gantt ───────────────────────────────────────────────────

function renderGantt() {
  const container = document.getElementById('jw-gantt');
  if (!container) return;

  const START_YEAR = 2021, END_YEAR = 2027;
  const months = (END_YEAR - START_YEAR) * 12;
  const today = new Date('2026-04-17');
  const toMonths = ym => { const [y,m] = ym.split('-').map(Number); return (y-START_YEAR)*12+(m-1); };
  const todayFrac = ((today.getFullYear()-START_YEAR)*12+today.getMonth()+today.getDate()/30)/months;

  const inner = document.createElement('div');
  inner.className = 'jw-gantt-inner';

  // Axis
  const axis = document.createElement('div'); axis.className = 'jw-gantt-axis';
  for (let y = START_YEAR; y <= END_YEAR; y++) {
    const frac = ((y-START_YEAR)*12)/months;
    const tick = document.createElement('div'); tick.className='jw-gantt-tick'; tick.style.left=`${frac*100}%`;
    const line = document.createElement('span'); line.className='jw-gantt-tick-line';
    const lbl = document.createElement('span'); lbl.className='jw-gantt-tick-label'; lbl.appendChild(mono(String(y)));
    tick.appendChild(line); tick.appendChild(lbl); axis.appendChild(tick);
  }
  inner.appendChild(axis);

  // Today marker — child of inner so it spans full chart height without overflowing
  const todayEl = document.createElement('div'); todayEl.className='jw-gantt-today';
  todayEl.style.left=`calc(var(--gantt-label-w, 320px) + ${todayFrac} * (100% - var(--gantt-label-w, 320px)))`;
  const todayLine = document.createElement('span'); todayLine.className='jw-gantt-today-line';
  const todayLbl = document.createElement('span'); todayLbl.className='jw-gantt-today-label'; todayLbl.appendChild(mono('NOW'));
  todayEl.appendChild(todayLine); todayEl.appendChild(todayLbl); inner.appendChild(todayEl);

  // Rows
  const body = document.createElement('div'); body.className='jw-gantt-body';
  timeline.forEach((item, i) => {
    const s = toMonths(item.start)/months;
    const e = toMonths(item.end)/months;
    const row = document.createElement('div'); row.className='jw-gantt-row';

    const label = document.createElement('div'); label.className='jw-gantt-label';
    const idx = document.createElement('span'); idx.className='jw-gantt-row-idx'; idx.appendChild(mono(String(i+1).padStart(2,'0')));
    const ttl = document.createElement('span'); ttl.className='jw-gantt-row-title'; ttl.textContent=item.title;
    label.appendChild(idx); label.appendChild(ttl); row.appendChild(label);

    const track = document.createElement('div'); track.className='jw-gantt-track';
    const bar = document.createElement('div');
    bar.className=`jw-gantt-bar jw-gantt-bar-${item.status}`;
    bar.style.cssText=`left:${s*100}%;width:${(e-s)*100}%;--bar-color:var(--theme-${item.theme})`;
    const barInner = document.createElement('span'); barInner.className='jw-gantt-bar-inner';
    barInner.appendChild(mono(item.start));
    const sep = document.createElement('span'); sep.className='jw-gantt-bar-sep'; sep.textContent=' → ';
    barInner.appendChild(sep);
    barInner.appendChild(mono(item.end));
    bar.appendChild(barInner);
    if (item.status==='ongoing') { const pulse=document.createElement('span'); pulse.className='jw-gantt-bar-pulse'; bar.appendChild(pulse); }
    track.appendChild(bar); row.appendChild(track);

    body.appendChild(row);
  });
  inner.appendChild(body);

  // Legend
  const legend = document.createElement('div'); legend.className='jw-gantt-legend';
  themes.forEach(t => {
    const item = document.createElement('span'); item.className='jw-gantt-legend-item';
    const sw = document.createElement('span'); sw.className='jw-gantt-legend-swatch'; sw.style.background=`var(--theme-${t.id})`;
    item.appendChild(sw); item.appendChild(mono(t.short)); item.querySelector('.mono').classList.add('muted');
    legend.appendChild(item);
  });
  const sep = document.createElement('span'); sep.className='jw-gantt-legend-sep'; legend.appendChild(sep);
  [['var(--text-muted)','SHIPPED','opacity:0.5'],['var(--accent-amber)','ACTIVE','']].forEach(([bg,lbl,extra]) => {
    const item = document.createElement('span'); item.className='jw-gantt-legend-item';
    const sw = document.createElement('span'); sw.className=`jw-gantt-legend-swatch${lbl==='ACTIVE'?' jw-gantt-legend-pulse':''}`; sw.style.cssText=`background:${bg};${extra}`;
    item.appendChild(sw); item.appendChild(mono(lbl)); item.querySelector('.mono').classList.add('muted');
    legend.appendChild(item);
  });
  inner.appendChild(legend);

  container.appendChild(inner);
}

// ── News log ────────────────────────────────────────────────

function renderNews() {
  const container = document.getElementById('jw-news');
  if (!container) return;
  const log = document.createElement('div'); log.className='jw-newslog';
  news.forEach(n => {
    const row = document.createElement('div'); row.className='jw-news-row';
    const rail = document.createElement('div'); rail.className='jw-news-rail';
    const hash = document.createElement('div'); hash.className='jw-news-hash';
    hash.appendChild(mono((Math.abs(hashCode(n.title))%0xfffff).toString(16).padStart(5,'0')));
    rail.appendChild(hash);
    const tag = document.createElement('span'); tag.className=`jw-news-tag jw-news-tag-${n.tag}`;
    tag.appendChild(mono((n.tag || '').toUpperCase())); rail.appendChild(tag);
    row.appendChild(rail);
    const main = document.createElement('div');
    const head = document.createElement('div'); head.className='jw-news-head';
    const date = document.createElement('span'); date.className='jw-news-date'; date.appendChild(mono(n.date));
    const title = document.createElement('span'); title.className='jw-news-title'; title.textContent=n.title;
    head.appendChild(date); head.appendChild(title); main.appendChild(head);
    const body = document.createElement('p'); body.className='jw-news-body'; body.textContent=n.body; main.appendChild(body);
    row.appendChild(main);
    log.appendChild(row);
  });
  container.appendChild(log);
}

// ── Tech Docs ───────────────────────────────────────────────

function renderTechDocs() {
  const container = document.getElementById('jw-techdocs');
  if (!container) return;

  // Build unique tag list from all docs
  const allTags = ['all', ...Array.from(new Set(techDocs.flatMap(d => d.tags)))];

  let activeTag = 'all';

  const wrapper = document.createElement('div');
  wrapper.className = 'jw-techdocs';

  // Filter bar
  const filters = document.createElement('div');
  filters.className = 'jw-techdocs-filters';
  allTags.forEach(tag => {
    const btn = document.createElement('button');
    btn.className = 'jw-tag-btn' + (tag === 'all' ? ' is-active' : '');
    btn.appendChild(mono(tag === 'all' ? `ALL [${techDocs.length}]` : tag));
    btn.addEventListener('click', () => {
      activeTag = tag;
      filters.querySelectorAll('.jw-tag-btn').forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      renderCards();
    });
    filters.appendChild(btn);
  });
  wrapper.appendChild(filters);

  // Card grid
  const grid = document.createElement('div');
  grid.className = 'jw-techdocs-grid';
  wrapper.appendChild(grid);

  function renderCards() {
    grid.innerHTML = '';
    const docs = activeTag === 'all' ? techDocs : techDocs.filter(d => d.tags.includes(activeTag));
    docs.forEach((doc, i) => {
      const card = document.createElement('a');
      card.className = 'jw-tdoc-card';
      card.href = doc.url;
      card.rel = 'noopener';

      const head = document.createElement('div'); head.className = 'jw-tdoc-head';
      const idx = document.createElement('span'); idx.className = 'jw-tdoc-idx';
      idx.appendChild(mono(String(i + 1).padStart(2, '0')));
      const tags = document.createElement('div'); tags.className = 'jw-tdoc-tags';
      doc.tags.slice(0, 3).forEach(t => {
        const tag = document.createElement('span'); tag.className = 'jw-tdoc-tag';
        tag.appendChild(mono(t)); tags.appendChild(tag);
      });
      head.appendChild(idx); head.appendChild(tags);

      const body = document.createElement('div'); body.className = 'jw-tdoc-body';
      const title = document.createElement('h3'); title.className = 'jw-tdoc-title'; title.textContent = doc.title;
      const desc = document.createElement('p'); desc.className = 'jw-tdoc-desc'; desc.textContent = doc.description;
      body.appendChild(title); body.appendChild(desc);

      const foot = document.createElement('div'); foot.className = 'jw-tdoc-foot';
      const lbl = document.createElement('span'); lbl.appendChild(mono('READ_'));
      const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      arrow.setAttribute('width', '14'); arrow.setAttribute('height', '14');
      arrow.setAttribute('viewBox', '0 0 24 24'); arrow.setAttribute('fill', 'none');
      arrow.setAttribute('stroke', 'currentColor'); arrow.setAttribute('stroke-width', '2');
      arrow.setAttribute('stroke-linecap', 'round'); arrow.setAttribute('stroke-linejoin', 'round');
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', 'M7 17L17 7M7 7h10v10'); arrow.appendChild(path);
      foot.appendChild(lbl); foot.appendChild(arrow);

      card.appendChild(head); card.appendChild(body); card.appendChild(foot);
      grid.appendChild(card);
    });
  }

  renderCards();
  container.appendChild(wrapper);
}

// ── Tweaks panel ────────────────────────────────────────────

const TWEAK_DEFAULTS = { mode:'dark', density:'cozy', displayFont:'sans', accent:'lime', grid:'on' };

function initTweaks() {
  let tweaks;
  try { tweaks = { ...TWEAK_DEFAULTS, ...JSON.parse(localStorage.getItem('jw.tweaks') || '{}') }; }
  catch { tweaks = { ...TWEAK_DEFAULTS }; }

  // Sync mode with existing jw.mode key
  const savedMode = localStorage.getItem('jw.mode');
  if (savedMode) tweaks.mode = savedMode;

  applyTweaks(tweaks);

  const fab = document.getElementById('jw-tweaks-fab');
  const panel = document.getElementById('jw-tweaks-panel');
  if (!fab || !panel) return;

  fab.addEventListener('click', () => { panel.classList.add('is-open'); fab.style.display='none'; });

  const close = panel.querySelector('.jw-tweaks-close');
  if (close) close.addEventListener('click', () => { panel.classList.remove('is-open'); fab.style.display=''; });

  // Mode buttons
  panel.querySelectorAll('[data-tweak-mode]').forEach(btn => {
    btn.classList.toggle('is-active', btn.dataset.tweakMode === tweaks.mode);
    btn.addEventListener('click', () => {
      tweaks.mode = btn.dataset.tweakMode;
      panel.querySelectorAll('[data-tweak-mode]').forEach(b => b.classList.toggle('is-active', b === btn));
      applyTweaks(tweaks); saveTweaks(tweaks);
    });
  });
  // Density
  panel.querySelectorAll('[data-tweak-density]').forEach(btn => {
    btn.classList.toggle('is-active', btn.dataset.tweakDensity === tweaks.density);
    btn.addEventListener('click', () => {
      tweaks.density = btn.dataset.tweakDensity;
      panel.querySelectorAll('[data-tweak-density]').forEach(b => b.classList.toggle('is-active', b === btn));
      applyTweaks(tweaks); saveTweaks(tweaks);
    });
  });
  // Display font
  panel.querySelectorAll('[data-tweak-font]').forEach(btn => {
    btn.classList.toggle('is-active', btn.dataset.tweakFont === tweaks.displayFont);
    btn.addEventListener('click', () => {
      tweaks.displayFont = btn.dataset.tweakFont;
      panel.querySelectorAll('[data-tweak-font]').forEach(b => b.classList.toggle('is-active', b === btn));
      applyTweaks(tweaks); saveTweaks(tweaks);
    });
  });
  // Accent swatches
  panel.querySelectorAll('[data-tweak-accent]').forEach(btn => {
    btn.classList.toggle('is-active', btn.dataset.tweakAccent === tweaks.accent);
    btn.addEventListener('click', () => {
      tweaks.accent = btn.dataset.tweakAccent;
      panel.querySelectorAll('[data-tweak-accent]').forEach(b => b.classList.toggle('is-active', b === btn));
      applyTweaks(tweaks); saveTweaks(tweaks);
    });
  });
  // Grid
  panel.querySelectorAll('[data-tweak-grid]').forEach(btn => {
    btn.classList.toggle('is-active', btn.dataset.tweakGrid === tweaks.grid);
    btn.addEventListener('click', () => {
      tweaks.grid = btn.dataset.tweakGrid;
      panel.querySelectorAll('[data-tweak-grid]').forEach(b => b.classList.toggle('is-active', b === btn));
      applyTweaks(tweaks); saveTweaks(tweaks);
    });
  });
}

function applyTweaks(tweaks) {
  const root = document.documentElement;
  root.dataset.mode = tweaks.mode;
  root.dataset.density = tweaks.density;
  root.dataset.displayFont = tweaks.displayFont;
  root.dataset.accent = tweaks.accent;
  root.dataset.grid = tweaks.grid;
  document.body.classList.toggle('dark-mode', tweaks.mode === 'dark');
  localStorage.setItem('jw.mode', tweaks.mode);
}

function saveTweaks(tweaks) {
  try { localStorage.setItem('jw.tweaks', JSON.stringify(tweaks)); } catch {}
}

// ── Init ────────────────────────────────────────────────────

async function loadHomeData() {
  const urls = [
    '/projects-data.json',
    '/timeline-data.json',
    '/news-feed.json',
    '/tech-docs.json',
  ];
  const [pd, td, nd, dd] = await Promise.all(
    urls.map(u => fetch(u).then(r => {
      if (!r.ok) throw new Error(`${u} -> ${r.status}`);
      return r.json();
    }))
  );
  themes = pd.themes || [];
  projects = pd.projects || [];
  timeline = (td && td.projects) ? td.projects : [];
  news = (nd && nd.news) ? nd.news : [];
  techDocs = (dd && dd.docs) ? dd.docs : [];
}

document.addEventListener('DOMContentLoaded', async () => {
  renderPublications();
  initTweaks();
  try {
    await loadHomeData();
  } catch (e) {
    console.error('home-design: data load failed', e);
    return;
  }
  renderThemeExplorer();
  renderGantt();
  renderNews();
  renderTechDocs();
});

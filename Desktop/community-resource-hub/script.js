const DATA_URL = 'data/resources.json';
const STORAGE_KEY = 'crh_user_resources_v1';
const POSTS_KEY = 'crh_community_posts_v1';

// fetch base resources.json then merge with localStorage additions
async function loadAllResources() {
  let base = [];
  try {
    const res = await fetch(DATA_URL, {cache: "no-store"});
    base = await res.json();
  } catch (e) {
    console.error('Could not load resources.json', e);
  }

  // parse local additions
  const localRaw = localStorage.getItem(STORAGE_KEY);
  let local = [];
  if (localRaw) {
    try { local = JSON.parse(localRaw) } catch {}
  }

  // merge but avoid id collisions: if local resources have id, keep them; else give new id
  const maxId = base.reduce((m, r) => Math.max(m, r.id || 0), 0);
  let nextId = maxId + 1;
  local = local.map(item => {
    if (!item.id) item.id = nextId++;
    return item;
  });

  const merged = [...base, ...local];
  return merged;
}

// write a new user resource to localStorage
function saveUserResource(resource) {
  const raw = localStorage.getItem(STORAGE_KEY);
  let arr = raw ? JSON.parse(raw) : [];
  resource.id = resource.id || Date.now();
  arr.push(resource);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
}

// DOM helpers for cards
function makeCardHTML(r) {
  const websiteLink = r.website ? `<a href="${r.website}" target="_blank" rel="noopener">Website</a>` : '';
  return `
    <div class="card">
      <h3>${escapeHtml(r.name)}</h3>
      <div class="meta">${escapeHtml(r.category)} • ${escapeHtml(r.location)} ${r.contact ? ' • ' + escapeHtml(r.contact) : ''}</div>
      <div class="desc">${escapeHtml(r.description)}</div>
      <div style="margin-top:10px;font-size:13px">${websiteLink}</div>
    </div>
  `;
}

// simple escaper
function escapeHtml(s){
  if(!s) return '';
  return s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
}

// render list into container
function renderList(list, containerId){
  const c = document.getElementById(containerId);
  if(!c) return;
  if(list.length === 0){
    c.innerHTML = '<div class="card"><div style="color:#6b7280">No results</div></div>';
    return;
  }
  c.innerHTML = list.map(r => makeCardHTML(r)).join('');
}

// get unique sorted values
function uniqueSorted(arr) {
  return [...new Set(arr)].sort((a,b)=> a.localeCompare(b));
}

/* ---------- Page specific setup ---------- */

window.addEventListener('DOMContentLoaded', async () => {
  // always load resources once
  const all = await loadAllResources();

  /* Home page: featured + community posts + export button */
  const featuredBox = document.getElementById('featured');
  if (featuredBox) {
    // prefer items with featured:true, else pick first three
    const featured = all.filter(r => r.featured).slice(0,3);
    const picks = featured.length ? featured : all.slice(0,3);
    featuredBox.innerHTML = picks.map(r => `
      <div class="card featured-large">
        <h3>${escapeHtml(r.name)}</h3>
        <div class="meta">${escapeHtml(r.category)} • ${escapeHtml(r.location)}</div>
        <div class="desc">${escapeHtml(r.description)}</div>
        <div style="margin-top:10px;font-size:13px">${r.contact ? escapeHtml(r.contact) : ''}</div>
      </div>
    `).join('');
  }

  // posts / community board
  const postsEl = document.getElementById('posts');
  const postBtn = document.getElementById('post-btn');
  const postTitle = document.getElementById('post-title');
  const postDate = document.getElementById('post-date');

  function loadPosts(){
    const raw = localStorage.getItem(POSTS_KEY);
    let arr = raw ? JSON.parse(raw) : [];
    arr = arr.sort((a,b)=> b.created - a.created);
    if(postsEl) postsEl.innerHTML = arr.map(p => `
      <div class="card">
        <div style="font-weight:700">${escapeHtml(p.title)}</div>
        <div class="meta">${p.date ? escapeHtml(p.date) : ''}</div>
        <div style="font-size:13px;color:#4a5568;margin-top:8px">Posted ${new Date(p.created).toLocaleString()}</div>
      </div>
    `).join('') || '<div style="color:#6b7280">No posts yet</div>';
  }
  if (postBtn && postTitle) {
    postBtn.addEventListener('click', () => {
      const title = postTitle.value.trim();
      if (!title) { alert('Add a post title'); return; }
      const date = postDate.value || '';
      const raw = localStorage.getItem(POSTS_KEY);
      let arr = raw ? JSON.parse(raw) : [];
      arr.push({title, date, created: Date.now()});
      localStorage.setItem(POSTS_KEY, JSON.stringify(arr));
      postTitle.value = '';
      postDate.value = '';
      loadPosts();
    });
    loadPosts();
  }

  // export JSON
  const exportBtn = document.getElementById('export-json');
  if (exportBtn) {
    exportBtn.addEventListener('click', async () => {
      const data = await loadAllResources();
      const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'community-resources.json';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    });
  }

  /* Directory page setup */
  const resultsEl = document.getElementById('results');
  if (resultsEl) {
    // populate filter options from data
    const cats = uniqueSorted(all.map(r => r.category).filter(Boolean));
    const locs = uniqueSorted(all.map(r => r.location).filter(Boolean));

    const catSel = document.getElementById('category-filter');
    const locSel = document.getElementById('location-filter');
    catSel.innerHTML = `<option value="">All categories</option>` + cats.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');
    locSel.innerHTML = `<option value="">All locations</option>` + locs.map(l => `<option value="${escapeHtml(l)}">${escapeHtml(l)}</option>`).join('');

    // simple search + filters
    const searchInput = document.getElementById('search');
    const clearBtn = document.getElementById('clear-filters');

    function apply() {
      const q = searchInput.value.trim().toLowerCase();
      const c = catSel.value;
      const l = locSel.value;
      let out = all.slice();

      if (q) out = out.filter(r => (r.name||'').toLowerCase().includes(q) || (r.description||'').toLowerCase().includes(q) || (r.category||'').toLowerCase().includes(q));
      if (c) out = out.filter(r => r.category === c);
      if (l) out = out.filter(r => r.location === l);

      renderList(out, 'results');
    }

    searchInput.addEventListener('input', apply);
    catSel.addEventListener('change', apply);
    locSel.addEventListener('change', apply);
    clearBtn.addEventListener('click', () => { searchInput.value=''; catSel.value=''; locSel.value=''; apply(); });

    // initial render
    renderList(all, 'results');
  }

  /* Submit page setup */
  const submitForm = document.getElementById('submit-form');
  if (submitForm) {
    submitForm.addEventListener('submit', (ev) => {
      ev.preventDefault();
      const name = document.getElementById('name').value.trim();
      const category = document.getElementById('category').value.trim();
      const location = document.getElementById('location').value.trim();
      const contact = document.getElementById('contact').value.trim();
      const description = document.getElementById('description').value.trim();
      if (!name || !category || !location || !description) {
        alert('Please fill the required fields');
        return;
      }
      const obj = { name, category, location, contact, description, featured: false };
      saveUserResource(obj);
      document.getElementById('submit-message').style.display = 'block';
      submitForm.reset();
    });
    document.getElementById('submit-clear').addEventListener('click', () => submitForm.reset());
  }

});
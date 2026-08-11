// script.js — final corrected renderer with description fallback and diagnostics

async function loadJSON(path) {
  try {
    console.info('Loading', path);
    const res = await fetch(path, { cache: 'no-cache' });
    if (!res.ok) {
      const t = await res.text().catch(() => '');
      throw new Error(`${path} load failed: ${res.status} ${res.statusText} ${t}`);
    }
    return await res.json();
  } catch (err) {
    console.error('loadJSON error:', err);
    throw err;
  }
}

function formatDates(start, end) {
  if (!start && !end) return '';
  return start && end ? `${start} — ${end}` : start ? `${start} — Present` : end ? `Until ${end}` : '';
}

function createCardHTML(titleHTML, bodyHTML) {
  return `<div class="card">\n  ${titleHTML}\n  <div class="meta">${bodyHTML}</div>\n</div>`;
}

function showSectionError(sectionId, message) {
  const root = document.getElementById(sectionId);
  if (!root) return;
  root.innerHTML = `<div class="card"><strong>Error</strong><p class="muted">${message}</p></div>`;
}

function escapeHTML(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/* Experience renderer */
function renderExperience(exps) {
  console.info('Rendering experience, count=', (exps || []).length);
  const root = document.getElementById('experience-list') || document.getElementById('experience-grid');
  if (!root) { console.warn('No experience root found'); return; }
  root.innerHTML = '';

  (exps || []).forEach(exp => {
    const title = `<h3 class="role">${escapeHTML(exp.role || '')}</h3>` +
      `<div class="company">${escapeHTML(exp.company || '')}${exp.location ? ' • ' + escapeHTML(exp.location) : ''}</div>` +
      `<div class="dates">${escapeHTML(formatDates(exp.start, exp.end))}</div>`;

    const bullets = (exp.bullets || []).map(b => `<li>${escapeHTML(b)}</li>`).join('');
    const body = `<ul class="bullets">${bullets}</ul>`;
    const html = createCardHTML(title, body);
    const wrapper = document.createElement('div');
    wrapper.className = 'experience-item';
    wrapper.innerHTML = html;
    root.appendChild(wrapper);
  });
}

/* Projects renderer */
function renderProjects(projects) {
  console.info('Rendering projects, count=', (projects || []).length);
  const root = document.getElementById('projects-grid');
  if (!root) return;
  root.innerHTML = '';
  (projects || []).forEach(p => {
    const title = `<h3>${escapeHTML(p.title || '')}</h3>`;
    // support both 'summary' and older 'description' keys
    const summaryText = p.summary || p.description || '';
    const summary = `<p class="summary">${escapeHTML(summaryText)}</p>`;
    const tech = p.tech ? `<p class="tech">${Array.isArray(p.tech) ? escapeHTML(p.tech.join(', ')) : escapeHTML(p.tech)}</p>` : '';
    const cta = p.link ? `<a class="btn" href="${escapeHTML(p.link)}" target="_blank" rel="noopener">View project</a>` : '';
    const html = `<div class="card project-card">${title}${summary}${tech}${cta}</div>`;
    const wrapper = document.createElement('div');
    wrapper.innerHTML = html;
    root.appendChild(wrapper);
  });
}

/* Skills renderer */
function renderSkills(skills) {
  console.info('Rendering skills, count=', (skills || []).length);
  const root = document.getElementById('skills-list');
  if (!root) return;
  root.innerHTML = '';
  (skills || []).forEach(s => {
    const label = typeof s === 'string' ? s : (s.name || JSON.stringify(s));
    const el = document.createElement('div');
    el.className = 'card skill';
    el.textContent = label;
    root.appendChild(el);
  });
}

function setAbout(text) {
  const el = document.getElementById('about-text');
  if (!el) return;
  el.textContent = text || '';
}

function setupContactForm() {
  const form = document.getElementById('contact-form');
  const status = document.getElementById('contact-status');
  if (!form) return;

  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    status.textContent = 'Sending…';
    const payload = {
      name: form.name?.value || '',
      email: form.email?.value || '',
      message: form.message?.value || ''
    };
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const t = await res.text().catch(() => '');
        throw new Error(`contact failed: ${res.status} ${res.statusText} ${t}`);
      }
      status.textContent = 'Thanks — message sent.';
      form.reset();
    } catch (err) {
      console.error('contact error', err);
      status.textContent = 'Could not send message. Try again later.';
    }
  });
}

async function init() {
  console.info('portfolio init');
  try {
    const site = await loadJSON('data/site.json').catch(() => ({}));
    const aboutText = site.about || `I’m a Computer Science and Engineering graduate from VIT Vellore with hands-on experience in data engineering, analytics, and cloud-based workflows. Through internships at MSD Pharma, Olam Agri, and NSIC, I’ve worked on ETL pipelines, data transformation, validation, dashboarding, and reporting using Python, SQL, Snowflake, Power BI, Dataiku, Databricks, and AWS. I’m a Databricks Data Engineer Associate and Oracle Cloud Infrastructure 2025 Foundations Associate, with a strong foundation in building data-driven solutions and automation workflows. Beyond internships, I’ve developed patent-published IoT systems, AI-based accessibility projects, and campus tech solutions like shuttle tracking. My interests lie in data engineering, cloud platforms, and building practical tech that solves real problems. I enjoy learning, experimenting, and contributing to projects that combine engineering with measurable impact.`;
    setAbout(aboutText);
  } catch (e) {
    console.warn('site.json load failed', e);
  }

  try {
    const experience = await loadJSON('data/experience.json');
    if (!Array.isArray(experience)) throw new Error('experience.json is not an array');
    renderExperience(experience);
  } catch (e) {
    console.error('Experience load failed', e);
    showSectionError('experience-list', 'Could not load experience data. Check data/experience.json and console for details.');
  }

  try {
    const projects = await loadJSON('data/projects.json');
    renderProjects(Array.isArray(projects) ? projects : []);
  } catch (e) {
    console.warn('Projects load failed', e);
  }

  try {
    const skills = await loadJSON('data/skills.json');
    renderSkills(Array.isArray(skills) ? skills : []);
  } catch (e) {
    console.warn('Skills load failed', e);
  }

  setupContactForm();
}

document.addEventListener('DOMContentLoaded', init);

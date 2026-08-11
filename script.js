/* script.js v6 — renderer for the portfolio site (dark polished) */

async function loadJSON(path) {
  const res = await fetch(path, {cache: "no-cache"});
  if (!res.ok) { throw new Error(`Failed to load ${path}: ${res.status}`); }
  return res.json();
}

function formatDates(start, end) {
  if (!start && !end) return "";
  return start && end ? `${start} — ${end}` : start ? `${start} — Present` : end ? `Until ${end}` : "";
}

function createCardHTML(titleHTML, bodyHTML) {
  return `<div class="card">${titleHTML}<div class="meta">${bodyHTML}</div></div>`;
}

function renderExperience(exps) {
  const root = document.getElementById('experience-list');
  if (!root) return;
  root.innerHTML = '';
  exps.forEach(exp => {
    const title = `<h3 class="role">${exp.role}</h3><div class="company">${exp.company}${exp.location ? ' • ' + exp.location : ''}</div><div class="dates">${formatDates(exp.start, exp.end)}</div>`;
    const bullets = (exp.bullets || []).map(b => `<li>${b}</li>`).join('');
    const body = `<ul class="bullets">${bullets}</ul>`;
    const wrapper = document.createElement('div');
    wrapper.className = 'experience-item';
    wrapper.innerHTML = createCardHTML(title, body);
    root.appendChild(wrapper);
  });
}

function renderProjects(projects) {
  const root = document.getElementById('projects-grid');
  if (!root) return;
  root.innerHTML = '';
  projects.forEach(p => {
    const title = `<h3>${p.title}</h3>`;
    const summary = `<p class="summary">${p.summary || ''}</p>`;
    const tech = p.tech ? `<p class="tech">${(Array.isArray(p.tech) ? p.tech.join(', ') : p.tech)}</p>` : '';
    const cta = p.link ? `<a class="btn" href="${p.link}" target="_blank" rel="noopener">View project</a>` : '';
    const el = document.createElement('div');
    el.innerHTML = `<div class="card project-card">${title}${summary}${tech}${cta}</div>`;
    root.appendChild(el);
  });
}

function renderSkills(skills) {
  const root = document.getElementById('skills-list');
  if (!root) return;
  root.innerHTML = '';
  skills.forEach(s => {
    const label = typeof s === 'string' ? s : (s.name || JSON.stringify(s));
    const el = document.createElement('div');
    el.className = 'card skill';
    el.innerHTML = `<strong>${label}</strong>`;
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
    const data = {
      name: form.name?.value || '',
      email: form.email?.value || '',
      message: form.message?.value || ''
    };

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => '');
        throw new Error(`Server ${res.status} ${res.statusText} ${txt}`);
      }
      status.textContent = 'Thanks — message sent.';
      form.reset();
    } catch (err) {
      console.error(err);
      status.textContent = 'Could not send message. Try again later or email directly.';
    }
  });
}

async function init() {
  try {
    const site = await loadJSON('data/site.json').catch(() => ({}));
    const aboutText = site.about || `I’m a Computer Science and Engineering graduate from VIT Vellore with hands-on experience in data engineering, analytics, and cloud-based workflows. Through internships at MSD Pharma, Olam Agri, and NSIC, I’ve worked on ETL pipelines, data transformation, validation, dashboarding, and reporting using Python, SQL, Snowflake, Power BI, Dataiku, Databricks, and AWS. I’m a Databricks Data Engineer Associate and Oracle Cloud Infrastructure 2025 Foundations Associate, with a strong foundation in building data-driven solutions and automation workflows. Beyond internships, I’ve developed patent-published IoT systems, AI-based accessibility projects, and campus tech solutions like shuttle tracking. My interests lie in data engineering, cloud platforms, and building practical tech that solves real problems. I enjoy learning, experimenting, and contributing to projects that combine engineering with measurable impact.`;
    setAbout(aboutText);
  } catch (e) {
    console.warn('site.json load failed', e);
  }

  try {
    const experience = await loadJSON('data/experience.json');
    if (Array.isArray(experience)) renderExperience(experience);
  } catch (e) {
    console.warn('Experience load failed', e);
  }

  try {
    const projects = await loadJSON('data/projects.json');
    if (Array.isArray(projects)) renderProjects(projects);
  } catch (e) {
    console.warn('Projects load failed', e);
  }

  try {
    const skills = await loadJSON('data/skills.json');
    if (Array.isArray(skills)) renderSkills(skills);
  } catch (e) {
    console.warn('Skills load failed', e);
  }

  setupContactForm();
}

document.addEventListener('DOMContentLoaded', init);

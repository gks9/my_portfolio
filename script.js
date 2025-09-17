async function loadJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load ${path}`);
  return res.json();
}

function setText(id, text) {
  const el = document.getElementById(id);
  if (el && text) el.textContent = text;
}

function setHref(id, href) {
  const el = document.getElementById(id);
  if (el && href) el.href = href;
}

function createProjectCard(p) {
  const div = document.createElement('div');
  div.className = 'card';
  div.innerHTML = `
    <h3>${p.title}</h3>
    <p>${p.description || ''}</p>
    <div class="meta">${(p.tech || []).join(' • ')}</div>
    ${p.link ? `<p><a href="${p.link}" target="_blank" rel="noopener">View project</a></p>` : ''}
  `;
  return div;
}

function createRoleCard(r) {
  const div = document.createElement('div');
  div.className = 'card';
  const when = [r.start, r.end].filter(Boolean).join(' — ');
  div.innerHTML = `
    <h3>${r.role}${r.company ? `, ${r.company}` : ''}</h3>
    <div class="meta">${[when, r.location].filter(Boolean).join(' • ')}</div>
    ${Array.isArray(r.bullets) && r.bullets.length ? `<ul>${r.bullets.map(b => `<li>${b}</li>`).join('')}</ul>` : ''}
  `;
  return div;
}

function createEduCard(e) {
  const div = document.createElement('div');
  div.className = 'card';
  const when = [e.start, e.end].filter(Boolean).join(' — ');
  div.innerHTML = `
    <h3>${e.degree || e.level}${e.school ? `, ${e.school}` : ''}</h3>
    <div class="meta">${[when, e.details].filter(Boolean).join(' • ')}</div>
  `;
  return div;
}

function createCertItem(c) {
  const li = document.createElement('li');
  const label = [c.title, c.issuer, c.date].filter(Boolean).join(' — ');
  li.innerHTML = c.link ? `<a href="${c.link}" target="_blank" rel="noopener">${label}</a>` : label;
  return li;
}

async function main() {
  setText('year', String(new Date().getFullYear()));

  // Load core site config
  try {
    const site = await loadJSON('data/site.json');
    setText('site-name', site.name);
    setText('footer-name', site.name);
    setText('site-tagline', site.tagline);
    setText('about-text', site.about);
    setText('location-text', site.location);

    setHref('linkedin-link', site.linkedin);
    setHref('github-link', site.github);
    setHref('email-link', site.email ? `mailto:${site.email}` : null);
    setHref('resume-link', site.resume || 'resume.pdf');

    const avatar = document.getElementById('profile-photo');
    if (avatar && site.photo) {
      avatar.src = site.photo;
      avatar.style.display = 'block';
    } else if (avatar) {
      avatar.style.display = 'none';
    }
  } catch (e) {
    console.warn('Site JSON not found or invalid, using defaults.', e);
  }

  // Skills
  try {
    const skills = await loadJSON('data/skills.json');
    const ul = document.getElementById('skills-list');
    if (ul && Array.isArray(skills)) {
      ul.innerHTML = skills.map(s => `<li>${s}</li>`).join('');
    }
  } catch (e) { console.warn('Skills JSON not found.', e); }

  // Certifications
  try {
    const certs = await loadJSON('data/certifications.json');
    const ul = document.getElementById('certs-list');
    if (ul && Array.isArray(certs)) {
      certs.forEach(c => ul.appendChild(createCertItem(c)));
    }
  } catch (e) { console.warn('Certifications JSON not found.', e); }

  // Experience
  try {
    const experience = await loadJSON('data/experience.json');
    const grid = document.getElementById('experience-grid');
    if (grid && Array.isArray(experience)) {
      experience.forEach(r => grid.appendChild(createRoleCard(r)));
    }
  } catch (e) { console.warn('Experience JSON not found.', e); }

  // Education
  try {
    const education = await loadJSON('data/education.json');
    const grid = document.getElementById('education-grid');
    if (grid && Array.isArray(education)) {
      education.forEach(e => grid.appendChild(createEduCard(e)));
    }
  } catch (e) { console.warn('Education JSON not found.', e); }

  // Leadership
  try {
    const leadership = await loadJSON('data/leadership.json');
    const grid = document.getElementById('leadership-grid');
    if (grid && Array.isArray(leadership)) {
      leadership.forEach(r => grid.appendChild(createRoleCard(r)));
    }
  } catch (e) { console.warn('Leadership JSON not found.', e); }

  // Projects
  try {
    const projects = await loadJSON('data/projects.json');
    const grid = document.getElementById('projects-grid');
    if (grid && Array.isArray(projects)) {
      projects.forEach(p => grid.appendChild(createProjectCard(p)));
    }
  } catch (e) { console.warn('Projects JSON not found or invalid.', e); }

  // Contact form
  const form = document.getElementById('contact-form');
  const status = document.getElementById('contact-status');
  if (form) {
    form.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      const name = document.getElementById('name').value.trim();
      const from = document.getElementById('email').value.trim();
      const message = document.getElementById('message').value.trim();
      status.textContent = 'Sending...';
      try {
        const res = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, from, message })
        });
        if (res.ok) {
          status.textContent = 'Thanks! Message sent.';
          form.reset();
          return;
        }
        throw new Error(`API responded ${res.status}`);
      } catch {
        const to = (document.getElementById('email-link')?.href || '').replace('mailto:', '') || 'gksrikar9@gmail.com';
        const subject = `Portfolio contact from ${name}`;
        const body = `${message}\n\nReply-to: ${from}`;
        window.location.href = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        status.textContent = 'Opening email client...';
      }
    });
  }
}

main();

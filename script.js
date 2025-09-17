async function loadJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load ${path}`);
  return res.json();
}

function setText(id, text) {
  const el = document.getElementById(id);
  if (el && text) el.textContent = text;
}

function createProjectCard(p) {
  const div = document.createElement('div');
  div.className = 'card';
  div.innerHTML = `
    <h3>${p.title}</h3>
    <p>${p.description || ''}</p>
    <div>${(p.tech || []).map(t => `<span class="badge">${t}</span>`).join(' ')}</div>
    ${p.link ? `<p><a href="${p.link}" target="_blank" rel="noopener">View project</a></p>` : ''}
  `;
  return div;
}

async function main() {
  setText('year', String(new Date().getFullYear()));

  try {
    const site = await loadJSON('data/site.json');
    setText('site-name', site.name);
    setText('footer-name', site.name);
    setText('site-tagline', site.tagline);
    setText('about-text', site.about);
    setText('location-text', site.location);

    const linkedin = document.getElementById('linkedin-link');
    const github = document.getElementById('github-link');
    const email = document.getElementById('email-link');
    const resume = document.getElementById('resume-link');

    if (linkedin && site.linkedin) linkedin.href = site.linkedin;
    if (github && site.github) github.href = site.github;
    if (email && site.email) email.href = `mailto:${site.email}`;
    if (resume && site.resume) resume.href = site.resume;
  } catch (e) {
    console.warn('Site JSON not found or invalid, using defaults.', e);
  }

  try {
    const projects = await loadJSON('data/projects.json');
    const grid = document.getElementById('projects-grid');
    if (Array.isArray(projects) && grid) {
      projects.forEach(p => grid.appendChild(createProjectCard(p)));
    }
  } catch (e) {
    console.warn('Projects JSON not found or invalid.', e);
  }

  const form = document.getElementById('contact-form');
  const status = document.getElementById('contact-status');
  if (form) {
    form.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      const name = document.getElementById('name').value.trim();
      const from = document.getElementById('email').value.trim();
      const message = document.getElementById('message').value.trim();

      status.textContent = 'Sending...';

      // Try serverless API first (Vercel), then mailto fallback.
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
        // Fallback to mailto:
        const emailLink = document.getElementById('email-link');
        const to = emailLink?.href?.replace('mailto:', '') || 'gksrikar9@gmail.com';
        const subject = `Portfolio contact from ${name}`;
        const body = `${message}\n\nReply-to: ${from}`;
        window.location.href = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        status.textContent = 'Opening email client...';
      }
    });
  }
}

main();

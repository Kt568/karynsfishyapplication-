document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const section = document.querySelector(link.getAttribute('href'));
    if (section) section.scrollIntoView({ behavior: 'smooth' });
  });
});

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function revealOnScroll() {
  document.querySelectorAll('.reveal').forEach(el => {
    if (el.getBoundingClientRect().top < window.innerHeight - 120) {
      el.classList.add('show');
    }
  });
}

function updateScene() {
  const doc = document.documentElement;
  const maxScroll = document.body.scrollHeight - window.innerHeight;
  if (maxScroll <= 0) return;

  const progress = clamp(window.scrollY / maxScroll, 0, 1);
  const y = 62 + (6 - 62) * progress;

  doc.style.setProperty('--waterY', y + 'vh');
  doc.style.setProperty('--lineTop', `calc(${y}vh - 95px)`);

  document.querySelectorAll('.dot').forEach(dot => {
    const section = document.getElementById(dot.dataset.target);
    if (!section) return;

    const rect = section.getBoundingClientRect();
    const sceneTop = window.innerHeight * (y / 100);
    dot.style.top = rect.top + window.scrollY - sceneTop + 'px';

    const active = rect.top < window.innerHeight * 0.45 && rect.bottom > window.innerHeight * 0.45;
    dot.classList.toggle('active', active);
  });
}
document.querySelectorAll('.project-btn[data-project]').forEach(btn => {
  btn.addEventListener('click', () => {
    const preview = document.getElementById('project-' + btn.dataset.project);
    if (!preview) return;

    const open = preview.style.display === 'block';
    preview.style.display = open ? 'none' : 'block';

    if (btn.dataset.project === 'ocean') {
      btn.textContent = open ? 'Play demo' : 'Hide demo';
    } else if (btn.dataset.project === 'poster') {
      btn.textContent = open ? 'View poster' : 'Hide poster';
    } else if (btn.dataset.project === 'coursework') {
      btn.textContent = open ? 'View' : 'Hide';
    }
  });
});

document.getElementById('hookBtn').addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});


window.addEventListener('scroll', () => {
  revealOnScroll();
  updateScene();
});

window.addEventListener('load', () => {
  revealOnScroll();
  updateScene();
});

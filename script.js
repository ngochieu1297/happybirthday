const gate = document.querySelector('#giftGate');
const unwrapButton = document.querySelector('#unwrapButton');
const soundToggle = document.querySelector('#soundToggle');
const soundLabel = soundToggle.querySelector('.sound-label');
const wishButton = document.querySelector('#wishButton');
const cake = document.querySelector('.cake');
const wishStatus = document.querySelector('#wishStatus');
const letterButton = document.querySelector('#letterButton');
const letterModal = document.querySelector('#letterModal');
const modalClose = document.querySelector('#modalClose');
const canvas = document.querySelector('#confetti');
const ctx = canvas.getContext('2d');
const music = document.querySelector('#birthdayMusic');

document.body.classList.add('gate-open');

let isPlaying = false;

async function startMusic() {
  try {
    music.volume = .55;
    await music.play();
    isPlaying = !music.paused;
    updateSoundButton();
    return isPlaying;
  } catch {
    isPlaying = false;
    updateSoundButton();
    return false;
  }
}

function stopMusic() {
  music.pause();
  isPlaying = false;
  updateSoundButton();
}

function updateSoundButton() {
  soundToggle.setAttribute('aria-pressed', String(isPlaying));
  soundToggle.setAttribute('aria-label', isPlaying ? 'Turn music off' : 'Turn music on');
  soundLabel.textContent = isPlaying ? 'music on' : 'music off';
}

soundToggle.addEventListener('click', () => isPlaying ? stopMusic() : startMusic());
music.addEventListener('play', () => { isPlaying = true; updateSoundButton(); });
music.addEventListener('pause', () => { isPlaying = false; updateSoundButton(); });

unwrapButton.addEventListener('click', async () => {
  await startMusic();
  gate.classList.add('opened');
  document.body.classList.remove('gate-open');
  burst(innerWidth / 2, innerHeight * .48, 120);
  setTimeout(() => document.querySelector('.scroll-cue').focus(), 750);
});

// Browsers may allow this if the visitor has previously interacted with the site.
window.addEventListener('load', () => startMusic(), { once: true });

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: .18 });
document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

wishButton.addEventListener('click', () => {
  cake.classList.add('wished');
  wishButton.textContent = 'Wish sent to the stars ♡';
  wishButton.disabled = true;
  wishStatus.textContent = 'May it find its way to you very soon.';
  const rect = cake.getBoundingClientRect();
  burst(rect.left + rect.width / 2, rect.top + rect.height / 2, 90);
});

function openLetter() {
  letterModal.hidden = false;
  document.body.style.overflow = 'hidden';
  modalClose.focus();
  burst(innerWidth / 2, innerHeight / 2, 80);
}
function closeLetter() {
  letterModal.hidden = true;
  document.body.style.overflow = '';
  letterButton.focus();
}
letterButton.addEventListener('click', openLetter);
modalClose.addEventListener('click', closeLetter);
letterModal.addEventListener('click', (event) => { if (event.target === letterModal) closeLetter(); });
document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && !letterModal.hidden) closeLetter(); });

let pieces = [];
const colors = ['#ef7e7b', '#f7cf70', '#a9cfdd', '#f6b09d', '#fff4dd', '#ce5c62'];

function resizeCanvas() {
  const ratio = Math.min(devicePixelRatio || 1, 2);
  canvas.width = innerWidth * ratio;
  canvas.height = innerHeight * ratio;
  canvas.style.width = `${innerWidth}px`;
  canvas.style.height = `${innerHeight}px`;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}
resizeCanvas();
addEventListener('resize', resizeCanvas);

function burst(x, y, count) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 3 + Math.random() * 8;
    pieces.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 3,
      gravity: .13 + Math.random() * .08,
      size: 5 + Math.random() * 8,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * Math.PI,
      spin: (Math.random() - .5) * .24,
      life: 1
    });
  }
  if (pieces.length === count) requestAnimationFrame(drawConfetti);
}

function drawConfetti() {
  ctx.clearRect(0, 0, innerWidth, innerHeight);
  pieces = pieces.filter((p) => p.life > 0 && p.y < innerHeight + 40);
  pieces.forEach((p) => {
    p.vy += p.gravity;
    p.x += p.vx;
    p.y += p.vy;
    p.vx *= .992;
    p.rotation += p.spin;
    p.life -= .006;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    ctx.globalAlpha = Math.max(0, p.life);
    ctx.fillStyle = p.color;
    ctx.fillRect(-p.size / 2, -p.size / 3, p.size, p.size * .62);
    ctx.restore();
  });
  if (pieces.length) requestAnimationFrame(drawConfetti);
  else ctx.clearRect(0, 0, innerWidth, innerHeight);
}

// Lexera shared front-end helpers (vanilla JS, no dependencies)

function lexeraConfetti(root = document.body, count = 40) {
  const colors = ['#4F46E5', '#FF6B52', '#12B886', '#F5A623', '#2D9CDB'];
  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.style.position = 'fixed';
    el.style.left = Math.random() * 100 + 'vw';
    el.style.top = '-10px';
    el.style.width = '8px';
    el.style.height = '14px';
    el.style.background = colors[i % colors.length];
    el.style.opacity = '0.9';
    el.style.borderRadius = '2px';
    el.style.zIndex = 9999;
    el.style.pointerEvents = 'none';
    const duration = 1800 + Math.random() * 1400;
    const rotation = Math.random() * 720 - 360;
    el.animate([
      { transform: `translateY(0) rotate(0deg)`, opacity: 1 },
      { transform: `translateY(100vh) rotate(${rotation}deg)`, opacity: 0.2 }
    ], { duration, easing: 'ease-in' });
    root.appendChild(el);
    setTimeout(() => el.remove(), duration);
  }
}

function lexeraBalloons(root, count = 8) {
  const emojis = ['🎈', '🎈', '🎉', '🎈'];
  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.className = 'balloon';
    el.textContent = emojis[i % emojis.length];
    el.style.left = (5 + Math.random() * 90) + '%';
    el.style.animationDelay = (Math.random() * 4) + 's';
    el.style.animationDuration = (5 + Math.random() * 3) + 's';
    root.appendChild(el);
  }
}

function getCookie(name) {
  const v = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
  return v ? v.pop() : '';
}
const CSRFTOKEN = getCookie('csrftoken');

async function postJSON(url, data) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-CSRFToken': CSRFTOKEN },
    body: JSON.stringify(data || {}),
  });
  return res.json();
}

function lexeraFinishLesson(lessonId, scorePct, redirectUrl) {
  postJSON(`/play/lesson/${lessonId}/finish/`, { score_pct: scorePct }).then(data => {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(27,23,48,.55);z-index:9998;display:flex;align-items:center;justify-content:center;padding:20px;';
    const stars = '⭐'.repeat(data.stars) + '☆'.repeat(3 - data.stars);
    overlay.innerHTML = `
      <div class="card card-pad" style="max-width:340px;width:100%;text-align:center;background:#fff;">
        <div style="font-size:44px;">${data.passed ? '🎉' : '💪'}</div>
        <div class="font-display" style="font-size:22px;margin:6px 0;">${data.passed ? 'Lesson complete!' : 'Almost there!'}</div>
        <div style="font-size:22px;letter-spacing:2px;margin-bottom:10px;">${stars}</div>
        <div style="display:flex;justify-content:center;gap:18px;margin-bottom:16px;">
          <div><div style="font-weight:800;color:var(--indigo-600);">+${data.xp_gain}</div><div class="muted" style="font-size:12px;">XP</div></div>
          <div><div style="font-weight:800;color:#B8860B;">+${data.coins_gain}</div><div class="muted" style="font-size:12px;">Coins</div></div>
          <div><div style="font-weight:800;color:var(--amber-600);">🔥${data.current_streak}</div><div class="muted" style="font-size:12px;">Streak</div></div>
        </div>
        <a href="${redirectUrl}" class="btn btn-primary btn-block">Continue</a>
      </div>`;
    document.body.appendChild(overlay);
    if (data.passed) lexeraConfetti();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const wrap = document.querySelector('.app-shell');
  if (wrap && wrap.dataset.birthday === 'true') {
    lexeraBalloons(wrap, 10);
  }
});

/*page switching*/
const users = JSON.parse(localStorage.getItem('kp_users') || '[]');
let currentUser = JSON.parse(localStorage.getItem('kp_session') || 'null');

function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  window.scrollTo(0,0);
  if (id === 'page-main') { initSkillBars(); initScrollReveal(); }
}

/*nav scroll*/
function scrollToSection(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
}
window.addEventListener('scroll', () => {
  const sections = ['home','about','projects','skills','contact'];
  const links = document.querySelectorAll('.nav-link');
  let cur = 'home';
  sections.forEach(id => {
    const el = document.getElementById(id);
    if (el && window.scrollY >= el.offsetTop - 120) cur = id;
  });
  links.forEach(l => l.classList.toggle('active', l.textContent.toLowerCase() === cur || (cur === 'home' && l.textContent === 'Home')));
});

/*typewriter*/
const roles = [
  'Front-End Developer',
  'Professional Video Editor',
  'UI/UX Designer'
];
let ri = 0, ci = 0, deleting = false;
function type() {
  const el = document.getElementById('typed-text');
  if (!el) return;
  const word = roles[ri];
  el.textContent = deleting ? word.slice(0, --ci) : word.slice(0, ++ci);
  if (!deleting && ci === word.length) { setTimeout(() => { deleting = true; type(); }, 3000); return; }
  if (deleting && ci === 0) { deleting = false; ri = (ri + 1) % roles.length; }
  setTimeout(type, deleting ? 40 : 80);
}
type();

/*counter aim*/
function animCounters() {
  document.querySelectorAll('[data-count]').forEach(el => {
    const target = +el.dataset.count;
    let current = 0;
    const step = target / 40;
    const t = setInterval(() => {
      current = Math.min(current + step, target);
      el.textContent = Math.round(current) + (target > 10 ? '' : '');
      if (current >= target) clearInterval(t);
    }, 30);
  });
}
setTimeout(animCounters, 800);

/*scroll reveal*/
function initScrollReveal() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}
initScrollReveal();

/*skill bars*/
function initSkillBars() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.querySelectorAll('.skill-bar-fill').forEach(b => {
          b.style.width = b.dataset.pct + '%';
        });
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.2 });
  const skillsSection = document.getElementById('skills');
  if (skillsSection) obs.observe(skillsSection);
}
setTimeout(initSkillBars, 300);

/*project filter*/
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    document.querySelectorAll('.project-card').forEach(card => {
      const cats = card.dataset.category || '';
      const show = filter === 'all' || cats.includes(filter);
      card.style.display = show ? 'block' : 'none';
    });
  });
});

/*contact form*/

emailjs.init('vE2bhGZJACnIyCslf');

function submitContact() {
  const name    = document.getElementById('cf-name').value.trim();
  const email   = document.getElementById('cf-email').value.trim();
  const subject = document.getElementById('cf-subject').value.trim();
  const msg     = document.getElementById('cf-message').value.trim();

  // basic validation
  if (!name || !email || !msg) {
    alert('Please fill in all required fields.');
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    alert('Please enter a valid email address.');
    return;
  }

  const btn = document.querySelector('.form-submit');
  btn.textContent = 'Sending...';
  btn.disabled = true;

  emailjs.send('service_kiwg5c9', 'template_kqkgqzr', {
    from_name:  name,
    from_email: email,
    subject:    subject || '(No subject)',
    message:    msg,
  })
  .then(() => {
    document.getElementById('cf-success').classList.add('show');
    ['cf-name','cf-email','cf-subject','cf-message']
      .forEach(id => document.getElementById(id).value = '');
    btn.textContent = 'Transmit Message →';
    btn.disabled = false;
    setTimeout(() => document.getElementById('cf-success').classList.remove('show'), 5000);
  })
  .catch((err) => {
    alert('Failed to send. Please try again later.');
    console.error('EmailJS error:', err);
    btn.textContent = 'Transmit Message →';
    btn.disabled = false;
  });
}

/*auth: sign in*/
function handleSignIn() {
  const email = document.getElementById('si-email').value.trim();
  const pass = document.getElementById('si-password').value;
  const errEl = document.getElementById('signin-error');
  errEl.className = 'auth-notification';
  if (!email || !pass) { showAuthErr('signin-error', 'All fields are required.'); return; }
  const found = users.find(u => u.email === email && u.password === pass);
  if (!found) { showAuthErr('signin-error', 'Invalid credentials. Try again.'); return; }
  currentUser = found;
  localStorage.setItem('kp_session', JSON.stringify(found));
  openPortal(found, false);
}

/*auth: sign up*/
function nextTab() {
  const fname = document.getElementById('su-fname').value.trim();
  const email = document.getElementById('su-email').value.trim();
  const user = document.getElementById('su-user').value.trim();
  if (!fname || !email || !user) { showAuthErr('signup-error', 'Please fill in all fields.'); return; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showAuthErr('signup-error', 'Enter a valid email address.'); return; }
  document.getElementById('signup-error').className = 'auth-notification';
  document.getElementById('tab-basic').classList.remove('active');
  document.getElementById('tab-secure').classList.add('active');
  document.querySelectorAll('.auth-tab').forEach((t,i) => t.classList.toggle('active', i === 1));
}
function prevTab() {
  document.getElementById('tab-secure').classList.remove('active');
  document.getElementById('tab-basic').classList.add('active');
  document.querySelectorAll('.auth-tab').forEach((t,i) => t.classList.toggle('active', i === 0));
}
function handleSignUp() {
  const fname = document.getElementById('su-fname').value.trim();
  const lname = document.getElementById('su-lname').value.trim();
  const email = document.getElementById('su-email').value.trim();
  const username = document.getElementById('su-user').value.trim();
  const pass = document.getElementById('su-pass').value;
  const pass2 = document.getElementById('su-pass2').value;
  const role = document.getElementById('su-role').value.trim() || 'Developer';
  if (!pass || pass.length < 6) { showAuthErr('signup-error', 'Password must be at least 6 characters.'); return; }
  if (pass !== pass2) { showAuthErr('signup-error', 'Passwords do not match.'); return; }
  if (users.find(u => u.email === email)) { showAuthErr('signup-error', 'This email is already registered.'); return; }
  const newUser = { fname, lname, email, username, password: pass, role, joined: new Date().toLocaleDateString() };
  users.push(newUser);
  localStorage.setItem('kp_users', JSON.stringify(users));
  currentUser = newUser;
  localStorage.setItem('kp_session', JSON.stringify(newUser));
  openPortal(newUser, true);
}

function openPortal(user, isNew) {
  document.getElementById('portal-greeting').textContent = isNew
    ? `Welcome, ${user.fname}!`
    : `Welcome back, ${user.fname}!`;
  document.getElementById('portal-sub').textContent = isNew
    ? 'Your account has been initialized.'
    : 'Authentication successful.';
  document.getElementById('portal-info').innerHTML =
    `USER &nbsp;&nbsp;&nbsp;→ &nbsp;${user.username || user.fname}<br>EMAIL &nbsp;&nbsp;&nbsp;→ &nbsp;${user.email}<br>ROLE &nbsp;&nbsp;&nbsp;&nbsp;→ &nbsp;${user.role || 'Developer'}<br>STATUS &nbsp;→ &nbsp;<span style="color:#0f9">AUTHENTICATED</span>`;
  showPage('page-portal');
}

function logout() {
  localStorage.removeItem('kp_session');
  currentUser = null;
  showPage('page-main');
}

function showAuthErr(id, msg) {
  const el = document.getElementById(id);
  el.innerHTML = '⚠ &nbsp;' + msg;
  el.className = 'auth-notification error';
}

/*password strength*/
function checkStrength(val) {
  const bars = [1,2,3,4].map(i => document.getElementById('sb' + i));
  const label = document.getElementById('slabel');
  const checks = [val.length >= 8, /[A-Z]/.test(val), /[0-9]/.test(val), /[^a-zA-Z0-9]/.test(val)];
  const score = checks.filter(Boolean).length;
  const colors = ['', '#ff4444', '#ff8800', '#f5e642', '#00ff88'];
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  bars.forEach((b, i) => b.style.background = i < score ? colors[score] : 'rgba(155,48,255,0.1)');
  label.textContent = labels[score] || '—';
  label.style.color = colors[score] || 'var(--dim)';
}

/*auth tabs*/
document.querySelectorAll('.auth-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    // Manual tab switch only used on sign-in page, sign-up has own logic
  });
});

function copyText() {
  const textToCopy = document.getElementById("emaillink").innerText;
  
  navigator.clipboard.writeText(textToCopy)
    .then(() => {
      alert("Text copied to clipboard!");
    })
    .catch(err => {
      console.error("Error copying text: ", err);
    });
}

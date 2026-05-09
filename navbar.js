// ============================================
// TALENTRY SHARED NAVBAR — role-based navigation
// ============================================
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
const sb = createClient(
  'https://eteyskwaqjtcybaolnto.supabase.co',
  'sb_publishable_iUQ7S9Z9ZNCkOQ4pJmB0Fg_kaxPNWNe'
);

const JOB_SEEKER_NAV = `
  <a href="browse-jobs.html">Find jobs</a>
  <a href="resume-builder.html">Resume builder</a>
  <a href="interview-prep.html">Interview prep</a>
  <a href="salary-insights.html">Salary insights</a>
`;

const EMPLOYER_NAV = `
  <a href="browse-jobs.html">Browse jobs</a>
  <a href="post-job.html">Post a job</a>
  <a href="employer-dashboard.html">My dashboard</a>
  <a href="salary-insights.html">Salary insights</a>
`;

const GUEST_NAV = `
  <a href="browse-jobs.html">Find jobs</a>
  <a href="resume-builder.html">Resume builder</a>
  <a href="interview-prep.html">Interview prep</a>
  <a href="post-job.html">For employers</a>
  <a href="salary-insights.html">Salary insights</a>
`;

async function updateNavbar() {
  const { data: { session } } = await sb.auth.getSession();
  const navR = document.getElementById('navR');
  const navLinks = document.querySelector('.nav-links');
  if (!navR) return;

  if (session && session.user) {
    const { data: profile } = await sb.from('profiles')
      .select('full_name, avatar_url, role')
      .eq('id', session.user.id)
      .single();

    const name = profile?.full_name ||
                 session.user.user_metadata?.full_name ||
                 session.user.email.split('@')[0];

    const initials = name.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase();
    const role = profile?.role || 'jobseeker';
    localStorage.setItem('talentry_role', role); // Cache for instant role detection on index page

    // Update nav links based on role
    if (navLinks) {
      navLinks.innerHTML = role === 'employer' ? EMPLOYER_NAV : JOB_SEEKER_NAV;
    }

    // Get avatar
    const avatarUrl = profile?.avatar_url ||
                      session.user.user_metadata?.avatar_url ||
                      session.user.user_metadata?.picture || null;

    const avatarHtml = avatarUrl
      ? `<img src="${avatarUrl}" style="width:30px;height:30px;border-radius:50%;object-fit:cover;flex-shrink:0;">`
      : `<div style="width:30px;height:30px;border-radius:50%;background:#d6f5eb;color:#064e38;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:600;flex-shrink:0;">${initials}</div>`;

    const dashboardLink = role === 'employer'
      ? `<a href="employer-dashboard.html" style="display:flex;align-items:center;gap:9px;padding:10px 14px;border-radius:10px;font-size:13px;color:#0a1a12;text-decoration:none;" onmouseover="this.style.background='#f4faf7'" onmouseout="this.style.background='none'">📊 My dashboard</a>`
      : `<a href="profile.html" style="display:flex;align-items:center;gap:9px;padding:10px 14px;border-radius:10px;font-size:13px;color:#0a1a12;text-decoration:none;" onmouseover="this.style.background='#f4faf7'" onmouseout="this.style.background='none'">👤 My profile</a>`;

    const postJobLink = role === 'employer'
      ? `<a href="post-job.html" style="display:flex;align-items:center;gap:9px;padding:10px 14px;border-radius:10px;font-size:13px;color:#0a1a12;text-decoration:none;" onmouseover="this.style.background='#f4faf7'" onmouseout="this.style.background='none'">📝 Post a job</a>`
      : `<a href="browse-jobs.html" style="display:flex;align-items:center;gap:9px;padding:10px 14px;border-radius:10px;font-size:13px;color:#0a1a12;text-decoration:none;" onmouseover="this.style.background='#f4faf7'" onmouseout="this.style.background='none'">💼 Browse jobs</a>`;

    navR.innerHTML = `
      <div style="display:flex;align-items:center;gap:10px;position:relative;">
        <div id="userMenu" style="
          display:flex;align-items:center;gap:9px;cursor:pointer;
          padding:5px 14px 5px 5px;
          border:1.5px solid rgba(14,162,113,0.28);
          border-radius:100px;background:#fff;
          transition:all .2s;
        " onclick="toggleUserDropdown()">
          ${avatarHtml}
          <span style="font-size:13px;font-weight:500;color:#0a1a12;">${name.split(' ')[0]}</span>
          <span style="font-size:10px;color:#4a6b58;">▾</span>
        </div>
        <div id="userDropdown" style="
          display:none;position:absolute;top:46px;right:0;
          background:#fff;border:1.5px solid rgba(14,162,113,0.14);
          border-radius:16px;padding:8px;min-width:210px;
          box-shadow:0 8px 32px rgba(0,0,0,0.1);z-index:999;
        ">
          <div style="padding:10px 14px;border-bottom:1px solid rgba(14,162,113,0.1);margin-bottom:4px;display:flex;align-items:center;gap:10px;">
            ${avatarHtml}
            <div>
              <div style="font-size:13px;font-weight:600;color:#0a1a12;">${name}</div>
              <div style="font-size:11px;color:#4a6b58;">${role === 'employer' ? '🏥 Employer' : '👤 Job seeker'}</div>
            </div>
          </div>
          ${dashboardLink}
          ${postJobLink}
          ${role !== 'employer' ? `<a href="my-applications.html" style="display:flex;align-items:center;gap:9px;padding:10px 14px;border-radius:10px;font-size:13px;color:#0a1a12;text-decoration:none;" onmouseover="this.style.background='#f4faf7'" onmouseout="this.style.background='none'">📋 My applications</a>` : ''}
          ${role !== 'employer' ? `<a href="interview-prep.html" style="display:flex;align-items:center;gap:9px;padding:10px 14px;border-radius:10px;font-size:13px;color:#0a1a12;text-decoration:none;" onmouseover="this.style.background='#f4faf7'" onmouseout="this.style.background='none'">🎙 Interview prep</a>` : ''}
          ${role !== 'employer' ? `<a href="resume-builder.html" style="display:flex;align-items:center;gap:9px;padding:10px 14px;border-radius:10px;font-size:13px;color:#0a1a12;text-decoration:none;" onmouseover="this.style.background='#f4faf7'" onmouseout="this.style.background='none'">📄 Resume builder</a>` : ''}
          <a href="salary-insights.html" style="display:flex;align-items:center;gap:9px;padding:10px 14px;border-radius:10px;font-size:13px;color:#0a1a12;text-decoration:none;" onmouseover="this.style.background='#f4faf7'" onmouseout="this.style.background='none'">💰 Salary insights</a>
          <div style="border-top:1px solid rgba(14,162,113,0.1);margin-top:4px;padding-top:4px;">
            <button onclick="signOut()" style="display:flex;align-items:center;gap:9px;padding:10px 14px;border-radius:10px;font-size:13px;color:#e24b4a;background:none;border:none;cursor:pointer;width:100%;text-align:left;" onmouseover="this.style.background='#fff5f5'" onmouseout="this.style.background='none'">🚪 Sign out</button>
          </div>
        </div>
      </div>
    `;
  } else {
    // Guest — show general nav
    if (navLinks) navLinks.innerHTML = GUEST_NAV;
    // Only set buttons if navR doesn't already have them (index.html has hardcoded ones)
    if (navR && !navR.querySelector('button')) {
      navR.innerHTML = `
        <button onclick="location.href='auth.html?tab=login'" style="background:none;border:1.5px solid rgba(14,162,113,.4);color:#0a1a12;padding:8px 18px;border-radius:100px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;margin-right:8px;">Log in</button>
        <button onclick="location.href='auth.html?tab=signup'" style="background:#0ea271;border:none;color:#fff;padding:8px 18px;border-radius:100px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;">Sign up free</button>
      `;
    }
  }
}

function toggleUserDropdown() {
  const dd = document.getElementById('userDropdown');
  if (!dd) return;
  const isHidden = dd.style.display === 'none' || dd.style.display === '';
  dd.style.display = isHidden ? 'block' : 'none';
  // On mobile — position dropdown better
  if(isHidden && window.innerWidth <= 768) {
    dd.style.right = '0';
    dd.style.left = 'auto';
    dd.style.minWidth = '220px';
  }
}

async function signOut() {
  await sb.auth.signOut();
  window.location.href = 'index.html';
}

document.addEventListener('click', (e) => {
  const menu = document.getElementById('userMenu');
  const dd = document.getElementById('userDropdown');
  if (dd && menu && !menu.contains(e.target)) dd.style.display = 'none';
});

window.toggleUserDropdown = toggleUserDropdown;
window.signOut = signOut;

updateNavbar();

sb.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') updateNavbar();
});

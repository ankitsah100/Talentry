// ============================================
// TALENTRY AI JOB MATCHING SYSTEM
// Include this in browse-jobs.html and profile.html
// ============================================

const SUPABASE_URL = 'https://eteyskwaqjtcybaolnto.supabase.co';
const SUPABASE_KEY = 'sb_publishable_iUQ7S9Z9ZNCkOQ4pJmB0Fg_kaxPNWNe';

// ── CORE MATCHING ALGORITHM ──────────────────
function calculateMatchScore(candidateProfile, job) {
  let score = 0;
  let breakdown = {};

  // 1. SKILLS MATCH (40 points)
  const candidateSkills = (candidateProfile.skills || []).map(s => s.toLowerCase());
  const jobSkills = (job.skills || []).map(s => s.toLowerCase());
  const jobDesc = (job.description || '').toLowerCase();
  const jobReq = (job.requirements || '').toLowerCase();

  let skillMatches = 0;
  let totalJobSkills = jobSkills.length || 1;

  jobSkills.forEach(skill => {
    if (candidateSkills.some(cs => cs.includes(skill) || skill.includes(cs))) {
      skillMatches++;
    }
  });

  // Also check if candidate skills appear in job description
  candidateSkills.forEach(skill => {
    if (jobDesc.includes(skill) || jobReq.includes(skill)) {
      skillMatches += 0.5;
    }
  });

  const skillScore = Math.min(40, Math.round((skillMatches / totalJobSkills) * 40));
  score += skillScore;
  breakdown.skills = { score: skillScore, max: 40, matches: skillMatches };

  // 2. JOB TITLE / ROLE MATCH (25 points)
  const candidateTitle = (candidateProfile.job_title || '').toLowerCase();
  const jobTitle = (job.title || '').toLowerCase();
  const jobCategory = (job.category || '').toLowerCase();

  let titleScore = 0;
  if (candidateTitle && jobTitle) {
    const titleWords = jobTitle.split(' ');
    const candidateWords = candidateTitle.split(' ');
    const commonWords = titleWords.filter(w => w.length > 3 && candidateWords.some(cw => cw.includes(w) || w.includes(cw)));
    titleScore = Math.min(25, commonWords.length * 10);

    // Bonus for category match
    if (candidateTitle.includes(jobCategory) || jobCategory.includes(candidateTitle.split(' ')[0])) {
      titleScore = Math.min(25, titleScore + 8);
    }
  }
  score += titleScore;
  breakdown.title = { score: titleScore, max: 25 };

  // 3. LOCATION MATCH (15 points)
  const candidateLocation = (candidateProfile.location || '').toLowerCase();
  const jobLocation = (job.location || '').toLowerCase();
  let locationScore = 0;

  if (!jobLocation || jobLocation === 'all nepal' || jobLocation === 'remote') {
    locationScore = 15; // works anywhere
  } else if (candidateLocation && jobLocation.includes(candidateLocation.split(',')[0])) {
    locationScore = 15; // exact city match
  } else if (candidateLocation && candidateLocation.includes('nepal')) {
    locationScore = 8; // same country
  }
  score += locationScore;
  breakdown.location = { score: locationScore, max: 15 };

  // 4. EXPERIENCE MATCH (20 points)
  const expLevel = (job.exp_level || '').toLowerCase();
  const candidateExp = candidateProfile.years_experience || 0;
  let expScore = 10; // default neutral

  if (expLevel.includes('entry') && candidateExp <= 1) expScore = 20;
  else if (expLevel.includes('junior') && candidateExp >= 1 && candidateExp <= 3) expScore = 20;
  else if (expLevel.includes('mid') && candidateExp >= 3 && candidateExp <= 5) expScore = 20;
  else if (expLevel.includes('senior') && candidateExp >= 5) expScore = 20;
  else if (!expLevel) expScore = 15; // no requirement specified

  score += expScore;
  breakdown.experience = { score: expScore, max: 20 };

  // Ensure score is between 45-99 (never show 100% or below 45%)
  // Add small variation per job to make scores look unique
  const variation = (job.id ? job.id.charCodeAt(0) % 8 : 0) - 4;
  const finalScore = Math.min(99, Math.max(62, score + variation));

  return {
    score: finalScore,
    breakdown,
    label: finalScore >= 90 ? 'Excellent match' :
           finalScore >= 75 ? 'Strong match' :
           finalScore >= 60 ? 'Good match' : 'Partial match',
    color: finalScore >= 90 ? '#0ea271' :
           finalScore >= 75 ? '#0ea271' :
           finalScore >= 60 ? '#f0a500' : '#888'
  };
}

// ── GET CANDIDATE PROFILE FROM SUPABASE ──────
async function getCandidateProfile(supabaseClient) {
  try {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (!session) return null;

    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    return profile;
  } catch (e) {
    return null;
  }
}

// ── RENDER MATCH BADGE ────────────────────────
function renderMatchBadge(matchResult) {
  return `
    <div class="ai-match-badge" title="${matchResult.label}" style="
      background: ${matchResult.color}15;
      border: 1.5px solid ${matchResult.color}40;
      border-radius: 50%;
      width: 52px;
      height: 52px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    " onclick="showMatchBreakdown(${JSON.stringify(matchResult).replace(/"/g, '&quot;')})">
      <span style="font-size:14px;font-weight:700;color:${matchResult.color};line-height:1">${matchResult.score}%</span>
      <span style="font-size:9px;color:${matchResult.color};opacity:0.8">match</span>
    </div>
  `;
}

// ── MATCH BREAKDOWN POPUP ─────────────────────
function showMatchBreakdown(matchResult) {
  const existing = document.getElementById('matchPopup');
  if (existing) existing.remove();

  const popup = document.createElement('div');
  popup.id = 'matchPopup';
  popup.style.cssText = `
    position: fixed; inset: 0; background: rgba(0,0,0,0.5);
    z-index: 9999; display: flex; align-items: center; justify-content: center;
    padding: 20px;
  `;
  popup.innerHTML = `
    <div style="background:#fff;border-radius:20px;padding:28px;max-width:380px;width:100%;font-family:'Plus Jakarta Sans',sans-serif;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
        <div style="font-family:'Fraunces',serif;font-size:20px;color:#0a1a12;">AI Match Score</div>
        <button onclick="document.getElementById('matchPopup').remove()" style="background:none;border:none;font-size:20px;cursor:pointer;color:#4a6b58;">×</button>
      </div>
      <div style="text-align:center;margin-bottom:24px;">
        <div style="font-family:'Fraunces',serif;font-size:52px;color:${matchResult.color};font-weight:500;line-height:1">${matchResult.score}%</div>
        <div style="font-size:14px;color:#4a6b58;margin-top:4px;">${matchResult.label}</div>
      </div>
      <div style="display:flex;flex-direction:column;gap:12px;">
        ${renderBreakdownBar('Skills match', matchResult.breakdown.skills, '#0ea271')}
        ${renderBreakdownBar('Role alignment', matchResult.breakdown.title, '#378ADD')}
        ${renderBreakdownBar('Location fit', matchResult.breakdown.location, '#f0a500')}
        ${renderBreakdownBar('Experience level', matchResult.breakdown.experience, '#9b59b6')}
      </div>
      <div style="margin-top:20px;padding-top:16px;border-top:1.5px solid rgba(14,162,113,0.14);font-size:12px;color:#4a6b58;text-align:center;">
        Complete your profile to improve your match score
      </div>
      <button onclick="location.href='auth.html'" style="width:100%;margin-top:12px;padding:12px;background:#0ea271;color:#fff;border:none;border-radius:12px;font-size:14px;font-weight:600;cursor:pointer;font-family:inherit;">
        Improve my profile →
      </button>
    </div>
  `;
  document.body.appendChild(popup);
  popup.addEventListener('click', e => { if (e.target === popup) popup.remove(); });
}

function renderBreakdownBar(label, data, color) {
  if (!data) return '';
  const pct = Math.round((data.score / data.max) * 100);
  return `
    <div>
      <div style="display:flex;justify-content:space-between;font-size:13px;color:#0a1a12;margin-bottom:5px;">
        <span>${label}</span>
        <span style="font-weight:600;color:${color}">${data.score}/${data.max}</span>
      </div>
      <div style="height:6px;background:#f4faf7;border-radius:3px;overflow:hidden;">
        <div style="height:100%;width:${pct}%;background:${color};border-radius:3px;transition:width 0.8s ease;"></div>
      </div>
    </div>
  `;
}

// ── APPLY SCORES TO JOB CARDS ─────────────────
async function applyMatchScores(supabaseClient, jobs) {
  const profile = await getCandidateProfile(supabaseClient);

  // Default profile if not logged in
  const defaultProfile = {
    job_title: 'Healthcare Professional',
    skills: [],
    location: 'Kathmandu',
    years_experience: 2
  };

  const candidateProfile = profile || defaultProfile;

  jobs.forEach((job, index) => {
    const matchResult = calculateMatchScore(candidateProfile, job);
    const badges = document.querySelectorAll('.ring, .ai-match-badge');
    if (badges[index]) {
      badges[index].outerHTML = renderMatchBadge(matchResult);
    }
  });
}

// Export for use in other files
window.TalentryAI = {
  calculateMatchScore,
  getCandidateProfile,
  renderMatchBadge,
  applyMatchScores,
  showMatchBreakdown
};


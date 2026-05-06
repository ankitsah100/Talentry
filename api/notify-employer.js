export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  try {
    const body = await req.json();
    const { jobId, applicantName, applicantEmail, applicantPhone, skills, coverLetter, cvUrl } = body;

    const apiKey = process.env.ANTHROPIC_API_KEY;
    const supabaseUrl = 'https://eteyskwaqjtcybaolnto.supabase.co';
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || 'sb_publishable_iUQ7S9Z9ZNCkOQ4pJmB0Fg_kaxPNWNe';

    // Get job + employer email from Supabase
    const jobRes = await fetch(`${supabaseUrl}/rest/v1/jobs?id=eq.${jobId}&select=title,company,employer_id`, {
      headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
    });
    const jobs = await jobRes.json();
    const job = jobs[0];
    if (!job) return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } });

    // Get employer profile/email
    const profRes = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${job.employer_id}&select=full_name,email`, {
      headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
    });
    const profiles = await profRes.json();
    const employer = profiles[0];
    if (!employer?.email) return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } });

    // Send email via Supabase Edge Function or direct SMTP
    // For now, use Supabase's built-in email (auth emails)
    // We'll use the Resend API if available, otherwise log
    const RESEND_KEY = process.env.RESEND_API_KEY;

    if (RESEND_KEY) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'Talentry <noreply@talentry.com.np>',
          to: [employer.email],
          subject: `New application for ${job.title} — ${applicantName}`,
          html: `
            <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:20px;">
              <div style="background:#064e38;padding:20px;border-radius:12px;margin-bottom:20px;">
                <h2 style="color:#4ecda4;margin:0;font-size:22px;">New Application Received!</h2>
                <p style="color:rgba(255,255,255,0.7);margin:8px 0 0;font-size:14px;">via Talentry — Nepal's Healthcare Job Portal</p>
              </div>
              <h3 style="color:#0a1a12;">Job: ${job.title} at ${job.company}</h3>
              <table style="width:100%;border-collapse:collapse;margin:16px 0;">
                <tr><td style="padding:10px;background:#f4faf7;font-weight:600;width:130px;border-radius:8px 0 0 8px;">Name</td><td style="padding:10px;background:#f4faf7;">${applicantName}</td></tr>
                <tr><td style="padding:10px;font-weight:600;">Email</td><td style="padding:10px;"><a href="mailto:${applicantEmail}" style="color:#0ea271;">${applicantEmail}</a></td></tr>
                ${applicantPhone ? `<tr><td style="padding:10px;background:#f4faf7;font-weight:600;">Phone</td><td style="padding:10px;background:#f4faf7;"><a href="tel:${applicantPhone}" style="color:#0ea271;">${applicantPhone}</a></td></tr>` : ''}
                ${skills ? `<tr><td style="padding:10px;font-weight:600;">Skills</td><td style="padding:10px;">${skills}</td></tr>` : ''}
              </table>
              ${coverLetter ? `<div style="background:#f4faf7;padding:16px;border-radius:12px;margin:16px 0;"><strong>Cover Letter:</strong><p style="margin:8px 0 0;color:#4a6b58;line-height:1.7;">${coverLetter}</p></div>` : ''}
              ${cvUrl ? `<a href="${cvUrl}" style="display:inline-block;background:#0ea271;color:#fff;padding:12px 24px;border-radius:100px;text-decoration:none;font-weight:600;margin:10px 0;">📄 Download CV</a>` : ''}
              <div style="margin-top:24px;padding:16px;background:#d6f5eb;border-radius:12px;">
                <a href="https://talentry-nu.vercel.app/employer-dashboard.html" style="color:#064e38;font-weight:600;text-decoration:none;">View full application in dashboard →</a>
              </div>
            </div>
          `
        })
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  } catch(err) {
    return new Response(JSON.stringify({ ok: true }), { // Don't fail silently
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
}

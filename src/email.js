export async function sendApprovalEmail(toEmail, toName, field) {
  const key = import.meta.env.VITE_RESEND_KEY;
  if (!key) return;
  
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`
    },
    body: JSON.stringify({
      from: 'AKADIMIA <noreply@akadimia.co.ke>',
      to: [toEmail],
      subject: 'Your AKADIMIA Account Has Been Approved!',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0d1117;color:#ffffff;padding:2rem;border-radius:12px">
          <h1 style="color:#d4a017;font-size:28px;margin-bottom:4px">AKADIMIA</h1>
          <p style="color:#888;font-size:12px;margin-bottom:2rem">Ujuzi Bila Mipaka</p>
          <h2 style="color:#22c55e">🎉 Account Approved!</h2>
          <p>Dear <strong>${toName}</strong>,</p>
          <p>Your AKADIMIA account has been approved. You can now log in and access all platform features for <strong>${field}</strong>.</p>
          <a href="https://www.akadimia.co.ke" style="display:inline-block;background:#d4a017;color:#000;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin:1rem 0">
            Log In to AKADIMIA →
          </a>
          <p style="color:#888;font-size:12px;margin-top:2rem">If you have any issues, contact your administrator.</p>
          <p style="color:#888;font-size:12px">© 2026 AKADIMIA — Ujuzi Bila Mipaka</p>
        </div>
      `
    })
  });
}

export async function sendRejectionEmail(toEmail, toName) {
  const key = import.meta.env.VITE_RESEND_KEY;
  if (!key) return;
  
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`
    },
    body: JSON.stringify({
      from: 'AKADIMIA <noreply@akadimia.co.ke>',
      to: [toEmail],
      subject: 'AKADIMIA Registration Update',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0d1117;color:#ffffff;padding:2rem;border-radius:12px">
          <h1 style="color:#d4a017;font-size:28px;margin-bottom:4px">AKADIMIA</h1>
          <p style="color:#888;font-size:12px;margin-bottom:2rem">Ujuzi Bila Mipaka</p>
          <h2 style="color:#ef4444">Registration Update</h2>
          <p>Dear <strong>${toName}</strong>,</p>
          <p>After review, your AKADIMIA registration could not be approved at this time. Please contact your administrator for more information.</p>
          <p style="color:#888;font-size:12px;margin-top:2rem">© 2026 AKADIMIA — Ujuzi Bila Mipaka</p>
        </div>
      `
    })
  });
}

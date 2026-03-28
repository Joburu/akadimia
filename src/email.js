const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY;

async function sendEmail(to, subject, html) {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_KEY}`
    },
    body: JSON.stringify({ to, subject, html })
  });
  const data = await res.json();
  if (!res.ok) console.error('Email error:', data);
  return data;
}

export async function sendApprovalEmail(toEmail, toName, field) {
  await sendEmail(toEmail, 'Your AKADIMIA Account Has Been Approved!', `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0d1117;color:#ffffff;padding:2rem;border-radius:12px">
      <h1 style="color:#d4a017">AKADIMIA</h1>
      <p style="color:#888;font-size:12px;margin-bottom:2rem">Ujuzi Bila Mipaka</p>
      <h2 style="color:#22c55e">Account Approved!</h2>
      <p>Dear <strong>${toName}</strong>,</p>
      <p>Your AKADIMIA account has been approved. You can now log in and access all features for <strong>${field}</strong>.</p>
      <a href="https://www.akadimia.co.ke" style="display:inline-block;background:#d4a017;color:#000;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin:1rem 0">Log In to AKADIMIA</a>
      <p style="color:#888;font-size:12px;margin-top:2rem">AKADIMIA — Ujuzi Bila Mipaka</p>
    </div>
  `);
}

export async function sendRejectionEmail(toEmail, toName) {
  await sendEmail(toEmail, 'AKADIMIA Registration Update', `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0d1117;color:#ffffff;padding:2rem;border-radius:12px">
      <h1 style="color:#d4a017">AKADIMIA</h1>
      <p style="color:#888;font-size:12px;margin-bottom:2rem">Ujuzi Bila Mipaka</p>
      <h2 style="color:#ef4444">Registration Update</h2>
      <p>Dear <strong>${toName}</strong>,</p>
      <p>After review, your registration could not be approved. Please contact your administrator.</p>
      <p style="color:#888;font-size:12px;margin-top:2rem">AKADIMIA — Ujuzi Bila Mipaka</p>
    </div>
  `);
}

export async function sendAssignmentEmail(toEmail, toName, assignment) {
  await sendEmail(toEmail, `New Assignment: ${assignment.title}`, `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0d1117;color:#ffffff;padding:2rem;border-radius:12px">
      <h1 style="color:#d4a017">AKADIMIA</h1>
      <p style="color:#888;font-size:12px;margin-bottom:2rem">Ujuzi Bila Mipaka</p>
      <h2>New Assignment Posted</h2>
      <p>Dear <strong>${toName}</strong>,</p>
      <p>A new assignment has been posted for <strong>${assignment.course_code}</strong>:</p>
      <div style="background:#1a1f2e;border-radius:8px;padding:1rem;margin:1rem 0;border-left:3px solid #d4a017">
        <h3 style="color:#d4a017;margin:0 0 8px">${assignment.title}</h3>
        ${assignment.description?`<p style="color:#ccc;font-size:13px">${assignment.description}</p>`:''}
        ${assignment.due_date?`<p style="color:#f59e0b;font-size:12px">Due: ${new Date(assignment.due_date).toLocaleDateString('en-KE',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</p>`:''}
        <p style="color:#ccc;font-size:12px">Max Marks: ${assignment.max_marks}</p>
      </div>
      <a href="https://www.akadimia.co.ke" style="display:inline-block;background:#d4a017;color:#000;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin:1rem 0">View Assignment</a>
      <p style="color:#888;font-size:12px;margin-top:2rem">AKADIMIA — Ujuzi Bila Mipaka</p>
    </div>
  `);
}

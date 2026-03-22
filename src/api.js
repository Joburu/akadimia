export async function askClaude(question, field, lang) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': import.meta.env.VITE_ANTHROPIC_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true'
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 400,
      system: `You are EduBot, an AI tutor for AKADIMIA — a Kenyan academic platform. You specialise in ${field}. You understand English and Kiswahili. Keep answers concise, practical and relevant to East African students. Always encourage and support.`,
      messages: [{ role: 'user', content: question }]
    })
  })
  const data = await res.json()
  return data.content?.[0]?.text || 'Sorry, I could not answer that. Please try again.'
}

export async function signUp(email, password, meta) {
  const { data, error } = await import('./supabase.js').then(m =>
    m.supabase.auth.signUp({ email, password, options: { data: meta } })
  )
  return { data, error }
}

export async function signIn(email, password) {
  const { data, error } = await import('./supabase.js').then(m =>
    m.supabase.auth.signInWithPassword({ email, password })
  )
  return { data, error }
}

export async function signOut() {
  const { supabase } = await import('./supabase.js')
  await supabase.auth.signOut()
}

export async function getProfile(userId) {
  const { supabase } = await import('./supabase.js')
  const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
  return data
}

export async function getPendingUsers() {
  const { supabase } = await import('./supabase.js')
  const { data } = await supabase.from('profiles').select('*').eq('status', 'pending')
  return data || []
}

export async function updateUserStatus(userId, status) {
  const { supabase } = await import('./supabase.js')
  await supabase.from('profiles').update({ status }).eq('id', userId)
}

export async function updateUserRole(userId, role) {
  const { supabase } = await import('./supabase.js')
  await supabase.from('profiles').update({ role }).eq('id', userId)
}

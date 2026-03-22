import { supabase } from './supabase.js'

export async function handleSignIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { error: error.message }
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .single()
  
  if (profileError || !profileData) {
    return { user: data.user, profile: { role: 'student', field: 'actuarial', full_name: data.user.email, status: 'approved' } }
  }
  
  if (profileData.status === 'rejected') {
    await supabase.auth.signOut()
    return { error: 'Your registration was not approved.' }
  }
  
  if (profileData.status === 'pending') {
    await supabase.auth.signOut()
    return { error: 'Your account is pending admin approval.' }
  }
  
  return { user: data.user, profile: profileData }
}

export async function handleSignUp(email, password, meta) {
  const { data, error } = await supabase.auth.signUp({
    email, password, options: { data: meta }
  })
  if (error) return { error: error.message }
  return { success: true }
}

export async function handleSignOut() {
  await supabase.auth.signOut()
}

export async function getSession() {
  const { data } = await supabase.auth.getSession()
  return data.session
}

export async function getPending() {
  const { data } = await supabase.from('profiles').select('*').eq('status', 'pending')
  return data || []
}

export async function approveUser(id) {
  await supabase.from('profiles').update({ status: 'approved' }).eq('id', id)
}

export async function rejectUser(id) {
  await supabase.from('profiles').update({ status: 'rejected' }).eq('id', id)
}

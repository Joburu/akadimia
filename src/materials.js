import { supabase } from './supabase.js'

export async function uploadMaterial(file, courseCode, field, title, description, uploaderName, passcode='') {
  const ext = file.name.split('.').pop()
  const path = `${field}/${courseCode}/${Date.now()}_${file.name.replace(/\s+/g, '_')}`
  
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('course-materials')
    .upload(path, file, { cacheControl: '3600', upsert: false })
  
  if (uploadError) return { error: uploadError.message }
  
  const { data: urlData } = supabase.storage
    .from('course-materials')
    .getPublicUrl(path)
  
  const { error: dbError } = await supabase
    .from('course_materials')
    .insert({
      course_code: courseCode,
      field,
      title,
      description,
      file_url: urlData.publicUrl,
      file_type: file.type,
      file_size: file.size,
      uploader_name: uploaderName,
      passcode: passcode||null
    })
  
  if (dbError) return { error: dbError.message }
  return { success: true, url: urlData.publicUrl }
}

export async function getMaterials(field, courseCode) {
  const query = supabase
    .from('course_materials')
    .select('*')
    .eq('field', field)
    .order('created_at', { ascending: false })
  
  if (courseCode) query.eq('course_code', courseCode)
  
  const { data, error } = await query
  return data || []
}

export async function deleteMaterial(id) {
  const { error } = await supabase.from('course_materials').delete().eq('id', id)
  if (error) console.error('Delete error:', error)
  return !error
}

export function formatFileSize(bytes) {
  if (!bytes) return ''
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

export function fileIcon(type) {
  if (!type) return '📄'
  if (type.includes('pdf')) return '📕'
  if (type.includes('word')) return '📘'
  if (type.includes('powerpoint') || type.includes('presentation')) return '📙'
  if (type.includes('video')) return '🎬'
  if (type.includes('audio')) return '🎧'
  if (type.includes('image')) return '🖼'
  return '📄'
}

export async function saveLinkMaterial(link, courseCode, field, title, description, uploaderName, passcode='') {
  const isVideo = link.includes('youtube') || link.includes('youtu.be') || link.includes('zoom') || link.includes('loom') || link.includes('drive.google') || link.includes('onedrive')
  const { supabase } = await import('./supabase.js')
  const { error } = await supabase
    .from('course_materials')
    .insert({
      course_code: courseCode,
      field,
      title,
      description,
      file_url: link,
      file_type: isVideo ? 'video/external' : 'link/external',
      file_size: 0,
      uploader_name: uploaderName,
      passcode: passcode||null
    })
  if (error) return { error: error.message }
  return { success: true }
}

import { useState } from 'react'
import { supabase } from '../lib/supabase'

export function useProfile(session) {
  const [saving, setSaving] = useState(false)

  const user = session?.user
  const displayName = user?.user_metadata?.display_name ?? ''
  const avatarUrl = user?.user_metadata?.avatar_url ?? null

  async function updateDisplayName(name) {
    setSaving(true)
    const trimmed = name.trim()
    const { error } = await supabase.auth.updateUser({ data: { display_name: trimmed } })
    if (!error) {
      await supabase.from('profiles').update({ display_name: trimmed }).eq('id', user.id)
    }
    setSaving(false)
    if (error) throw error
  }

  async function uploadAvatar(file) {
    setSaving(true)
    const ext = file.name.split('.').pop()
    const path = `${user.id}/avatar.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true })
    if (uploadError) { setSaving(false); throw uploadError }

    const { data } = supabase.storage.from('avatars').getPublicUrl(path)
    const url = `${data.publicUrl}?t=${Date.now()}`

    const { error: updateError } = await supabase.auth.updateUser({ data: { avatar_url: url } })
    if (!updateError) {
      await supabase.from('profiles').update({ avatar_url: url }).eq('id', user.id)
    }
    setSaving(false)
    if (updateError) throw updateError
    return url
  }

  return { displayName, avatarUrl, saving, updateDisplayName, uploadAvatar }
}

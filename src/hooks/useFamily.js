import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function useFamily() {
  const [family, setFamily] = useState(null)
  const [members, setMembers] = useState([])
  const [currentUserId, setCurrentUserId] = useState(null)
  const [loading, setLoading] = useState(true)

  async function fetchFamily() {
    const { data: { user } } = await supabase.auth.getUser()
    const { data: member } = await supabase
      .from('family_members')
      .select('family_id, role')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (!member) { setLoading(false); return }

    const [{ data: familyData }, { data: membersData }] = await Promise.all([
      supabase.from('families').select('*').eq('id', member.family_id).single(),
      supabase.from('family_members').select('id, role, status, invite_email, user_id').eq('family_id', member.family_id),
    ])

    // 单独拉 profiles 再合并（family_members 无直接 FK 到 profiles）
    const userIds = (membersData ?? []).filter((m) => m.user_id).map((m) => m.user_id)
    let profilesMap = {}
    if (userIds.length > 0) {
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url')
        .in('id', userIds)
      for (const p of profilesData ?? []) profilesMap[p.id] = p
    }

    const membersWithProfiles = (membersData ?? []).map((m) => ({
      ...m,
      profile: m.user_id ? (profilesMap[m.user_id] ?? null) : null,
    }))

    setFamily({ ...familyData, myRole: member.role })
    setMembers(membersWithProfiles)
    setCurrentUserId(user.id)
    setLoading(false)
  }

  useEffect(() => { fetchFamily() }, [])

  async function invite(email) {
    const normalizedEmail = email.trim().toLowerCase()

    // 检查是否已经是成员或已邀请
    const already = members.some(
      (m) => m.invite_email?.toLowerCase() === normalizedEmail
    )
    if (already) throw new Error('该邮箱已被邀请或已是成员')

    const { error } = await supabase.from('family_members').insert({
      family_id: family.id,
      invite_email: normalizedEmail,
      role: 'member',
      status: 'pending',
    })
    if (error) throw error
    await fetchFamily()
  }

  async function removeMember(memberId) {
    const { error } = await supabase.from('family_members').delete().eq('id', memberId)
    if (error) throw error
    setMembers((prev) => prev.filter((m) => m.id !== memberId))
  }

  async function renameFamily(name) {
    const { error } = await supabase.from('families').update({ name }).eq('id', family.id)
    if (error) throw error
    setFamily((prev) => ({ ...prev, name }))
  }

  return { family, members, currentUserId, loading, invite, removeMember, renameFamily }
}

import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useFamily } from '../hooks/useFamily'
import { useProfile } from '../hooks/useProfile'

export default function SettingsPage() {
  const { session, signOut } = useAuth()
  const { family, members, currentUserId, loading, invite, removeMember, renameFamily } = useFamily()
  const { displayName, avatarUrl, saving: profileSaving, updateDisplayName, uploadAvatar } = useProfile(session)

  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteError, setInviteError] = useState('')
  const [inviteSuccess, setInviteSuccess] = useState('')
  const [inviting, setInviting] = useState(false)

  const [editingName, setEditingName] = useState(false)
  const [familyName, setFamilyName] = useState('')

  const [editingDisplayName, setEditingDisplayName] = useState(false)
  const [newDisplayName, setNewDisplayName] = useState('')
  const [localAvatarUrl, setLocalAvatarUrl] = useState(null)

  const currentAvatar = localAvatarUrl ?? avatarUrl
  const currentName = displayName || session?.user?.email?.split('@')[0]

  async function handleAvatarChange(e) {
    const file = e.target.files[0]
    if (!file) return
    setLocalAvatarUrl(URL.createObjectURL(file))
    try {
      const url = await uploadAvatar(file)
      setLocalAvatarUrl(url)
    } catch (err) {
      alert(err.message)
      setLocalAvatarUrl(null)
    }
  }

  async function handleDisplayNameSave(e) {
    e.preventDefault()
    if (!newDisplayName.trim()) return
    try {
      await updateDisplayName(newDisplayName)
      setEditingDisplayName(false)
    } catch (err) {
      alert(err.message)
    }
  }

  async function handleInvite(e) {
    e.preventDefault()
    setInviteError('')
    setInviteSuccess('')
    setInviting(true)
    try {
      await invite(inviteEmail)
      setInviteSuccess(`已添加邀请，请让对方用 ${inviteEmail} 注册即可自动加入`)
      setInviteEmail('')
    } catch (err) {
      setInviteError(err.message)
    } finally {
      setInviting(false)
    }
  }

  async function handleRename(e) {
    e.preventDefault()
    await renameFamily(familyName.trim())
    setEditingName(false)
  }

  const activeMembers = members.filter((m) => m.status === 'active')
  const pendingMembers = members.filter((m) => m.status === 'pending')
  const isOwner = family?.myRole === 'owner'

  if (loading) return <p className="text-center py-12 text-gray-400">加载中…</p>

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-bold">设置</h2>

      {/* 个人资料 */}
      <div className="card">
        <p className="text-xs text-gray-400 mb-3">个人资料</p>
        <div className="flex items-center gap-4">
          {/* 头像 */}
          <label className="relative cursor-pointer shrink-0">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-primary-100 flex items-center justify-center">
              {currentAvatar ? (
                <img src={currentAvatar} alt="头像" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-semibold text-primary-500">
                  {currentName?.[0]?.toUpperCase()}
                </span>
              )}
            </div>
            <div className="absolute bottom-0 right-0 w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center text-white text-xs">
              ✎
            </div>
            <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} disabled={profileSaving} />
          </label>

          {/* 用户名 */}
          <div className="flex-1 min-w-0">
            {editingDisplayName ? (
              <form onSubmit={handleDisplayNameSave} className="flex gap-2">
                <input
                  className="input flex-1"
                  value={newDisplayName}
                  onChange={(e) => setNewDisplayName(e.target.value)}
                  placeholder="输入用户名"
                  autoFocus
                />
                <button type="submit" className="btn-primary text-sm px-3" disabled={profileSaving}>保存</button>
                <button type="button" onClick={() => setEditingDisplayName(false)} className="btn-ghost text-sm px-2">✕</button>
              </form>
            ) : (
              <div className="flex items-center gap-2">
                <div>
                  <p className="font-semibold text-gray-800 truncate">{currentName}</p>
                  <p className="text-xs text-gray-400 truncate">{session?.user?.email}</p>
                </div>
                <button
                  onClick={() => { setNewDisplayName(displayName); setEditingDisplayName(true) }}
                  className="text-xs text-gray-400 hover:text-gray-600 shrink-0"
                >
                  编辑
                </button>
              </div>
            )}
          </div>
        </div>
        <button onClick={signOut} className="mt-4 text-sm text-red-400 hover:text-red-600">退出登录</button>
      </div>

      {/* 家庭信息 */}
      {family && (
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            {editingName ? (
              <form onSubmit={handleRename} className="flex gap-2 flex-1">
                <input className="input flex-1" value={familyName} onChange={(e) => setFamilyName(e.target.value)} autoFocus />
                <button type="submit" className="btn-primary text-sm px-3">保存</button>
                <button type="button" onClick={() => setEditingName(false)} className="btn-ghost text-sm px-3">取消</button>
              </form>
            ) : (
              <>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">家庭名称</p>
                  <p className="font-semibold text-gray-800">{family.name}</p>
                </div>
                {isOwner && (
                  <button onClick={() => { setFamilyName(family.name); setEditingName(true) }}
                    className="text-sm text-gray-400 hover:text-gray-600">编辑</button>
                )}
              </>
            )}
          </div>

          <div className="mt-3">
            <p className="text-xs text-gray-400 mb-2">成员（{activeMembers.length} 人）</p>
            <ul className="space-y-2">
              {activeMembers.map((m) => {
                const isSelf = m.user_id === currentUserId
                const name = isSelf
                  ? (currentName)
                  : (m.profile?.display_name || m.invite_email || '（未知）')
                const avatar = isSelf ? currentAvatar : m.profile?.avatar_url
                return (
                <li key={m.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary-100 overflow-hidden flex items-center justify-center text-primary-600 text-sm font-medium shrink-0">
                      {avatar
                        ? <img src={avatar} alt={name} className="w-full h-full object-cover" />
                        : name[0]?.toUpperCase()
                      }
                    </div>
                    <div>
                      <p className="text-sm text-gray-700">{name}</p>
                      <p className="text-xs text-gray-400">{m.role === 'owner' ? '管理员' : '成员'}</p>
                    </div>
                  </div>
                  {isOwner && m.role !== 'owner' && (
                    <button onClick={() => removeMember(m.id)} className="text-xs text-gray-300 hover:text-red-400">移除</button>
                  )}
                </li>
              )})}
            </ul>
          </div>

          {pendingMembers.length > 0 && (
            <div className="mt-4">
              <p className="text-xs text-gray-400 mb-2">待加入（{pendingMembers.length}）</p>
              <ul className="space-y-2">
                {pendingMembers.map((m) => (
                  <li key={m.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
                        {m.invite_email?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">{m.invite_email}</p>
                        <p className="text-xs text-amber-500">等待注册</p>
                      </div>
                    </div>
                    {isOwner && (
                      <button onClick={() => removeMember(m.id)} className="text-xs text-gray-300 hover:text-red-400">取消</button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* 邀请表单 */}
      {isOwner && (
        <div className="card">
          <p className="text-xs text-gray-400 mb-3">邀请家庭成员</p>
          <form onSubmit={handleInvite} className="space-y-2">
            <input className="input" type="email" placeholder="输入对方邮箱" value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)} required />
            {inviteError && <p className="text-sm text-red-500">{inviteError}</p>}
            {inviteSuccess && (
              <div className="bg-green-50 border border-green-100 rounded-lg p-3">
                <p className="text-sm text-green-700">{inviteSuccess}</p>
              </div>
            )}
            <button type="submit" className="btn-primary w-full" disabled={inviting}>
              {inviting ? '处理中…' : '发送邀请'}
            </button>
          </form>
          <p className="text-xs text-gray-400 mt-3">对方用该邮箱注册后，会自动加入你的家庭，共享菜谱和菜单。</p>
        </div>
      )}
    </div>
  )
}

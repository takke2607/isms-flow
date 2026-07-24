'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import { useAuth } from '@/components/layout/AuthWrapper'

interface UserItem {
  username: string
  email: string
  password?: string
  role: 'global_admin' | 'admin' | 'monitor'
}

interface SystemSettings {
  orgName: string
  scope: string
  version: string
  targetDate: string
}

export default function SettingsPage() {
  const { session, isAdmin } = useAuth()
  const [activeTab, setActiveTab] = useState<'general' | 'users' | 'profile'>('general')
  
  // User Management state
  const [users, setUsers] = useState<UserItem[]>([])
  const [newUsername, setNewUsername] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newRole, setNewRole] = useState<'admin' | 'monitor'>('admin')
  const [userError, setUserError] = useState('')
  const [userSuccess, setUserSuccess] = useState('')

  // System Settings state
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    orgName: 'Standard Compliance Org',
    scope: 'All core IT infrastructure, cloud services, software development, and support services.',
    version: 'ISO/IEC 27001:2022',
    targetDate: '2026-12-31'
  })
  const [settingsSuccess, setSettingsSuccess] = useState('')

  // Profile Settings state (initialized in useEffect once session is loaded)
  const [profileUsername, setProfileUsername] = useState('')
  const [profileEmail, setProfileEmail] = useState('')
  const [profilePassword, setProfilePassword] = useState('')
  const [profileSuccess, setProfileSuccess] = useState('')
  const [profileError, setProfileError] = useState('')

  useEffect(() => {
    // Load Users
    const storedUsers = localStorage.getItem('isms_users')
    if (storedUsers) {
      try {
        const parsed = JSON.parse(storedUsers) as any[]
        // Migrate old user items without username (use email prefix as username)
        const migrated = parsed.map((u: any) => ({
          ...u,
          username: u.username || (u.email ? u.email.split('@')[0] : 'user')
        }))
        setUsers(migrated)
        localStorage.setItem('isms_users', JSON.stringify(migrated))
      } catch (e) {
        console.error(e)
      }
    } else {
      const defaults: UserItem[] = [
        { username: 'admin', email: 'admin@example.com', password: 'admin@123', role: 'global_admin' },
        { username: 'monitor', email: 'monitor@example.com', password: 'password', role: 'monitor' }
      ]
      localStorage.setItem('isms_users', JSON.stringify(defaults))
      setUsers(defaults)
    }

    // Load System Settings
    const storedSettings = localStorage.getItem('isms_system_settings')
    if (storedSettings) {
      try {
        setSystemSettings(JSON.parse(storedSettings))
      } catch (e) {
        console.error('Error parsing settings', e)
      }
    }
  }, [])

  // Initialize Profile form state from active session
  useEffect(() => {
    if (session) {
      setProfileUsername(session.username || '')
      setProfileEmail(session.email || '')
    }
  }, [session])

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault()
    setProfileSuccess('')
    setProfileError('')

    if (!profileUsername.trim() || !profileEmail.trim()) {
      setProfileError('Username and Email cannot be empty.')
      return
    }

    const storedUsers = localStorage.getItem('isms_users')
    let currentUsers: UserItem[] = storedUsers ? JSON.parse(storedUsers) : []

    const index = currentUsers.findIndex(u => u.username === session?.username || u.email === session?.email)
    if (index === -1) {
      setProfileError('Current user profile not found.')
      return
    }

    // Check if username is taken
    const usernameTaken = currentUsers.some((u, i) => i !== index && u.username && u.username.toLowerCase() === profileUsername.toLowerCase())
    if (usernameTaken) {
      setProfileError('Username is already taken.')
      return
    }

    currentUsers[index].username = profileUsername
    currentUsers[index].email = profileEmail
    if (profilePassword) {
      currentUsers[index].password = profilePassword
    }

    localStorage.setItem('isms_users', JSON.stringify(currentUsers))
    setUsers(currentUsers)

    const updatedSession = {
      username: profileUsername,
      email: profileEmail,
      role: currentUsers[index].role
    }
    sessionStorage.setItem('isms_user_session', JSON.stringify(updatedSession))

    setProfileSuccess('Profile updated successfully!')
    setProfilePassword('')

    window.dispatchEvent(new Event('isms_refresh_header'))
  }

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault()
    setUserError('')
    setUserSuccess('')

    if (!isAdmin) {
      setUserError('Permission denied: Only Admin users can create users.')
      return
    }

    if (!newUsername.trim() || !newEmail.trim() || !newPassword.trim()) {
      setUserError('Please enter username, email, and password.')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(newEmail)) {
      setUserError('Please enter a valid email address.')
      return
    }

    const existsUsername = users.some(u => u.username.toLowerCase() === newUsername.toLowerCase().trim())
    if (existsUsername) {
      setUserError('A user with this username already exists.')
      return
    }

    const existsEmail = users.some(u => u.email.toLowerCase() === newEmail.toLowerCase().trim())
    if (existsEmail) {
      setUserError('A user with this email address already exists.')
      return
    }

    const newUser: UserItem = {
      username: newUsername.trim(),
      email: newEmail.toLowerCase().trim(),
      password: newPassword,
      role: newRole
    }

    const updated = [...users, newUser]
    localStorage.setItem('isms_users', JSON.stringify(updated))
    setUsers(updated)
    
    setNewUsername('')
    setNewEmail('')
    setNewPassword('')
    setUserSuccess(`Successfully created user: ${newUser.username}`)
  }

  const handleDeleteUser = (usernameToDelete: string | undefined) => {
    if (!isAdmin) return
    if (!usernameToDelete) return
    if (usernameToDelete.toLowerCase() === 'admin') {
      alert('Cannot delete the seeded Global Admin account.')
      return
    }
    if (!confirm(`Are you sure you want to delete user ${usernameToDelete}?`)) return

    const updated = users.filter(u => u.username && u.username.toLowerCase() !== usernameToDelete.toLowerCase())
    localStorage.setItem('isms_users', JSON.stringify(updated))
    setUsers(updated)
  }

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault()
    setSettingsSuccess('')
    
    localStorage.setItem('isms_system_settings', JSON.stringify(systemSettings))
    setSettingsSuccess('System configuration saved successfully!')

    window.dispatchEvent(new Event('isms_settings_updated'))
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Header title="Control Panel" subtitle="Configure system parameters, profiles and user credentials" />
        <main className="page-body">
          
          {/* Settings Tabs */}
          <div style={{
            display: 'flex',
            gap: '8px',
            borderBottom: '1.5px solid var(--color-border)',
            marginBottom: '24px',
            paddingBottom: '0'
          }}>
            {['general', 'profile', 'users'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                style={{
                  background: activeTab === tab ? 'var(--color-border)' : '#fff',
                  color: activeTab === tab ? '#fff' : '#000',
                  border: '1.5px solid var(--color-border)',
                  borderBottom: 'none',
                  padding: '10px 20px',
                  fontFamily: 'Share Tech Mono, monospace',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  transition: 'all 0.1s ease',
                  position: 'relative',
                  top: '1.5px'
                }}
              >
                {tab === 'general' ? '⚙️ System Settings' : tab === 'profile' ? '👤 My Profile' : '👥 User Management'}
              </button>
            ))}
          </div>

          {/* TAB 1: General Settings */}
          {activeTab === 'general' && (
            <div>
              <div className="page-header" style={{ marginBottom: '20px' }}>
                <h2 className="page-title">General System Settings</h2>
                <p className="page-desc">
                  Define high-level organizational parameters for the ISMS Compliance Tracker.
                </p>
              </div>

              <div className="card" style={{ padding: '24px', maxWidth: '800px' }}>
                {settingsSuccess && (
                  <div style={{ background: 'rgba(22, 101, 52, 0.1)', border: '1px solid #166534', color: '#166534', padding: '10px', fontSize: '11px', borderRadius: '4px', marginBottom: '16px' }}>
                    {settingsSuccess}
                  </div>
                )}

                <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, fontFamily: 'Share Tech Mono', textTransform: 'uppercase', marginBottom: '4px' }}>
                      Organization Name
                    </label>
                    <input
                      type="text"
                      disabled={!isAdmin}
                      value={systemSettings.orgName}
                      onChange={e => setSystemSettings({ ...systemSettings, orgName: e.target.value })}
                      style={{ width: '100%', border: '1.5px solid #000', padding: '8px 12px', fontSize: '12px', fontFamily: 'Inter', background: isAdmin ? '#fff' : '#f3f4f6' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, fontFamily: 'Share Tech Mono', textTransform: 'uppercase', marginBottom: '4px' }}>
                      Compliance Scope Definition
                    </label>
                    <textarea
                      rows={3}
                      disabled={!isAdmin}
                      value={systemSettings.scope}
                      onChange={e => setSystemSettings({ ...systemSettings, scope: e.target.value })}
                      style={{ width: '100%', border: '1.5px solid #000', padding: '8px 12px', fontSize: '12px', fontFamily: 'Inter', background: isAdmin ? '#fff' : '#f3f4f6', resize: 'vertical' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, fontFamily: 'Share Tech Mono', textTransform: 'uppercase', marginBottom: '4px' }}>
                        Compliance Standard Version
                      </label>
                      <input
                        type="text"
                        disabled={!isAdmin}
                        value={systemSettings.version}
                        onChange={e => setSystemSettings({ ...systemSettings, version: e.target.value })}
                        style={{ width: '100%', border: '1.5px solid #000', padding: '8px 12px', fontSize: '12px', fontFamily: 'Inter', background: isAdmin ? '#fff' : '#f3f4f6' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, fontFamily: 'Share Tech Mono', textTransform: 'uppercase', marginBottom: '4px' }}>
                        Target Audit Date
                      </label>
                      <input
                        type="date"
                        disabled={!isAdmin}
                        value={systemSettings.targetDate}
                        onChange={e => setSystemSettings({ ...systemSettings, targetDate: e.target.value })}
                        style={{ width: '100%', border: '1.5px solid #000', padding: '8px 12px', fontSize: '12px', fontFamily: 'Inter', background: isAdmin ? '#fff' : '#f3f4f6' }}
                      />
                    </div>
                  </div>

                  {isAdmin ? (
                    <button
                      type="submit"
                      style={{
                        background: '#000', color: '#fff', border: 'none', padding: '10px 20px',
                        fontSize: '11px', fontWeight: 700, fontFamily: 'Share Tech Mono',
                        textTransform: 'uppercase', cursor: 'pointer', alignSelf: 'flex-start', marginTop: '8px',
                        boxShadow: '3px 3px 0px var(--color-accent)'
                      }}
                    >
                      Save Configuration
                    </button>
                  ) : (
                    <div style={{ fontSize: '11px', color: '#6b7280', fontFamily: 'Share Tech Mono', marginTop: '8px' }}>
                      ℹ️ System settings can only be edited by Administrators.
                    </div>
                  )}
                </form>
              </div>
            </div>
          )}

          {/* TAB 2: Profile Settings */}
          {activeTab === 'profile' && (
            <div>
              <div className="page-header" style={{ marginBottom: '20px' }}>
                <h2 className="page-title">My Profile & Security Settings</h2>
                <p className="page-desc">
                  Update your active profile credentials, including username, email address, and account password.
                </p>
              </div>

              <div className="card" style={{ padding: '24px', maxWidth: '600px' }}>
                {profileSuccess && (
                  <div style={{ background: 'rgba(22, 101, 52, 0.1)', border: '1px solid #166534', color: '#166534', padding: '10px', fontSize: '11px', borderRadius: '4px', marginBottom: '16px' }}>
                    {profileSuccess}
                  </div>
                )}
                {profileError && (
                  <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#ef4444', padding: '10px', fontSize: '11px', borderRadius: '4px', marginBottom: '16px' }}>
                    {profileError}
                  </div>
                )}

                <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, fontFamily: 'Share Tech Mono', textTransform: 'uppercase', marginBottom: '4px' }}>
                      Username
                    </label>
                    <input
                      type="text"
                      value={profileUsername}
                      onChange={e => setProfileUsername(e.target.value)}
                      style={{ width: '100%', border: '1.5px solid #000', padding: '8px 12px', fontSize: '12px', fontFamily: 'Inter' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, fontFamily: 'Share Tech Mono', textTransform: 'uppercase', marginBottom: '4px' }}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={profileEmail}
                      onChange={e => setProfileEmail(e.target.value)}
                      style={{ width: '100%', border: '1.5px solid #000', padding: '8px 12px', fontSize: '12px', fontFamily: 'Inter' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, fontFamily: 'Share Tech Mono', textTransform: 'uppercase', marginBottom: '4px' }}>
                      New Password (leave blank to keep current)
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={profilePassword}
                      onChange={e => setProfilePassword(e.target.value)}
                      style={{ width: '100%', border: '1.5px solid #000', padding: '8px 12px', fontSize: '12px', fontFamily: 'Inter' }}
                    />
                  </div>

                  <button
                    type="submit"
                    style={{
                      background: '#000', color: '#fff', border: 'none', padding: '10px 20px',
                      fontSize: '11px', fontWeight: 700, fontFamily: 'Share Tech Mono',
                      textTransform: 'uppercase', cursor: 'pointer', alignSelf: 'flex-start', marginTop: '8px',
                      boxShadow: '3px 3px 0px var(--color-accent)'
                    }}
                  >
                    Update Profile →
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 3: User Access Management */}
          {activeTab === 'users' && (
            <div>
              <div className="page-header" style={{ marginBottom: '20px' }}>
                <h2 className="page-title">Identity & Access Management (IAM)</h2>
                <p className="page-desc">
                  Manage login credentials and authorization roles for the compliance tracker portal.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: isAdmin ? '1.5fr 1fr' : '1fr', gap: '20px' }}>
                {/* User List Panel */}
                <div className="card" style={{ padding: '24px' }}>
                  <div className="card-header" style={{ marginBottom: '16px', paddingBottom: '12px', borderBottom: '1.5px solid #000' }}>
                    <div className="card-title" style={{ fontFamily: 'Share Tech Mono', fontSize: '13px', textTransform: 'uppercase' }}>Active Users Register</div>
                    <div className="card-subtitle">List of accounts authorized to access the compliance portal</div>
                  </div>

                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid #000', textAlign: 'left', fontFamily: 'Share Tech Mono', fontSize: '10px', textTransform: 'uppercase' }}>
                          <th style={{ padding: '8px 12px' }}>Username</th>
                          <th style={{ padding: '8px 12px' }}>Email</th>
                          <th style={{ padding: '8px 12px' }}>Role</th>
                          {isAdmin && <th style={{ padding: '8px 12px', textAlign: 'right' }}>Actions</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((u, idx) => (
                          <tr key={`${u.username || ''}-${u.email || ''}-${idx}`} style={{ borderBottom: '1px solid #e5e7eb' }}>
                            <td style={{ padding: '12px', fontWeight: 600, color: '#111827' }}>{u.username}</td>
                            <td style={{ padding: '12px', color: '#4b5563' }}>{u.email}</td>
                            <td style={{ padding: '12px' }}>
                              <span style={{
                                fontSize: '9px',
                                fontFamily: 'Share Tech Mono',
                                textTransform: 'uppercase',
                                fontWeight: 700,
                                padding: '3px 8px',
                                border: '1.5px solid #000',
                                background: u.role === 'global_admin' ? '#dbeafe' : u.role === 'admin' ? '#fef3c7' : '#f3f4f6',
                                color: u.role === 'global_admin' ? '#1e40af' : u.role === 'admin' ? '#92400e' : '#374151'
                              }}>
                                {u.role === 'global_admin' ? 'Global Admin' : u.role === 'admin' ? 'Admin' : 'Monitor'}
                              </span>
                            </td>
                            {isAdmin && (
                              <td style={{ padding: '12px', textAlign: 'right' }}>
                                {u.role !== 'global_admin' ? (
                                  <button
                                    onClick={() => handleDeleteUser(u.username)}
                                    style={{
                                      background: 'none', border: '1px solid #fca5a5', color: '#b91c1c',
                                      padding: '4px 10px', fontSize: '10px', fontFamily: 'Share Tech Mono',
                                      cursor: 'pointer', textTransform: 'uppercase'
                                    }}
                                  >
                                    Revoke Access
                                  </button>
                                ) : (
                                  <span style={{ fontSize: '10px', color: '#9ca3af', fontFamily: 'Share Tech Mono' }}>Protected</span>
                                )}
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Create User Form Panel */}
                {isAdmin ? (
                  <div className="card" style={{ padding: '24px' }}>
                    <div className="card-header" style={{ marginBottom: '16px', paddingBottom: '12px', borderBottom: '1.5px solid #000' }}>
                      <div className="card-title" style={{ fontFamily: 'Share Tech Mono', fontSize: '13px', textTransform: 'uppercase' }}>Add New User Account</div>
                      <div className="card-subtitle">Create administrators or monitor credentials</div>
                    </div>

                    {userError && (
                      <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#ef4444', padding: '10px', fontSize: '11px', borderRadius: '4px', marginBottom: '16px' }}>
                        {userError}
                      </div>
                    )}
                    {userSuccess && (
                      <div style={{ background: 'rgba(22, 101, 52, 0.1)', border: '1px solid #166534', color: '#166534', padding: '10px', fontSize: '11px', borderRadius: '4px', marginBottom: '16px' }}>
                        {userSuccess}
                      </div>
                    )}

                    <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, fontFamily: 'Share Tech Mono', textTransform: 'uppercase', marginBottom: '4px' }}>
                          Username
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. auditor"
                          value={newUsername}
                          onChange={e => setNewUsername(e.target.value)}
                          style={{ width: '100%', border: '1.5px solid #000', padding: '6px 10px', fontSize: '12px', fontFamily: 'Inter' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, fontFamily: 'Share Tech Mono', textTransform: 'uppercase', marginBottom: '4px' }}>
                          Email Address
                        </label>
                        <input
                          type="email"
                          placeholder="e.g. auditor@company.com"
                          value={newEmail}
                          onChange={e => setNewEmail(e.target.value)}
                          style={{ width: '100%', border: '1.5px solid #000', padding: '6px 10px', fontSize: '12px', fontFamily: 'Inter' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, fontFamily: 'Share Tech Mono', textTransform: 'uppercase', marginBottom: '4px' }}>
                          Password
                        </label>
                        <input
                          type="password"
                          placeholder="••••••••"
                          value={newPassword}
                          onChange={e => setNewPassword(e.target.value)}
                          style={{ width: '100%', border: '1.5px solid #000', padding: '6px 10px', fontSize: '12px', fontFamily: 'Inter' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, fontFamily: 'Share Tech Mono', textTransform: 'uppercase', marginBottom: '4px' }}>
                          Assigned Role Permission
                        </label>
                        <select
                          value={newRole}
                          onChange={e => setNewRole(e.target.value as any)}
                          style={{ width: '100%', border: '1.5px solid #000', padding: '6px 8px', fontSize: '12px', fontFamily: 'Inter', background: '#fff' }}
                        >
                          <option value="admin">Admin (Read/Write)</option>
                          <option value="monitor">Monitor (Read-only)</option>
                        </select>
                      </div>

                      <button
                        type="submit"
                        style={{
                          background: '#000', color: '#fff', border: 'none', padding: '10px',
                          fontSize: '11px', fontWeight: 700, fontFamily: 'Share Tech Mono',
                          textTransform: 'uppercase', cursor: 'pointer', marginTop: '8px'
                        }}
                      >
                        Create User →
                      </button>
                    </form>
                  </div>
                ) : (
                  <div style={{ background: '#f9fafb', border: '1.5px dashed #d1d5db', padding: '16px', textAlign: 'center', fontSize: '11px', color: '#6b7280', fontFamily: 'Share Tech Mono' }}>
                    ℹ Identity & Access management console is restricted. Only Administrator users can add or manage user permissions.
                  </div>
                )}
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null)

  const supabase = createClient()

  const handleLogin = async () => {
    if (!email || !password) {
      setMessage({ text: 'Bitte E-Mail und Passwort eingeben', ok: false })
      return
    }
    setLoading(true)
    setMessage(null)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setMessage({ text: `Fehler: ${error.message}`, ok: false })
      } else if (data.session) {
        setMessage({ text: 'Login erfolgreich! Weiterleitung…', ok: true })
        setTimeout(() => { window.location.replace('/dashboard') }, 500)
      } else {
        setMessage({ text: 'Unbekannter Fehler — keine Session erhalten', ok: false })
      }
    } catch (e: any) {
      setMessage({ text: `Exception: ${e.message}`, ok: false })
    }
    setLoading(false)
  }

  const handleMagicLink = async () => {
    if (!email) {
      setMessage({ text: 'Bitte E-Mail eingeben', ok: false })
      return
    }
    setLoading(true)
    setMessage(null)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: 'http://localhost:3000/auth/callback' }
    })
    if (error) setMessage({ text: error.message, ok: false })
    else setMessage({ text: 'Magic Link gesendet! Prüfe dein Postfach.', ok: true })
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: '#0F0F14' }}>
      <div style={{ width: '100%', maxWidth: 360 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 36, color: '#E8E6E0', letterSpacing: '-0.02em' }}>
            <span style={{ color: '#A78BFA' }}>nach</span>holen
          </h1>
          <p style={{ color: '#6B6B7A', fontSize: 14, marginTop: 8 }}>Dein Ort für alles, was noch offen ist.</p>
        </div>

        <div style={{ background: '#16161E', border: '1px solid #2A2A35', borderRadius: 16, padding: 24 }}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#6B6B7A', marginBottom: 6 }}>E-Mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="deine@email.de"
              style={{ width: '100%', background: '#1E1E28', border: '1px solid #2A2A35', borderRadius: 8, padding: '10px 12px', fontSize: 14, color: '#E8E6E0', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#6B6B7A', marginBottom: 6 }}>Passwort</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              style={{ width: '100%', background: '#1E1E28', border: '1px solid #2A2A35', borderRadius: 8, padding: '10px 12px', fontSize: 14, color: '#E8E6E0', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          {message && (
            <div style={{ marginBottom: 16, padding: '10px 12px', borderRadius: 8, background: message.ok ? 'rgba(16,185,129,0.1)' : 'rgba(214,62,94,0.1)', color: message.ok ? '#10B981' : '#D63E5E', fontSize: 13 }}>
              {message.text}
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            style={{ width: '100%', background: loading ? '#4C3D8F' : '#7C3AED', color: '#fff', border: 'none', borderRadius: 10, padding: '11px', fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', marginBottom: 10 }}
          >
            {loading ? 'Bitte warten…' : 'Einloggen'}
          </button>

          <button
            onClick={handleMagicLink}
            disabled={loading}
            style={{ width: '100%', background: 'transparent', color: '#A78BFA', border: '1px solid #2A2A35', borderRadius: 10, padding: '10px', fontSize: 13, cursor: 'pointer' }}
          >
            Magic Link senden (kein Passwort)
          </button>
        </div>
      </div>
    </div>
  )
}

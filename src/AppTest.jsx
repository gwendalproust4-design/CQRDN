import React from 'react'
import './App.css'

export default function AppTest() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#1a1a1a', color: '#fff', fontFamily: 'monospace' }}>
      <h1>✅ Site fonctionne!</h1>
      <p>Si tu vois ce message, le problème vient de Supabase.</p>
      <p>Vérifiez :</p>
      <ul style={{ textAlign: 'left', maxWidth: '500px' }}>
        <li>Votre URL Supabase (format: https://xxxxx.supabase.co)</li>
        <li>Votre clé API (doit être valide et non expirée)</li>
        <li>Les tables Supabase existent (site_content, team_members)</li>
      </ul>
      <hr style={{ width: '80%', margin: '20px 0' }} />
      <p><small>Temporaire - pour déboguer</small></p>
    </div>
  )
}

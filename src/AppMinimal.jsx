import React from 'react'

export default function AppMinimal() {
  return (
    <div style={{ padding: '40px', fontFamily: 'Arial', color: '#fff', backgroundColor: '#1a1a1a', minHeight: '100vh' }}>
      <h1>✅ React fonctionne!</h1>
      <p>Si tu vois ce message, React charge correctement.</p>
      <p>Le problème vient probablement de :</p>
      <ul>
        <li>Campfire3D.jsx (Three.js)</li>
        <li>Tailwind CSS</li>
        <li>Ou une dépendance qui charge mal</li>
      </ul>
      <hr style={{ margin: '20px 0' }} />
      <p><small>Version test ultra-simple</small></p>
    </div>
  )
}

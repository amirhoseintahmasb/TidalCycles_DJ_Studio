'use client'

import { useState, useEffect } from 'react'
import EffectPanel from './EffectPanel'

interface TrackControlProps {
  trackNum: number
  apiUrl: string
  isActive: boolean
  onActiveChange: (active: boolean) => void
}

export default function TrackControl({ 
  trackNum, 
  apiUrl, 
  isActive,
  onActiveChange 
}: TrackControlProps) {
  const [pattern, setPattern] = useState('sound "~"')
  const [effects, setEffects] = useState({
    room: 0,
    delay: 0,
    gain: 1,
    speed: 1,
    pan: 0,
    cutoff: 0,
    resonance: 0
  })

  const sendCommand = async (cmd: string) => {
    try {
      await fetch(`${apiUrl}/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: cmd })
      })
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const play = () => {
    const effectString = buildEffectString()
    const command = `d${trackNum} $ ${pattern}${effectString}`
    sendCommand(command)
    onActiveChange(true)
  }

  const stop = () => {
    sendCommand(`d${trackNum} silence`)
    onActiveChange(false)
  }

  const buildEffectString = () => {
    const parts: string[] = []
    if (effects.room > 0) parts.push(`# room ${effects.room}`)
    if (effects.delay > 0) parts.push(`# delay ${effects.delay}`)
    if (effects.gain !== 1) parts.push(`# gain ${effects.gain}`)
    if (effects.speed !== 1) parts.push(`# speed ${effects.speed}`)
    if (effects.pan !== 0) parts.push(`# pan ${effects.pan}`)
    if (effects.cutoff > 0) parts.push(`# cutoff ${effects.cutoff}`)
    if (effects.resonance > 0) parts.push(`# resonance ${effects.resonance}`)
    return parts.join(' ')
  }

  return (
    <div className={isActive ? "glass-strong glow-green" : "glass"} style={{
      padding: '24px',
      border: `1px solid ${isActive ? 'rgba(125, 216, 125, 0.4)' : 'rgba(255, 255, 255, 0.1)'}`,
      transition: 'all 0.3s ease'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '15px'
      }}>
        <h3 style={{
          color: isActive ? 'var(--accent-green)' : 'var(--accent-cyan)',
          fontSize: '22px',
          fontFamily: 'monospace',
          fontWeight: 400,
          letterSpacing: '1px',
          textShadow: isActive ? '0 0 10px rgba(125, 216, 125, 0.5)' : 'none'
        }}>
          d{trackNum}
        </h3>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={play}
            className="primary"
          >
            ▶️ PLAY
          </button>
          <button
            onClick={stop}
            className="danger"
          >
            ⏹️ STOP
          </button>
        </div>
      </div>

      {/* Pattern Input */}
      <textarea
        value={pattern}
        onChange={(e) => setPattern(e.target.value)}
        style={{
          width: '100%',
          minHeight: '70px',
          marginBottom: '18px'
        }}
        placeholder='sound "bd sn"'
      />

      {/* Effect Controls */}
      <EffectPanel
        effects={effects}
        onChange={setEffects}
      />
    </div>
  )
}


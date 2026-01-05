'use client'

import { useState, useEffect } from 'react'

interface PatternBuilderProps {
  onSend: (command: string) => void
  externalPattern?: string
  onPatternChange?: (pattern: string) => void
}

export default function PatternBuilder({ onSend, externalPattern, onPatternChange }: PatternBuilderProps) {
  const [track, setTrack] = useState('1')
  const [pattern, setPattern] = useState('sound "bd sn"')

  // Sync with external pattern from Instrument Library
  useEffect(() => {
    if (externalPattern && externalPattern !== pattern) {
      setPattern(externalPattern)
    }
  }, [externalPattern])

  const handlePatternChange = (newPattern: string) => {
    setPattern(newPattern)
    onPatternChange?.(newPattern)
  }
  const [scale, setScale] = useState('major')
  const [root, setRoot] = useState('0')
  const [effects, setEffects] = useState({
    room: false,
    delay: false,
    pan: false
  })

  const scales = [
    'major', 'minor', 'dorian', 'mixolydian',
    'lydian', 'phrygian', 'locrian', 'pentatonic'
  ]

  const buildCommand = () => {
    let cmd = pattern
    
    // Handle melodic patterns with scale - correct TidalCycles syntax
    // scale transforms note numbers: n (scale "major" "0 2 4 5") # sound "superpiano"
    if (pattern.includes('superpiano') || pattern.includes('supersaw') || 
        pattern.includes('supersquare') || pattern.includes('pluck')) {
      // For synths, use scale with note pattern
      const notePattern = root !== '0' ? `${root} [0,2,4,5,7]` : '0 2 4 5 7'
      cmd = `note (scale "${scale}" "${notePattern}") # ${pattern}`
    }
    
    // Add root note shift for samples
    if (root !== '0' && !pattern.includes('super') && !pattern.includes('pluck')) {
      cmd = `${cmd} # n ${root}`
    }
    
    // Add effects
    if (effects.room) cmd = `${cmd} # room 0.5`
    if (effects.delay) cmd = `${cmd} # delay 0.5`
    if (effects.pan) cmd = `${cmd} # pan (slow 2 $ sine)`
    
    return `d${track} $ ${cmd}`
  }

  const send = () => {
    const command = buildCommand()
    onSend(command)
  }

  return (
    <div className="glass-strong" style={{
      padding: '28px',
      border: '1px solid rgba(216, 216, 125, 0.3)'
    }}>
      <h2 style={{
        color: 'var(--accent-yellow)',
        marginBottom: '20px',
        fontSize: '28px',
        fontWeight: 300,
        letterSpacing: '1px',
        textShadow: '0 0 15px rgba(216, 216, 125, 0.4)'
      }}>
        🎨 Pattern Builder
      </h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '15px',
        marginBottom: '15px'
      }}>
        {/* Track Selection */}
        <div>
          <label style={{
            display: 'block',
            marginBottom: '5px',
            color: 'var(--text-secondary)',
            fontSize: '12px'
          }}>
            Track (d1-d9)
          </label>
          <select
            value={track}
            onChange={(e) => setTrack(e.target.value)}
            style={{
              width: '100%'
            }}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
              <option key={n} value={n.toString()}>d{n}</option>
            ))}
          </select>
        </div>

        {/* Scale Selection */}
        <div>
          <label style={{
            display: 'block',
            marginBottom: '5px',
            color: 'var(--text-secondary)',
            fontSize: '12px'
          }}>
            Scale
          </label>
          <select
            value={scale}
            onChange={(e) => setScale(e.target.value)}
            style={{
              width: '100%'
            }}
          >
            {scales.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Root Note */}
        <div>
          <label style={{
            display: 'block',
            marginBottom: '5px',
            color: 'var(--text-secondary)',
            fontSize: '12px'
          }}>
            Root Note (0-11)
          </label>
          <input
            type="number"
            min="0"
            max="11"
            value={root}
            onChange={(e) => setRoot(e.target.value)}
            style={{
              width: '100%'
            }}
          />
        </div>
      </div>

      {/* Pattern Input */}
      <div style={{ marginBottom: '15px' }}>
        <label style={{
          display: 'block',
          marginBottom: '5px',
          color: 'var(--text-secondary)',
          fontSize: '12px'
        }}>
          Pattern
        </label>
        <textarea
          value={pattern}
          onChange={(e) => handlePatternChange(e.target.value)}
          style={{
            width: '100%',
            minHeight: '80px',
            padding: '10px',
            background: '#000',
            color: 'var(--accent-green)',
            border: '1px solid var(--accent-green)',
            borderRadius: '4px',
            fontFamily: 'monospace',
            fontSize: '14px',
            resize: 'vertical'
          }}
          placeholder='sound "bd sn" or notes [0,2,4,7]'
        />
      </div>

      {/* Effects Toggles */}
      <div style={{
        display: 'flex',
        gap: '15px',
        marginBottom: '15px',
        flexWrap: 'wrap'
      }}>
        {Object.entries(effects).map(([key, value]) => (
          <label key={key} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            padding: '8px 15px',
            background: value ? 'var(--accent-green)' : 'var(--bg-button)',
            color: value ? '#000' : 'var(--text-primary)',
            borderRadius: '4px',
            border: `1px solid ${value ? 'var(--accent-green)' : 'var(--accent-cyan)'}`,
            textTransform: 'capitalize'
          }}>
            <input
              type="checkbox"
              checked={value}
              onChange={(e) => setEffects({ ...effects, [key]: e.target.checked })}
              style={{ cursor: 'pointer' }}
            />
            {key}
          </label>
        ))}
      </div>

      {/* Preview & Send */}
      <div className="glass" style={{
        padding: '18px',
        marginBottom: '18px',
        border: '1px solid rgba(125, 211, 216, 0.2)',
        background: 'rgba(125, 211, 216, 0.05)'
      }}>
        <div style={{
          fontSize: '11px',
          color: 'var(--text-secondary)',
          marginBottom: '5px'
        }}>
          Preview:
        </div>
        <div style={{
          fontFamily: 'monospace',
          color: 'var(--accent-green)',
          fontSize: '12px',
          wordBreak: 'break-all'
        }}>
          {buildCommand()}
        </div>
      </div>

      <button
        onClick={send}
        className="primary"
        style={{
          width: '100%',
          padding: '18px',
          fontSize: '16px'
        }}
      >
        🚀 SEND TO TIDALCYCLES
      </button>
    </div>
  )
}


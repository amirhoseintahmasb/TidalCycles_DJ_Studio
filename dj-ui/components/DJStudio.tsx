'use client'

import { useState } from 'react'
import TrackControl from './TrackControl'
import InstrumentLibrary from './InstrumentLibrary'
import EffectPanel from './EffectPanel'
import PatternBuilder from './PatternBuilder'

interface DJStudioProps {
  apiUrl: string
}

export default function DJStudio({ apiUrl }: DJStudioProps) {
  const [activeTracks, setActiveTracks] = useState<Set<number>>(new Set())
  const [selectedPattern, setSelectedPattern] = useState<string>('sound "bd sn"')

  const sendCommand = async (command: string) => {
    try {
      await fetch(`${apiUrl}/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command })
      })
    } catch (error) {
      console.error('Error sending command:', error)
    }
  }

  const hushAll = () => {
    sendCommand('hush')
    setActiveTracks(new Set())
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    }}>
      {/* Main Controls */}
      <div className="glass-strong" style={{
        padding: '24px 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        border: '1px solid rgba(125, 211, 216, 0.3)'
      }}>
        <h2 style={{ 
          color: 'var(--accent-cyan)', 
          fontSize: '28px',
          fontWeight: 300,
          letterSpacing: '1px',
          textShadow: '0 0 15px rgba(125, 211, 216, 0.4)'
        }}>
          🎛️ DJ Control Center
        </h2>
        <button
          onClick={hushAll}
          className="danger"
        >
          ⏹️ HUSH ALL
        </button>
      </div>

      {/* Instrument Library */}
      <InstrumentLibrary 
        onSelect={(pattern) => {
          // Populate the Pattern Builder with this pattern
          setSelectedPattern(pattern)
        }}
        onPlay={(pattern) => {
          // Quick play - auto-assign to first available track
          for (let i = 1; i <= 9; i++) {
            if (!activeTracks.has(i)) {
              sendCommand(`d${i} $ ${pattern}`)
              setActiveTracks(new Set([...activeTracks, i]))
              break
            }
          }
        }}
      />

      {/* Pattern Builder */}
      <PatternBuilder 
        onSend={sendCommand} 
        externalPattern={selectedPattern}
        onPatternChange={setSelectedPattern}
      />

      {/* Track Controls */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: '20px'
      }}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(trackNum => (
          <TrackControl
            key={trackNum}
            trackNum={trackNum}
            apiUrl={apiUrl}
            isActive={activeTracks.has(trackNum)}
            onActiveChange={(active) => {
              const newActive = new Set(activeTracks)
              if (active) {
                newActive.add(trackNum)
              } else {
                newActive.delete(trackNum)
              }
              setActiveTracks(newActive)
            }}
          />
        ))}
      </div>
    </div>
  )
}


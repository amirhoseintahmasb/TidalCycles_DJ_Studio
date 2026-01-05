'use client'

import { useState } from 'react'

interface InstrumentLibraryProps {
  onSelect: (pattern: string) => void
  onPlay?: (pattern: string) => void
}

export default function InstrumentLibrary({ onSelect, onPlay }: InstrumentLibraryProps) {
  const [selectedCategory, setSelectedCategory] = useState('drums')
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null)

  const instruments = {
    drums: [
      { name: 'Kick', pattern: 'sound "bd"', icon: '🥁' },
      { name: 'Snare', pattern: 'sound "sn"', icon: '🥁' },
      { name: 'Hi-Hat', pattern: 'sound "hh"', icon: '🥁' },
      { name: 'Kick Snare', pattern: 'sound "bd sn"', icon: '🥁' },
      { name: 'Full Beat', pattern: 'sound "bd sn bd sn"', icon: '🥁' },
      { name: 'Fast Hats', pattern: 'sound "hh*8"', icon: '🥁' },
      { name: 'Breakbeat', pattern: 'sound "bd ~ sn ~ bd sn ~ ~"', icon: '🥁' },
      { name: 'Drum Roll', pattern: 'sound "bd*4 sn*2 bd*2"', icon: '🥁' }
    ],
    bass: [
      { name: 'Deep Bass', pattern: 'sound "bass:1"', icon: '🎸' },
      { name: 'Bass Line', pattern: 'sound "bass:2 ~ bass:5 ~"', icon: '🎸' },
      { name: 'Sub Bass', pattern: 'sound "bass:0"', icon: '🎸' },
      { name: 'Bass Pattern', pattern: 'sound "bass:1 bass:3 bass:5 bass:3"', icon: '🎸' }
    ],
    melody: [
      { name: 'Arpeggio', pattern: 'sound "arpy:4 arpy:7 arpy:9 arpy:7"', icon: '🎹' },
      { name: 'Piano Notes', pattern: 'note "0 2 4 7" # sound "superpiano"', icon: '🎹' },
      { name: 'Major Scale', pattern: 'note (scale "major" "0 2 4 5 7") # sound "superpiano"', icon: '🎹' },
      { name: 'Minor Scale', pattern: 'note (scale "minor" "0 2 3 5 7") # sound "supersaw"', icon: '🎹' },
      { name: 'Pentatonic', pattern: 'note (scale "pentatonic" "0 1 2 3 4") # sound "superpiano"', icon: '🎹' },
      { name: 'Arpy Melody', pattern: 'sound "arpy:0 arpy:4 arpy:7 arpy:12"', icon: '🎹' }
    ],
    pads: [
      { name: 'Pad 1', pattern: 'slow 4 $ sound "pad"', icon: '🎛️' },
      { name: 'Pad 2', pattern: 'slow 2 $ sound "pad:2"', icon: '🎛️' },
      { name: 'Ambient', pattern: 'slow 8 $ sound "pad:3"', icon: '🎛️' },
      { name: 'Warm Pad', pattern: 'slow 4 $ sound "pad:1" # room 0.9', icon: '🎛️' }
    ],
    fx: [
      { name: 'Glitch', pattern: 'sound "glitch"', icon: '💫' },
      { name: 'Noise', pattern: 'sound "noise"', icon: '💫' },
      { name: 'Sweep', pattern: 'sound "sweep"', icon: '💫' },
      { name: 'Crash', pattern: 'sound "crash"', icon: '💫' }
    ],
    shapes: [
      { name: 'Triangle', pattern: 'sound "tri"', icon: '🔺' },
      { name: 'Square', pattern: 'sound "saw"', icon: '⬜' },
      { name: 'Sine', pattern: 'sound "sine"', icon: '🌊' },
      { name: 'Pulse', pattern: 'sound "pulse"', icon: '📊' }
    ]
  }

  const categories = Object.keys(instruments)

  const copyToClipboard = async (pattern: string, idx: number) => {
    try {
      await navigator.clipboard.writeText(pattern)
      setCopiedIdx(idx)
      setTimeout(() => setCopiedIdx(null), 1500)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className="glass-strong" style={{
      padding: '28px',
      border: '1px solid rgba(125, 211, 216, 0.3)'
    }}>
      <h2 style={{
        color: 'var(--accent-cyan)',
        marginBottom: '20px',
        fontSize: '28px',
        fontWeight: 300,
        letterSpacing: '1px',
        textShadow: '0 0 15px rgba(125, 211, 216, 0.4)'
      }}>
        🎵 Instrument Library
      </h2>

      {/* Category Tabs */}
      <div style={{
        display: 'flex',
        gap: '10px',
        marginBottom: '20px',
        flexWrap: 'wrap'
      }}>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={selectedCategory === cat ? "primary" : "secondary"}
            style={{
              textTransform: 'capitalize',
              padding: '12px 24px'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Instruments Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '15px'
      }}>
        {instruments[selectedCategory as keyof typeof instruments].map((inst, idx) => (
          <div
            key={idx}
            className="glass"
            style={{
              padding: '20px',
              border: '1px solid rgba(125, 216, 125, 0.2)',
              background: 'rgba(125, 216, 125, 0.05)',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <span style={{ fontSize: '24px' }}>{inst.icon}</span>
              <span style={{ fontWeight: 'bold', fontSize: '16px' }}>{inst.name}</span>
            </div>
            
            {/* Pattern display - clickable to copy */}
            <div 
              onClick={() => copyToClipboard(inst.pattern, idx)}
              style={{
                fontSize: '12px',
                color: 'var(--accent-green)',
                fontFamily: 'monospace',
                padding: '10px',
                background: 'rgba(0,0,0,0.3)',
                borderRadius: '4px',
                marginBottom: '12px',
                cursor: 'pointer',
                wordBreak: 'break-all',
                border: copiedIdx === idx ? '1px solid var(--accent-green)' : '1px solid transparent'
              }}
              title="Click to copy"
            >
              {copiedIdx === idx ? '✅ Copied!' : inst.pattern}
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => onSelect(inst.pattern)}
                style={{
                  flex: 1,
                  padding: '10px',
                  fontSize: '12px',
                  background: 'rgba(125, 211, 216, 0.2)',
                  border: '1px solid rgba(125, 211, 216, 0.4)',
                  borderRadius: '4px',
                  color: 'var(--accent-cyan)',
                  cursor: 'pointer'
                }}
              >
                📝 Edit
              </button>
              {onPlay && (
                <button
                  onClick={() => onPlay(inst.pattern)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    fontSize: '12px',
                    background: 'rgba(125, 216, 125, 0.3)',
                    border: '1px solid rgba(125, 216, 125, 0.5)',
                    borderRadius: '4px',
                    color: 'var(--accent-green)',
                    cursor: 'pointer'
                  }}
                >
                  ▶️ Play
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

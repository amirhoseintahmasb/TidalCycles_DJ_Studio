'use client'

interface EffectPanelProps {
  effects: {
    room: number
    delay: number
    gain: number
    speed: number
    pan: number
    cutoff: number
    resonance: number
  }
  onChange: (effects: any) => void
}

export default function EffectPanel({ effects, onChange }: EffectPanelProps) {
  const updateEffect = (key: string, value: number) => {
    onChange({ ...effects, [key]: value })
  }

  const sliders = [
    { key: 'room', label: 'Reverb', min: 0, max: 1, step: 0.1, value: effects.room },
    { key: 'delay', label: 'Delay', min: 0, max: 1, step: 0.1, value: effects.delay },
    { key: 'gain', label: 'Volume', min: 0, max: 2, step: 0.1, value: effects.gain },
    { key: 'speed', label: 'Speed', min: 0.5, max: 2, step: 0.1, value: effects.speed },
    { key: 'pan', label: 'Pan', min: -1, max: 1, step: 0.1, value: effects.pan },
    { key: 'cutoff', label: 'Cutoff', min: 0, max: 1, step: 0.1, value: effects.cutoff },
    { key: 'resonance', label: 'Resonance', min: 0, max: 1, step: 0.1, value: effects.resonance }
  ]

  return (
    <div className="glass" style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
      gap: '12px',
      padding: '16px',
      border: '1px solid rgba(255, 255, 255, 0.1)'
    }}>
      {sliders.map(slider => (
        <div key={slider.key} style={{ textAlign: 'center' }}>
          <label style={{
            display: 'block',
            fontSize: '11px',
            color: 'var(--text-secondary)',
            marginBottom: '5px'
          }}>
            {slider.label}
          </label>
          <input
            type="range"
            min={slider.min}
            max={slider.max}
            step={slider.step}
            value={slider.value}
            onChange={(e) => updateEffect(slider.key, parseFloat(e.target.value))}
            style={{ width: '100%' }}
          />
          <div style={{
            fontSize: '10px',
            color: 'var(--accent-green)',
            marginTop: '5px',
            fontFamily: 'monospace'
          }}>
            {slider.value.toFixed(1)}
          </div>
        </div>
      ))}
    </div>
  )
}


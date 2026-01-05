'use client'

export default function PromptGuide() {
  const examples = [
    {
      category: 'Drums',
      examples: [
        'd1 $ sound "bd sn bd sn"',
        'd1 $ sound "bd*2 sn ~ bd"',
        'd1 $ sound "bd ~ ~ bd ~ ~ bd ~"',
        'd1 $ sound "bd:2 sn:3 hh*8"'
      ]
    },
    {
      category: 'Melodies',
      examples: [
        'd2 $ sound "arpy:4 arpy:7 arpy:9 arpy:7"',
        'd2 $ note "0 2 4 7" # sound "superpiano"',
        'd2 $ note (scale "major" "0 2 4 5 7") # sound "superpiano"',
        'd2 $ note (scale "minor" "0 2 3 5 7") # sound "supersaw"'
      ]
    },
    {
      category: 'Effects',
      examples: [
        'd1 $ sound "bd" # room 0.5',
        'd1 $ sound "bd" # delay 0.5',
        'd1 $ sound "bd" # pan (slow 2 $ sine)',
        'd1 $ sound "bd" # gain 0.8'
      ]
    },
    {
      category: 'Patterns',
      examples: [
        'd1 $ sound "bd*2 ~ sn ~"',
        'd1 $ sound "bd sn bd sn" # speed 1.5',
        'd1 $ sound "bd ~ ~ bd" # room 0.9',
        'd1 $ sound "bd sn hh sn" # pan (slow 4 $ sine)'
      ]
    }
  ]

  return (
    <div className="glass-strong" style={{
      padding: '28px',
      border: '1px solid rgba(125, 211, 216, 0.3)',
      marginBottom: '20px'
    }}>
      <h2 style={{ 
        color: 'var(--accent-cyan)',
        marginBottom: '24px',
        fontSize: '28px',
        fontWeight: 300,
        letterSpacing: '1px',
        textShadow: '0 0 15px rgba(125, 211, 216, 0.4)'
      }}>
        📖 TidalCycles Prompt Guide
      </h2>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px'
      }}>
        {examples.map((category, idx) => (
          <div key={idx} className="glass" style={{
            padding: '20px',
            border: '1px solid rgba(125, 216, 125, 0.2)'
          }}>
            <h3 style={{
              color: 'var(--accent-green)',
              marginBottom: '14px',
              fontSize: '20px',
              fontWeight: 400,
              letterSpacing: '0.5px'
            }}>
              {category.category}
            </h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {category.examples.map((example, i) => (
                <li key={i} className="glass" style={{
                  padding: '12px',
                  marginBottom: '8px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontFamily: 'monospace',
                  color: 'var(--accent-green)',
                  wordBreak: 'break-all',
                  border: '1px solid rgba(125, 216, 125, 0.1)',
                  background: 'rgba(125, 216, 125, 0.05)'
                }}>
                  {example}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="glass" style={{
        marginTop: '24px',
        padding: '20px',
        border: '1px solid rgba(216, 216, 125, 0.3)',
        background: 'rgba(216, 216, 125, 0.05)'
      }}>
        <h3 style={{ 
          color: 'var(--accent-yellow)', 
          marginBottom: '14px',
          fontSize: '20px',
          fontWeight: 400
        }}>
          💡 Tips
        </h3>
        <ul style={{ 
          paddingLeft: '24px', 
          color: 'var(--text-secondary)',
          lineHeight: '1.8'
        }}>
          <li>Use <code style={{ 
            color: 'var(--accent-green)',
            background: 'rgba(125, 216, 125, 0.1)',
            padding: '2px 6px',
            borderRadius: '4px',
            fontFamily: 'monospace'
          }}>d1</code> through <code style={{ 
            color: 'var(--accent-green)',
            background: 'rgba(125, 216, 125, 0.1)',
            padding: '2px 6px',
            borderRadius: '4px',
            fontFamily: 'monospace'
          }}>d9</code> for different tracks</li>
          <li>Add <code style={{ 
            color: 'var(--accent-green)',
            background: 'rgba(125, 216, 125, 0.1)',
            padding: '2px 6px',
            borderRadius: '4px',
            fontFamily: 'monospace'
          }}># room 0.5</code> for reverb</li>
          <li>Use <code style={{ 
            color: 'var(--accent-green)',
            background: 'rgba(125, 216, 125, 0.1)',
            padding: '2px 6px',
            borderRadius: '4px',
            fontFamily: 'monospace'
          }}>~</code> for silence/rests</li>
          <li>Patterns like <code style={{ 
            color: 'var(--accent-green)',
            background: 'rgba(125, 216, 125, 0.1)',
            padding: '2px 6px',
            borderRadius: '4px',
            fontFamily: 'monospace'
          }}>"bd*2"</code> repeat sounds</li>
          <li>Use <code style={{ 
            color: 'var(--accent-green)',
            background: 'rgba(125, 216, 125, 0.1)',
            padding: '2px 6px',
            borderRadius: '4px',
            fontFamily: 'monospace'
          }}>hush</code> to stop all tracks</li>
        </ul>
      </div>
    </div>
  )
}


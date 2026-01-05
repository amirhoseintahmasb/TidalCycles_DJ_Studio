'use client'

interface ServiceStatusProps {
  status: any
}

export default function ServiceStatus({ status }: ServiceStatusProps) {
  if (!status) {
    return (
      <div className="glass" style={{
        padding: '24px',
        textAlign: 'center',
        border: '1px solid rgba(216, 125, 125, 0.3)'
      }}>
        ⚠️ Service not running. Start with: ./start-service.sh
      </div>
    )
  }

  const services = [
    { name: 'SuperCollider', key: 'supercollider' },
    { name: 'GHCi/TidalCycles', key: 'ghci' },
    { name: 'Command Monitor', key: 'monitor' },
    { name: 'Bridge Server', key: 'bridge' },
    { name: 'SuperDirt', key: 'superdirt' },
    { name: 'TidalCycles', key: 'tidal' }
  ]

  const allRunning = services.every(s => status[s.key])

  return (
    <div className="glass-strong" style={{
      padding: '24px',
      border: `1px solid ${allRunning ? 'rgba(125, 216, 125, 0.3)' : 'rgba(216, 216, 125, 0.3)'}`
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '15px'
      }}>
        {services.map(service => {
          const isRunning = status[service.key]
          return (
            <div
              key={service.key}
              className="glass"
              style={{
                padding: '16px',
                textAlign: 'center',
                border: `1px solid ${isRunning ? 'rgba(125, 216, 125, 0.3)' : 'rgba(216, 125, 125, 0.3)'}`,
                transition: 'all 0.3s'
              }}
            >
              <div style={{
                width: '14px',
                height: '14px',
                borderRadius: '50%',
                background: isRunning 
                  ? 'radial-gradient(circle, var(--accent-green), rgba(125, 216, 125, 0.3))' 
                  : 'radial-gradient(circle, var(--accent-red), rgba(216, 125, 125, 0.3))',
                display: 'inline-block',
                marginRight: '10px',
                boxShadow: isRunning 
                  ? '0 0 10px rgba(125, 216, 125, 0.5)' 
                  : '0 0 10px rgba(216, 125, 125, 0.3)'
              }} />
              <span style={{ 
                fontSize: '13px',
                color: 'var(--text-primary)',
                fontWeight: 500
              }}>
                {service.name}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}


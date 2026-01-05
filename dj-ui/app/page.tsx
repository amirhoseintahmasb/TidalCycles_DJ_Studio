'use client'

import { useState, useEffect } from 'react'
import DJStudio from '@/components/DJStudio'
import ServiceStatus from '@/components/ServiceStatus'
import PromptGuide from '@/components/PromptGuide'
import RecordingStudio from '@/components/RecordingStudio'

const API_URL = 'http://localhost:9000'

export default function Home() {
  const [serviceStatus, setServiceStatus] = useState<any>(null)
  const [showGuide, setShowGuide] = useState(false)
  const [activeTab, setActiveTab] = useState<'studio' | 'recording'>('studio')

  useEffect(() => {
    checkServiceStatus()
    const interval = setInterval(checkServiceStatus, 3000)
    return () => clearInterval(interval)
  }, [])

  const checkServiceStatus = async () => {
    try {
      const response = await fetch(`${API_URL}/status`)
      const status = await response.json()
      setServiceStatus(status)
    } catch (error) {
      console.error('Service not available:', error)
    }
  }

  const startServices = async () => {
    try {
      await fetch(`${API_URL}/start`)
      setTimeout(checkServiceStatus, 2000)
    } catch (error) {
      console.error('Error starting services:', error)
    }
  }

  return (
    <main style={{ minHeight: '100vh', padding: '20px', position: 'relative', zIndex: 1 }}>
      <div style={{ 
        maxWidth: '1800px', 
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        {/* Header */}
        <div className="glass-strong" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '24px 32px',
        }}>
          <h1 style={{ 
            color: 'var(--accent-cyan)',
            fontSize: '36px',
            fontFamily: 'inherit',
            fontWeight: 300,
            letterSpacing: '2px',
            textShadow: '0 0 20px rgba(125, 211, 216, 0.5)'
          }}>
            🎵 TidalCycles DJ Studio
          </h1>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => setShowGuide(!showGuide)}
              className="secondary"
            >
              {showGuide ? '❌ Hide Guide' : '📖 Show Guide'}
            </button>
            <button
              onClick={startServices}
              className="primary"
            >
              ▶️ Start Services
            </button>
          </div>
        </div>

        {/* Service Status */}
        <ServiceStatus status={serviceStatus} />

        {/* Prompt Guide */}
        {showGuide && <PromptGuide />}

        {/* Tab Navigation */}
        <div className="glass" style={{
          padding: '8px',
          display: 'flex',
          gap: '8px',
          marginBottom: '20px',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <button
            onClick={() => setActiveTab('studio')}
            className={activeTab === 'studio' ? 'primary' : 'secondary'}
            style={{ flex: 1, padding: '12px' }}
          >
            🎛️ DJ Studio
          </button>
          <button
            onClick={() => setActiveTab('recording')}
            className={activeTab === 'recording' ? 'primary' : 'secondary'}
            style={{ flex: 1, padding: '12px' }}
          >
            🎙️ Recording & Editing
          </button>
        </div>

        {/* Main Content */}
        {activeTab === 'studio' ? (
          <DJStudio apiUrl={API_URL} />
        ) : (
          <RecordingStudio apiUrl={API_URL} />
        )}
      </div>
    </main>
  )
}


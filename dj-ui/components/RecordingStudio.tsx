'use client'

import { useState, useEffect, useRef } from 'react'

interface RecordingStudioProps {
  apiUrl: string
}

export default function RecordingStudio({ apiUrl }: RecordingStudioProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [recordings, setRecordings] = useState<any[]>([])
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Load saved recordings
    const saved = localStorage.getItem('tidal-recordings')
    if (saved) {
      setRecordings(JSON.parse(saved))
    }
  }, [])

  const startRecording = async () => {
    try {
      // Try to get system audio (requires screen capture API)
      let stream: MediaStream
      
      try {
        // Request screen capture with audio (Chrome/Edge)
        stream = await (navigator.mediaDevices as any).getDisplayMedia({
          video: false,
          audio: {
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false,
            sampleRate: 44100
          }
        })
      } catch (err) {
        // Fallback to microphone (user can route system audio through virtual mic)
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false,
            sampleRate: 44100
          }
        })
      }

      // Create audio context for processing
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 44100
      })
      const source = audioContext.createMediaStreamSource(stream)
      const destination = audioContext.createMediaStreamDestination()
      source.connect(destination)

      streamRef.current = destination.stream
      
      // Try different MIME types for best compatibility
      let mimeType = 'audio/webm;codecs=opus'
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/webm'
      }
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/mp4'
      }
      
      const mediaRecorder = new MediaRecorder(destination.stream, {
        mimeType: mimeType
      })

      chunksRef.current = []
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        setAudioBlob(blob)
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)
        
        // Save recording
        const recording = {
          id: Date.now(),
          name: `Recording ${new Date().toLocaleString()}`,
          duration: recordingTime,
          blob: blob,
          url: url,
          timestamp: new Date().toISOString()
        }
        const updated = [...recordings, recording]
        setRecordings(updated)
        localStorage.setItem('tidal-recordings', JSON.stringify(updated.map(r => ({
          ...r,
          blob: null, // Don't store blob in localStorage
          url: null
        }))))
      }

      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start(1000) // Collect data every second
      setIsRecording(true)
      setRecordingTime(0)

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)

    } catch (error) {
      console.error('Error starting recording:', error)
      alert('Could not start recording. Please check microphone permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const downloadRecording = (recording: any) => {
    if (recording.blob) {
      const url = URL.createObjectURL(recording.blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${recording.name}.webm`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  return (
    <div className="glass-strong" style={{
      padding: '28px',
      border: '1px solid rgba(125, 211, 216, 0.3)'
    }}>
      <h2 style={{
        color: 'var(--accent-cyan)',
        marginBottom: '24px',
        fontSize: '28px',
        fontWeight: 300,
        letterSpacing: '1px',
        textShadow: '0 0 15px rgba(125, 211, 216, 0.4)'
      }}>
        🎙️ Recording Studio
      </h2>

      {/* Recording Controls */}
      <div className="glass" style={{
        padding: '24px',
        marginBottom: '24px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        textAlign: 'center'
      }}>
        <div style={{
          fontSize: '48px',
          fontFamily: 'monospace',
          color: isRecording ? 'var(--accent-red)' : 'var(--text-secondary)',
          marginBottom: '20px',
          fontWeight: 300
        }}>
          {formatTime(recordingTime)}
        </div>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          {!isRecording ? (
            <button
              onClick={startRecording}
              className="primary"
              style={{
                padding: '18px 36px',
                fontSize: '18px'
              }}
            >
              🔴 START RECORDING
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="danger"
              style={{
                padding: '18px 36px',
                fontSize: '18px'
              }}
            >
              ⏹️ STOP RECORDING
            </button>
          )}
        </div>

        {isRecording && (
          <div style={{
            marginTop: '20px',
            padding: '12px',
            background: 'rgba(216, 125, 125, 0.1)',
            borderRadius: '8px',
            border: '1px solid rgba(216, 125, 125, 0.3)',
            color: 'var(--accent-red)',
            fontSize: '14px'
          }}>
            ⚠️ Recording in progress... Make sure your audio output is audible
          </div>
        )}
      </div>

      {/* Recordings List */}
      {recordings.length > 0 && (
        <div>
          <h3 style={{
            color: 'var(--text-primary)',
            marginBottom: '16px',
            fontSize: '20px',
            fontWeight: 400
          }}>
            📼 Your Recordings
          </h3>
          <div style={{
            display: 'grid',
            gap: '12px'
          }}>
            {recordings.map((recording) => (
              <div
                key={recording.id}
                className="glass"
                style={{
                  padding: '16px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{
                    color: 'var(--text-primary)',
                    fontSize: '16px',
                    marginBottom: '4px'
                  }}>
                    {recording.name}
                  </div>
                  <div style={{
                    color: 'var(--text-secondary)',
                    fontSize: '12px'
                  }}>
                    {formatTime(recording.duration)} • {new Date(recording.timestamp).toLocaleString()}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => window.location.href = `/edit/${recording.id}`}
                    className="secondary"
                    style={{ padding: '10px 20px' }}
                  >
                    ✂️ Edit
                  </button>
                  <button
                    onClick={() => downloadRecording(recording)}
                    className="primary"
                    style={{ padding: '10px 20px' }}
                  >
                    ⬇️ Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info */}
      <div className="glass" style={{
        marginTop: '24px',
        padding: '16px',
        border: '1px solid rgba(125, 211, 216, 0.2)',
        background: 'rgba(125, 211, 216, 0.05)'
      }}>
        <div style={{
          color: 'var(--text-secondary)',
          fontSize: '13px',
          lineHeight: '1.6'
        }}>
          💡 <strong>Tip:</strong> Start recording before you begin your performance. 
          The recording will capture all audio output from your system. 
          Make sure your TidalCycles output is audible.
        </div>
      </div>
    </div>
  )
}


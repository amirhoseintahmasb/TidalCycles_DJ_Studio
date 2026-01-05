'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'

export default function EditPage() {
  const params = useParams()
  const recordingId = params.id
  const [recording, setRecording] = useState<any>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [trimStart, setTrimStart] = useState(0)
  const [trimEnd, setTrimEnd] = useState(0)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(1)
  const [fadeIn, setFadeIn] = useState(0)
  const [fadeOut, setFadeOut] = useState(0)
  const [speed, setSpeed] = useState(1)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    // Load recording from localStorage or API
    const saved = localStorage.getItem('tidal-recordings')
    if (saved) {
      const recordings = JSON.parse(saved)
      const found = recordings.find((r: any) => r.id === parseInt(recordingId as string))
      if (found) {
        setRecording(found)
        // Recreate blob URL if needed
        if (found.blob) {
          const url = URL.createObjectURL(found.blob)
          setAudioUrl(url)
        }
      }
    }
  }, [recordingId])

  useEffect(() => {
    if (audioRef.current && audioUrl) {
      audioRef.current.addEventListener('loadedmetadata', () => {
        setDuration(audioRef.current?.duration || 0)
        setTrimEnd(audioRef.current?.duration || 0)
      })
      audioRef.current.addEventListener('timeupdate', () => {
        setCurrentTime(audioRef.current?.currentTime || 0)
      })
      audioRef.current.addEventListener('ended', () => {
        setIsPlaying(false)
      })
    }
  }, [audioUrl])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
      audioRef.current.playbackRate = speed
    }
  }, [volume, speed])

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const seek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time
      setCurrentTime(time)
    }
  }

  const applyTrim = async () => {
    if (!audioUrl || !audioRef.current) return

    try {
      // Load audio
      const response = await fetch(audioUrl)
      const arrayBuffer = await response.arrayBuffer()
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)

      // Calculate trim points
      const startSample = Math.floor(trimStart * audioBuffer.sampleRate)
      const endSample = Math.floor(trimEnd * audioBuffer.sampleRate)
      const length = endSample - startSample

      // Create new buffer
      const newBuffer = audioContext.createBuffer(
        audioBuffer.numberOfChannels,
        length,
        audioBuffer.sampleRate
      )

      // Copy trimmed audio
      for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
        const oldData = audioBuffer.getChannelData(channel)
        const newData = newBuffer.getChannelData(channel)
        
        for (let i = 0; i < length; i++) {
          let sample = oldData[startSample + i]
          
          // Apply fade in
          if (i < fadeIn * audioBuffer.sampleRate) {
            const fadeProgress = i / (fadeIn * audioBuffer.sampleRate)
            sample *= fadeProgress
          }
          
          // Apply fade out
          if (i > length - fadeOut * audioBuffer.sampleRate) {
            const fadeProgress = (length - i) / (fadeOut * audioBuffer.sampleRate)
            sample *= fadeProgress
          }
          
          newData[i] = sample
        }
      }

      // Convert to WAV
      const wav = audioBufferToWav(newBuffer)
      const blob = new Blob([wav], { type: 'audio/wav' })
      const url = URL.createObjectURL(blob)
      
      setAudioUrl(url)
      if (audioRef.current) {
        audioRef.current.src = url
        audioRef.current.load()
      }
      
      setDuration(newBuffer.duration)
      setTrimStart(0)
      setTrimEnd(newBuffer.duration)
      setCurrentTime(0)
    } catch (error) {
      console.error('Error applying trim:', error)
      alert('Error processing audio. Please try again.')
    }
  }

  const audioBufferToWav = (buffer: AudioBuffer): ArrayBuffer => {
    const length = buffer.length
    const numberOfChannels = buffer.numberOfChannels
    const sampleRate = buffer.sampleRate
    const arrayBuffer = new ArrayBuffer(44 + length * numberOfChannels * 2)
    const view = new DataView(arrayBuffer)

    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i))
      }
    }

    writeString(0, 'RIFF')
    view.setUint32(4, 36 + length * numberOfChannels * 2, true)
    writeString(8, 'WAVE')
    writeString(12, 'fmt ')
    view.setUint32(16, 16, true)
    view.setUint16(20, 1, true)
    view.setUint16(22, numberOfChannels, true)
    view.setUint32(24, sampleRate, true)
    view.setUint32(28, sampleRate * numberOfChannels * 2, true)
    view.setUint16(32, numberOfChannels * 2, true)
    view.setUint16(34, 16, true)
    writeString(36, 'data')
    view.setUint32(40, length * numberOfChannels * 2, true)

    // Audio data
    let offset = 44
    for (let i = 0; i < length; i++) {
      for (let channel = 0; channel < numberOfChannels; channel++) {
        const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[i]))
        view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true)
        offset += 2
      }
    }

    return arrayBuffer
  }

  const download = () => {
    if (audioUrl) {
      const a = document.createElement('a')
      a.href = audioUrl
      a.download = `${recording?.name || 'edited'}.wav`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (!recording) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div className="glass" style={{ padding: '40px' }}>
          <h2 style={{ color: 'var(--accent-red)', marginBottom: '20px' }}>
            Recording not found
          </h2>
          <button
            onClick={() => window.location.href = '/'}
            className="primary"
          >
            ← Back to Studio
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', padding: '20px' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div className="glass-strong" style={{
          padding: '24px 32px',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          border: '1px solid rgba(125, 211, 216, 0.3)'
        }}>
          <h1 style={{
            color: 'var(--accent-cyan)',
            fontSize: '32px',
            fontWeight: 300,
            letterSpacing: '1px'
          }}>
            ✂️ Audio Editor
          </h1>
          <button
            onClick={() => window.location.href = '/'}
            className="secondary"
          >
            ← Back to Studio
          </button>
        </div>

        {/* Audio Player */}
        <div className="glass-strong" style={{
          padding: '28px',
          marginBottom: '24px',
          border: '1px solid rgba(125, 211, 216, 0.3)'
        }}>
          {audioUrl && (
            <audio
              ref={audioRef}
              src={audioUrl}
              style={{ display: 'none' }}
            />
          )}

          {/* Waveform Canvas */}
          <canvas
            ref={canvasRef}
            style={{
              width: '100%',
              height: '150px',
              background: 'rgba(0, 0, 0, 0.3)',
              borderRadius: '8px',
              marginBottom: '20px',
              cursor: 'pointer'
            }}
            onClick={(e) => {
              const rect = canvasRef.current?.getBoundingClientRect()
              if (rect) {
                const x = e.clientX - rect.left
                const percent = x / rect.width
                seek(percent * duration)
              }
            }}
          />

          {/* Playback Controls */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              marginBottom: '12px'
            }}>
              <button
                onClick={togglePlay}
                className={isPlaying ? "danger" : "primary"}
                style={{ padding: '12px 24px', fontSize: '16px' }}
              >
                {isPlaying ? '⏸️ Pause' : '▶️ Play'}
              </button>
              <div style={{
                color: 'var(--text-primary)',
                fontFamily: 'monospace',
                fontSize: '18px'
              }}>
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>

            {/* Progress Bar */}
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={(e) => seek(parseFloat(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>
        </div>

        {/* Editing Tools */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px',
          marginBottom: '24px'
        }}>
          {/* Trim Controls */}
          <div className="glass" style={{ padding: '24px' }}>
            <h3 style={{
              color: 'var(--accent-green)',
              marginBottom: '16px',
              fontSize: '20px',
              fontWeight: 400
            }}>
              ✂️ Trim
            </h3>
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                color: 'var(--text-secondary)',
                marginBottom: '8px',
                fontSize: '13px'
              }}>
                Start: {formatTime(trimStart)}
              </label>
              <input
                type="range"
                min={0}
                max={duration}
                step={0.1}
                value={trimStart}
                onChange={(e) => setTrimStart(parseFloat(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                color: 'var(--text-secondary)',
                marginBottom: '8px',
                fontSize: '13px'
              }}>
                End: {formatTime(trimEnd)}
              </label>
              <input
                type="range"
                min={0}
                max={duration}
                step={0.1}
                value={trimEnd}
                onChange={(e) => setTrimEnd(parseFloat(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>
            <button
              onClick={applyTrim}
              className="primary"
              style={{ width: '100%', padding: '12px' }}
            >
              Apply Trim
            </button>
          </div>

          {/* Fade Controls */}
          <div className="glass" style={{ padding: '24px' }}>
            <h3 style={{
              color: 'var(--accent-cyan)',
              marginBottom: '16px',
              fontSize: '20px',
              fontWeight: 400
            }}>
              🎚️ Fade
            </h3>
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                color: 'var(--text-secondary)',
                marginBottom: '8px',
                fontSize: '13px'
              }}>
                Fade In: {fadeIn.toFixed(1)}s
              </label>
              <input
                type="range"
                min={0}
                max={5}
                step={0.1}
                value={fadeIn}
                onChange={(e) => setFadeIn(parseFloat(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                color: 'var(--text-secondary)',
                marginBottom: '8px',
                fontSize: '13px'
              }}>
                Fade Out: {fadeOut.toFixed(1)}s
              </label>
              <input
                type="range"
                min={0}
                max={5}
                step={0.1}
                value={fadeOut}
                onChange={(e) => setFadeOut(parseFloat(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>
            <button
              onClick={applyTrim}
              className="primary"
              style={{ width: '100%', padding: '12px' }}
            >
              Apply Fade
            </button>
          </div>

          {/* Playback Controls */}
          <div className="glass" style={{ padding: '24px' }}>
            <h3 style={{
              color: 'var(--accent-purple)',
              marginBottom: '16px',
              fontSize: '20px',
              fontWeight: 400
            }}>
              🎛️ Playback
            </h3>
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                color: 'var(--text-secondary)',
                marginBottom: '8px',
                fontSize: '13px'
              }}>
                Volume: {Math.round(volume * 100)}%
              </label>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                color: 'var(--text-secondary)',
                marginBottom: '8px',
                fontSize: '13px'
              }}>
                Speed: {speed.toFixed(2)}x
              </label>
              <input
                type="range"
                min={0.5}
                max={2}
                step={0.01}
                value={speed}
                onChange={(e) => setSpeed(parseFloat(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>
          </div>
        </div>

        {/* Download */}
        <div className="glass-strong" style={{
          padding: '24px',
          textAlign: 'center',
          border: '1px solid rgba(125, 216, 125, 0.3)'
        }}>
          <button
            onClick={download}
            className="primary"
            style={{
              padding: '18px 48px',
              fontSize: '18px',
              fontWeight: 'bold'
            }}
          >
            ⬇️ Download Final Mix (WAV)
          </button>
          <div style={{
            marginTop: '16px',
            color: 'var(--text-secondary)',
            fontSize: '13px'
          }}>
            Your edited audio will be downloaded as a high-quality WAV file
          </div>
        </div>
      </div>
    </div>
  )
}


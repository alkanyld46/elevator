import React, { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { useNavigate } from 'react-router-dom'
import { Container, Card, Button, Alert } from 'react-bootstrap'
import { FiCamera, FiStopCircle, FiCheckCircle } from 'react-icons/fi'
import api from '../utils/api'
import './Scanner.css'

// Development-only logging
const isDev = process.env.NODE_ENV !== 'production'

export default function Scanner() {
  const [msg, setMsg] = useState('Point your camera at the QR code.')
  const [msgType, setMsgType] = useState('info')
  const [scanning, setScanning] = useState(false)
  const html5QrCodeRef = useRef(null)
  const startedRef = useRef(false)
  const initRef = useRef(false)
  const scannedRef = useRef(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (initRef.current) return
    initRef.current = true

    html5QrCodeRef.current = new Html5Qrcode('reader')
    const handler = () => stopScanner()
    window.addEventListener('forceStopScanner', handler)
    startScanner()

    return () => {
      window.removeEventListener('forceStopScanner', handler)
      stopScanner()
      sessionStorage.setItem('scanning', 'false')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const startScanner = async () => {
    if (!html5QrCodeRef.current || startedRef.current) return
    try {
      const cams = await Html5Qrcode.getCameras()
      if (!cams || cams.length === 0) {
        setMsg('No camera found. Please check your device settings.')
        setMsgType('warning')
        return
      }
      let camId = cams[0].id
      const backCam = cams.find(c => /back|rear|environment/i.test(c.label))
      if (backCam) camId = backCam.id
      await html5QrCodeRef.current.start(
        camId,
        { fps: 10, qrbox: 250 },
        onScanSuccess,
        () => { }
      )
      startedRef.current = true
      sessionStorage.setItem('scanning', 'true')
      setScanning(true)
      setMsg('Point your camera at the QR code.')
      setMsgType('info')
    } catch (e) {
      if (isDev) console.error('Scanner start error:', e)
      setMsg('Camera access denied. Please allow camera permissions.')
      setMsgType('danger')
    }
  }

  const stopScanner = async () => {
    if (html5QrCodeRef.current && startedRef.current) {
      try {
        await html5QrCodeRef.current.stop()
        await html5QrCodeRef.current.clear()
      } catch (e) {
        if (isDev) console.warn('Stop failed:', e)
        // Fallback: manually stop any active media tracks
        try {
          const video = document.querySelector('#reader video')
          video?.srcObject?.getTracks()?.forEach(t => t.stop())
          if (video) video.srcObject = null
          const reader = document.getElementById('reader')
          if (reader) {
            // Safe DOM clearing without innerHTML
            while (reader.firstChild) {
              reader.removeChild(reader.firstChild)
            }
          }
        } catch (err) {
          if (isDev) console.warn('Manual stop failed:', err)
        }
      }
      startedRef.current = false
      sessionStorage.setItem('scanning', 'false')
      setScanning(false)
    }
  }

  const onScanSuccess = async qrData => {
    if (scannedRef.current) return
    scannedRef.current = true

    await stopScanner()

    try {
      const res = await api.post('/records', { elevatorId: qrData })
      const recordId = res.data?._id
      const upload = window.confirm('Maintenance logged successfully! Would you like to add photos?')
      if (upload && recordId) {
        return navigate(`/upload/${recordId}`)
      }
      navigate('/tech')
    } catch (err) {
      scannedRef.current = false
      if (err.response?.status === 400) {
        alert(err.response.data?.msg || 'This elevator has already been maintained this month.')
        return navigate('/tech')
      }
      const retry = window.confirm('Invalid QR code. Would you like to try again?')
      if (!retry) return navigate('/tech')
      await startScanner()
    }
  }

  return (
    <Container className="py-4 fade-in">
      <div className="text-center mb-4">
        <h2 className="page-title">Scan Elevator QR</h2>
        <p className="page-subtitle">Position the QR code within the frame</p>
      </div>

      <Card className="card-modern mx-auto" style={{ maxWidth: 500 }}>
        <Card.Body className="p-4">
          {/* Scanner Container */}
          <div 
            id="reader" 
            className="scanner-container mb-4"
            style={{
              borderRadius: 12,
              overflow: 'hidden',
              background: '#000',
              minHeight: 300
            }}
          />

          {/* Status Message */}
          <Alert 
            variant={msgType} 
            className="alert-modern text-center mb-4"
          >
            {msgType === 'info' && <FiCamera className="me-2" />}
            {msgType === 'success' && <FiCheckCircle className="me-2" />}
            {msg}
          </Alert>

          {/* Control Buttons */}
          <div className="d-grid gap-2">
            {scanning ? (
              <Button 
                variant="outline-secondary" 
                size="lg"
                onClick={stopScanner}
                className="d-flex align-items-center justify-content-center"
              >
                <FiStopCircle className="me-2" />
                Stop Scanning
              </Button>
            ) : (
              <Button 
                className="btn-gradient-primary"
                size="lg"
                onClick={startScanner}
              >
                <FiCamera className="me-2" />
                Start Scanning
              </Button>
            )}
            <Button 
              variant="outline-secondary"
              onClick={() => navigate('/tech')}
            >
              Back to Home
            </Button>
          </div>
        </Card.Body>
      </Card>

      <div className="text-center mt-4 text-muted" style={{ fontSize: '0.875rem' }}>
        Tip: Make sure the QR code is well-lit and within the camera frame
      </div>
    </Container>
  )
}

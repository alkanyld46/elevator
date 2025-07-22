import React, { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import './Scanner.css'

export default function Scanner() {
  const [msg, setMsg] = useState('Point your camera at the QR code.')
  const html5QrCodeRef = useRef(null)
  const startedRef = useRef(false)
  const scannedRef = useRef(false)    // ← guard to prevent repeat scans
  const navigate = useNavigate()

  useEffect(() => {
    const html5Qr = new Html5Qrcode('reader')
    html5QrCodeRef.current = html5Qr

    Html5Qrcode.getCameras()
      .then(cams => {
        if (!cams || cams.length === 0) {
          setMsg('No camera found')
          return
        }
        return html5Qr
          .start(
            cams[0].id,
            { fps: 10, qrbox: 250 },
            qrData => onScanSuccess(qrData),
            () => { }
          )
          .then(() => { startedRef.current = true })
      })
      .catch(() => setMsg('Camera access denied'))

    return () => {
      if (html5QrCodeRef.current && startedRef.current) {
        html5QrCodeRef.current
          .stop()
          .then(() => html5QrCodeRef.current.clear())
          .catch(err => console.warn('Stop failed:', err))
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // fully stop and clear the scanner
  const stopScanner = async () => {
    if (html5QrCodeRef.current && startedRef.current) {
      try {
        await html5QrCodeRef.current.stop()
        await html5QrCodeRef.current.clear()
      } catch { }
      startedRef.current = false
    }
  }

  const onScanSuccess = async qrData => {
    // ignore duplicates
    if (scannedRef.current) return
    scannedRef.current = true

    // ensure scanner is stopped before proceeding
    await stopScanner()

    try {
      await api.post('/records', { elevatorId: qrData })
      alert('Maintenance logged!')
      navigate('/tech')
    } catch {
      // allow a retry
      scannedRef.current = false
      const retry = window.confirm('Invalid QR code. Try again?')
      if (!retry) {
        navigate('/tech')
      } else {
        // restart scanning
        const cams = await Html5Qrcode.getCameras()
        if (cams && cams[0]) {
          html5QrCodeRef.current
            .start(cams[0].id, { fps: 10, qrbox: 250 }, onScanSuccess)
            .then(() => { startedRef.current = true })
        }
      }
    }
  }

  return (
    <div className="scanner">
      <h2>Scan Elevator QR</h2>
      <div id="reader" />
      <p>{msg}</p>
    </div>
  )
}

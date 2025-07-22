import React, { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import './Scanner.css'

export default function Scanner() {
  const [msg, setMsg] = useState('Point your camera at the QR code.')
  const html5QrCodeRef = useRef(null)
  const startedRef = useRef(false)
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
        return html5Qr.start(
          cams[0].id,
          { fps: 10, qrbox: 250 },
          qrCodeMessage => onScanSuccess(qrCodeMessage),
          () => { }
        ).then(() => { startedRef.current = true })
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

  const stopScanner = () => {
    if (html5QrCodeRef.current && startedRef.current) {
      html5QrCodeRef.current.stop().catch(() => { })
      startedRef.current = false
    }
  }

  const onScanSuccess = async qrData => {
    stopScanner()

    try {
      await api.post('/records', { elevatorId: qrData })
      alert('Maintenance logged!')
      navigate('/tech')
    } catch {
      const retry = window.confirm('Invalid QR code. Try again?')
      if (!retry) navigate('/tech')
      else {
        // restart scanning
        const cams = await Html5Qrcode.getCameras()
        if (cams && cams[0]) {
          html5QrCodeRef.current
            .start(cams[0].id, { fps: 10, qrbox: 250 }, onScanSuccess)
            .then(() => (startedRef.current = true))
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

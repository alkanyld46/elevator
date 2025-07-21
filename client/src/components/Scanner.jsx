import React, { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import api from '../utils/api'

export default function Scanner() {
  const [msg, setMsg] = useState('Point your camera at the QR code.')
  const html5QrCodeRef = useRef(null)
  const startedRef = useRef(false)

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
          () => {}
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

  const onScanSuccess = async qrData => {
    try {
      // qrData should be qrCodeData (string) matching elevator.qrCodeData
      await api.post('/records', { elevatorId: qrData })
      setMsg('✅ Maintenance logged!')
    } catch {
      setMsg('❌ Logging failed.')
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Scan Elevator QR</h2>
      <div id="reader" style={{ width: '100%' }} />
      <p>{msg}</p>
    </div>
  )
}

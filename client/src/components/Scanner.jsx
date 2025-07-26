import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import './Scanner.css';

export default function Scanner() {
  const [msg, setMsg] = useState('Point your camera at the QR code.');
  const [scanning, setScanning] = useState(false);
  const html5QrCodeRef = useRef(null);
  const startedRef = useRef(false);
  const initRef = useRef(false);
  const scannedRef = useRef(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    html5QrCodeRef.current = new Html5Qrcode('reader');
    const handler = () => stopScanner();
    window.addEventListener('forceStopScanner', handler);
    startScanner();

    return () => {
      window.removeEventListener('forceStopScanner', handler);
      stopScanner();
      sessionStorage.setItem('scanning', 'false');

    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startScanner = async () => {
    if (!html5QrCodeRef.current || startedRef.current) return;
    try {
      const cams = await Html5Qrcode.getCameras();
      if (!cams || cams.length === 0) {
        setMsg('No camera found');
        return;
      }
      let camId = cams[0].id;
      const backCam = cams.find(c => /back|rear|environment/i.test(c.label));
      if (backCam) camId = backCam.id;
      await html5QrCodeRef.current.start(
        camId,
        { fps: 10, qrbox: 250 },
        onScanSuccess,
        () => { }
      );
      startedRef.current = true;
      sessionStorage.setItem('scanning', 'true');
      setScanning(true);
      setMsg('Point your camera at the QR code.');
    } catch (e) {
      console.error(e);
      setMsg('Camera access denied');
    }
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current && startedRef.current) {
      try {
        await html5QrCodeRef.current.stop();
        await html5QrCodeRef.current.clear(); // you can drop clear() if you prefer to keep the last frame
      } catch (e) {
        console.warn('Stop failed:', e);
        // Fallback: manually stop any active media tracks if the
        // library fails to release the camera. This prevents the
        // camera from staying open when navigating away.
        try {
          const video = document.querySelector('#reader video');
          video?.srcObject?.getTracks()?.forEach(t => t.stop());
          if (video) video.srcObject = null;
          const reader = document.getElementById('reader');
          if (reader) reader.innerHTML = '';
        } catch (err) {
          console.warn('Manual stop failed:', err);
        }
      }
      startedRef.current = false;
      sessionStorage.setItem('scanning', 'false');
      setScanning(false);
    }
  };

  const onScanSuccess = async qrData => {
    if (scannedRef.current) return;
    scannedRef.current = true;

    await stopScanner();

    try {
      const res = await api.post('/records', { elevatorId: qrData });
      const recordId = res.data?._id;
      const upload = window.confirm('Maintenance logged! Add photos?');
      if (upload && recordId) {
        return navigate(`/upload/${recordId}`);
      }
      navigate('/tech');
    } catch (err) {
      scannedRef.current = false;
      if (err.response?.status === 400) {
        alert(err.response.data?.msg || 'Already maintained this month');
        return navigate('/tech');
      }
      const retry = window.confirm('Invalid QR code. Try again?');
      if (!retry) return navigate('/tech');
      await startScanner();
    }
  };

  return (
    <div className="scanner">
      <h2>Scan Elevator QR</h2>

      {/* Always render the reader; don't use display:none */}
      <div id="reader" />

      <p>{msg}</p>

      {scanning ? (
        <button className="btn btn-secondary" onClick={stopScanner}>
          Stop scanning
        </button>
      ) : (
        <button className="btn btn-primary" onClick={startScanner}>
          Start scanning
        </button>
      )}
    </div>
  );
}

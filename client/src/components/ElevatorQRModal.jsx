import React, { useEffect, useRef, useState, useCallback } from 'react'
import { Modal, Button, Alert, Spinner } from 'react-bootstrap'
import { FiDownload } from 'react-icons/fi'
import QRCode from 'qrcode'
import { jsPDF } from 'jspdf'

export default function ElevatorQRModal({ show, onHide, elevator }) {
  const canvasRef = useRef(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [qrReady, setQrReady] = useState(false)

  const generateQRCode = useCallback(async () => {
    if (!canvasRef.current || !elevator?.qrCodeData) return
    
    try {
      setLoading(true)
      setError('')
      setQrReady(false)
      
      await QRCode.toCanvas(canvasRef.current, elevator.qrCodeData, {
        width: 250,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      })
      
      setQrReady(true)
    } catch (err) {
      console.error('QR generation error:', err)
      setError('Failed to generate QR code')
    } finally {
      setLoading(false)
    }
  }, [elevator?.qrCodeData])

  // Generate QR code when modal opens and elevator data is available
  useEffect(() => {
    if (show && elevator?.qrCodeData) {
      // Small delay to ensure canvas is mounted
      const timer = setTimeout(() => {
        generateQRCode()
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [show, elevator?.qrCodeData, generateQRCode])

  // Reset state when modal closes
  useEffect(() => {
    if (!show) {
      setQrReady(false)
      setLoading(true)
      setError('')
    }
  }, [show])

  const handleDownloadPDF = async () => {
    if (!elevator || !canvasRef.current || !qrReady) return

    try {
      // Create PDF document
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })

      // Get page dimensions
      const pageWidth = pdf.internal.pageSize.getWidth()
      
      // Add title
      pdf.setFontSize(20)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Elevator QR Code', pageWidth / 2, 30, { align: 'center' })

      // Add elevator details
      pdf.setFontSize(14)
      pdf.setFont('helvetica', 'normal')
      pdf.text(`Name: ${elevator.name}`, pageWidth / 2, 45, { align: 'center' })
      pdf.text(`Location: ${elevator.location}`, pageWidth / 2, 55, { align: 'center' })

      // Add QR code image from canvas
      const qrDataUrl = canvasRef.current.toDataURL('image/png')
      const qrSize = 80
      const qrX = (pageWidth - qrSize) / 2
      pdf.addImage(qrDataUrl, 'PNG', qrX, 70, qrSize, qrSize)

      // Add QR code data text below QR code
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'normal')
      pdf.text(`QR Code: ${elevator.qrCodeData}`, pageWidth / 2, 160, { align: 'center' })

      // Add footer
      pdf.setFontSize(8)
      pdf.setTextColor(128)
      const generatedDate = new Date().toLocaleString()
      pdf.text(`Generated: ${generatedDate}`, pageWidth / 2, 280, { align: 'center' })

      // Download the PDF
      const fileName = `elevator-qr-${elevator.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.pdf`
      pdf.save(fileName)
    } catch (err) {
      console.error('PDF generation error:', err)
      setError('Failed to generate PDF')
    }
  }

  if (!elevator) return null

  return (
    <Modal show={show} onHide={onHide} centered className="modal-modern">
      <Modal.Header closeButton>
        <Modal.Title>Elevator QR Code</Modal.Title>
      </Modal.Header>
      <Modal.Body className="text-center">
        {error && (
          <Alert variant="danger" dismissible onClose={() => setError('')} className="mb-3">
            {error}
          </Alert>
        )}

        <div className="mb-3">
          <h5 className="fw-semibold mb-1">{elevator.name}</h5>
          <p className="text-muted mb-0">{elevator.location}</p>
        </div>

        <div className="d-flex justify-content-center align-items-center mb-3" style={{ minHeight: 270, position: 'relative' }}>
          {loading && (
            <div className="d-flex align-items-center justify-content-center" style={{ position: 'absolute', width: 250, height: 250 }}>
              <Spinner animation="border" variant="primary" />
            </div>
          )}
          <canvas 
            ref={canvasRef} 
            style={{ 
              border: '1px solid #dee2e6', 
              borderRadius: '8px',
              padding: '10px',
              background: '#fff',
              opacity: qrReady ? 1 : 0
            }} 
          />
        </div>

        <div className="mb-3">
          <code className="bg-light px-3 py-2 rounded d-inline-block" style={{ fontSize: '0.85rem' }}>
            {elevator.qrCodeData}
          </code>
        </div>

        <Button 
          variant="primary"
          className="btn-gradient-primary"
          onClick={handleDownloadPDF}
          disabled={!qrReady}
        >
          <FiDownload className="me-2" />
          Download PDF
        </Button>

        <p className="text-muted small mt-3 mb-0">
          Print this QR code and place it on the elevator for technicians to scan.
        </p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

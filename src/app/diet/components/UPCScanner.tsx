'use client'
import { useEffect, useRef } from 'react'
import Quagga from 'quagga'

type UPCScannerProps = {
  onScan: (result: { upc: string }) => void
  onClose: () => void
  onError?: (error: string) => void
}

export default function UPCScanner({ onScan, onClose, onError }: UPCScannerProps) {
  const scannerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!scannerRef.current) return

    Quagga.init(
      {
        inputStream: {
          type: 'LiveStream',
          target: scannerRef.current,
          constraints: {
            facingMode: 'environment' // Use rear camera
          }
        },
        decoder: {
          readers: ['ean_reader', 'upc_reader', 'upc_e_reader']
        }
      },
      (err) => {
        if (err) {
          console.error('Quagga init error:', err)
          onError?.('Camera initialization failed')
          return
        }
        Quagga.start()
      }
    )

    Quagga.onDetected((data) => {
      if (data.codeResult?.code) {
        onScan({ upc: data.codeResult.code })
        Quagga.stop()
        onClose()
      }
    })

    return () => {
      Quagga.stop()
    }
  }, [onScan, onClose, onError])

  return (
    <div>
      <div ref={scannerRef} style={{ width: '100%', height: '300px', border: '2px solid black' }} />
      <button
        onClick={() => {
          Quagga.stop()
          onClose()
        }}
        className="mt-4 bg-red-500 text-white px-4 py-2 rounded w-full"
      >
        Close Scanner
      </button>
    </div>
  )
}

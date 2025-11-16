// src/components/BarcodeScanner.jsx
import { useState } from 'react'
import BarcodeScannerComponent from 'react-qr-barcode-scanner'

export default function BarcodeScanner({ onDetected }) {
  const [error, setError] = useState('')

  return (
    <div className="space-y-4">
      {error && (
        <p className="text-sm text-red-400 bg-red-950/50 border border-red-800/50 rounded-lg p-2">
          {error}
        </p>
      )}

      <div className="flex items-center justify-center">
        <div className="bg-slate-900/60 rounded-lg border border-slate-800/50 p-3">
          <BarcodeScannerComponent
            width={320}
            height={320}
            onUpdate={(err, result) => {
              if (err) setError(err.message)
              if (result) {
                onDetected(result.text)
              }
            }}
          />
        </div>
      </div>

      <p className="text-xs text-slate-400 text-center">
        Align the barcode within the frame.
      </p>
    </div>
  )
}

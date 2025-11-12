import { useState } from 'react'
import BarcodeScannerComponent from 'react-qr-barcode-scanner'

export default function BarcodeScanner({ onDetected }) {
  const [error, setError] = useState('')

  return (
    <div className="space-y-3">
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <BarcodeScannerComponent
        width={300}
        height={300}
        onUpdate={(err, result) => {
          if (err) setError(err.message)
          if (result) {
            onDetected(result.text)
          }
        }}
      />
      <p className="text-xs text-gray-500">Align the barcode within the frame.</p>
    </div>
  )
}

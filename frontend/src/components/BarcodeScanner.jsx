// src/components/BarcodeScanner.jsx
import { useState } from 'react';
import BarcodeScannerComponent from 'react-qr-barcode-scanner';

export default function BarcodeScanner({ onDetected }) {
  const [error, setError] = useState('');

  return (
    <div className="space-y-4">
      {error && (
        <p className="text-sm text-red-400 bg-red-950/50 border border-red-800/50 rounded-lg p-2">
          {error}
        </p>
      )}

      <div className="flex items-center justify-center overflow-hidden rounded-lg border border-slate-700">
        <BarcodeScannerComponent
          width="100%"
          height={300}
          onUpdate={(err, result) => {
            if (result) {
              onDetected(result.text);
            } else if (err) {
              // Only set error if it's a real permission issue, not just "no code found"
              if (err.name === 'NotAllowedError') setError("Camera access denied.");
            }
          }}
        />
      </div>

      <p className="text-xs text-slate-400 text-center animate-pulse">
        Searching for barcode...
      </p>
    </div>
  );
}
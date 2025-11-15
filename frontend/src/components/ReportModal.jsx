// src/components/ReportModal.jsx
import React, { useState } from 'react'
import { exportActivitiesCSV, exportActivitiesPDF } from '../utils/exporters.js'

export default function ReportModal({ open, onClose, activities }) {
  const [format, setFormat] = useState('csv') // 'csv' or 'pdf'
  const [includeDetails, setIncludeDetails] = useState(false)
  const [includeOptional, setIncludeOptional] = useState(false)
  const [groupByDay, setGroupByDay] = useState(true)

  if (!open) return null

  const onGenerate = async () => {
    try {
      if (format === 'csv') {
        exportActivitiesCSV(activities, { includeDetails, includeOptional })
      } else {
        await exportActivitiesPDF(activities, { includeDetails, groupByDay })
      }
    } catch (e) {
      console.error('Export failed', e)
      alert('Export failed: ' + (e?.message || 'unknown'))
    } finally {
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black opacity-30" onClick={onClose}></div>
      <div className="relative bg-white rounded-lg p-4 w-full max-w-md shadow-lg">
        <h3 className="text-lg font-medium mb-3">Generate Activity Report</h3>

        <div className="mb-3">
          <label className="block text-sm text-gray-600 mb-1">Format</label>
          <div className="flex gap-2">
            <button className={`px-3 py-1 rounded border ${format==='csv' ? 'bg-indigo-50' : ''}`} onClick={() => setFormat('csv')}>CSV</button>
            <button className={`px-3 py-1 rounded border ${format==='pdf' ? 'bg-indigo-50' : ''}`} onClick={() => setFormat('pdf')}>PDF</button>
          </div>
        </div>

        <div className="mb-3">
          <label className="text-sm text-gray-600">Options</label>
          <div className="mt-1 space-y-2">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={includeDetails} onChange={(e) => setIncludeDetails(e.target.checked)} />
              Include full details JSON
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={includeOptional} onChange={(e) => setIncludeOptional(e.target.checked)} />
              Include optional columns (source, notes)
            </label>
            {format === 'pdf' && (
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={groupByDay} onChange={(e) => setGroupByDay(e.target.checked)} />
                Group by day (PDF)
              </label>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 mt-4">
          <button className="px-3 py-1 rounded border" onClick={onClose}>Cancel</button>
          <button className="px-3 py-1 rounded bg-indigo-600 text-white" onClick={onGenerate}>Generate & Download</button>
        </div>
      </div>
    </div>
  )
}


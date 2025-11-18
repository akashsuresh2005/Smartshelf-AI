// src/components/ReportModal.jsx
import React, { useState } from 'react'
import { exportActivitiesCSV, exportActivitiesPDF } from '../utils/exporters.js'

export default function ReportModal({ open, onClose, activities = [] }) {
  const [format, setFormat] = useState('csv') // 'csv' or 'pdf'
  const [includeDetails, setIncludeDetails] = useState(false)
  const [includeOptional, setIncludeOptional] = useState(false)
  const [groupByDay, setGroupByDay] = useState(true)
  const [generating, setGenerating] = useState(false)
  const hasData = activities && activities.length > 0

  if (!open) return null

  const onGenerate = async () => {
    if (!hasData || generating) return
    setGenerating(true)
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
      setGenerating(false)
      onClose()
    }
  }

  const btnBase = 'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors'
  const chipBase =
    'px-3 py-1 rounded-lg border border-slate-700/50 bg-slate-800/60 text-slate-200 hover:bg-slate-700/60'
  const chipActive = 'ring-1 ring-cyan-500/50 bg-slate-700/60'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close report modal"
      />
      <div className="relative w-full max-w-md bg-slate-900/70 border border-slate-800/50 rounded-xl shadow-xl p-5">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-xl font-semibold text-cyan-400">Generate Activity Report</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {!hasData && (
          <div className="mb-3 rounded-lg p-3 text-sm bg-yellow-900/30 text-yellow-300 border border-yellow-800/50">
            No activities available to export.
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm text-slate-400 mb-2">Format</label>
          <div className="flex gap-2">
            <button
              className={`${chipBase} ${format === 'csv' ? chipActive : ''}`}
              onClick={() => setFormat('csv')}
            >
              CSV
            </button>
            <button
              className={`${chipBase} ${format === 'pdf' ? chipActive : ''}`}
              onClick={() => setFormat('pdf')}
            >
              PDF
            </button>
          </div>
        </div>

        <div className="mb-2">
          <label className="text-sm text-slate-400">Options</label>
          <div className="mt-2 space-y-2">
            <label className="flex items-center gap-2 text-sm text-slate-200">
              <input
                type="checkbox"
                checked={includeDetails}
                onChange={(e) => setIncludeDetails(e.target.checked)}
              />
              Include full details JSON
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-200">
              <input
                type="checkbox"
                checked={includeOptional}
                onChange={(e) => setIncludeOptional(e.target.checked)}
              />
              Include optional columns (source, notes)
            </label>
            {format === 'pdf' && (
              <label className="flex items-center gap-2 text-sm text-slate-200">
                <input
                  type="checkbox"
                  checked={groupByDay}
                  onChange={(e) => setGroupByDay(e.target.checked)}
                />
                Group by day (PDF)
              </label>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 mt-5">
          <button
            className={`${btnBase} border border-slate-700/50 bg-slate-800/60 text-slate-200 hover:bg-slate-700/60`}
            onClick={onClose}
            disabled={generating}
          >
            Cancel
          </button>
          <button
            className={`${btnBase} bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-60`}
            onClick={onGenerate}
            disabled={!hasData || generating}
          >
            {generating ? 'Generating…' : 'Generate & Download'}
          </button>
        </div>
      </div>
    </div>
  )
}

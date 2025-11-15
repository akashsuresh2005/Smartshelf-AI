// src/utils/exporters.js
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

/**
 * Prepare a flat row object for CSV/PDF from an activity object.
 * Ensure order: activityId, createdAt, createdAt_local, userId, userName, type, verb, emoji, itemName, expiryDate, brief, details, source, notes
 */
function flattenActivity(a) {
  const createdAt = a.createdAt || a.created_at || a.timestamp || ''
  const createdAtLocal = createdAt ? new Date(createdAt).toLocaleString() : ''
  const activityId = a._id || a.id || ''
  const userId = a.userId || a.user_id || ''
  const userName = a.userName || a.user || a.meta?.userName || 'System'
  const type = a.type || ''
  const verb = a.verb || ''
  const emoji = a.emoji || ''
  const itemName = a.itemName || (a.details && (a.details.item?.name || a.details.itemName)) || ''
  const expiryDateRaw = a.expiryDate || (a.details && (a.details.item?.expiryDate || a.details.expiryDate)) || ''
  const expiryDate = expiryDateRaw ? (new Date(expiryDateRaw)).toISOString() : ''
  const brief = a.brief || a.message || ''
  const details = a.details ? JSON.stringify(a.details) : (a.meta ? JSON.stringify(a.meta) : '')
  const source = a.meta?.source || a.source || ''
  const notes = a.meta?.notes || a.notes || ''
  return { activityId, createdAt, createdAtLocal, userId, userName, type, verb, emoji, itemName, expiryDate, brief, details, source, notes }
}

/* CSV helpers */
function quoteCell(v) {
  if (v === null || v === undefined) return ''
  const s = typeof v === 'string' ? v : String(v)
  // escape double quotes
  return `"${s.replace(/"/g, '""')}"`
}

export function exportActivitiesCSV(items = [], opts = { includeDetails: false }) {
  if (!Array.isArray(items) || items.length === 0) {
    alert('No activities to export')
    return
  }

  // warn for huge exports
  if (items.length > 5000) {
    if (!confirm(`You are exporting ${items.length} rows, this may take a while. Continue?`)) return
  }

  const cols = [
    'activityId','createdAt','createdAtLocal','userId','userName','type','verb','emoji','itemName','expiryDate','brief'
  ]
  if (opts.includeDetails) cols.push('details')
  // optional columns
  if (opts.includeOptional) {
    if (!cols.includes('source')) cols.push('source')
    if (!cols.includes('notes')) cols.push('notes')
  }

  const rows = items.map(flattenActivity)

  // CSV header
  const header = cols.map(c => quoteCell(c)).join(',')

  // CSV body
  const body = rows.map(r => cols.map(c => quoteCell(r[c])).join(',')).join('\n')

  const csv = header + '\n' + body
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  const from = (items[items.length-1]?.createdAt || '').slice(0,10) || new Date().toISOString().slice(0,10)
  const to = (items[0]?.createdAt || '').slice(0,10) || new Date().toISOString().slice(0,10)
  a.download = `activities_${from}_${to}.csv`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

/* PDF export — simple print-style, grouped if desired */
export async function exportActivitiesPDF(items = [], opts = { includeDetails: false, groupByDay: true }) {
  if (!Array.isArray(items) || items.length === 0) {
    alert('No activities to export')
    return
  }

  if (items.length > 2000) {
    if (!confirm(`You are exporting ${items.length} rows to PDF — this may be slow and produce a large file. Continue?`)) return
  }

  // Build a temporary container with simple HTML for rendering
  const container = document.createElement('div')
  container.style.position = 'fixed'
  container.style.left = '-9999px'
  container.style.width = '900px'
  container.style.padding = '24px'
  container.style.fontFamily = 'Arial, Helvetica, sans-serif'
  container.style.fontSize = '12px'
  container.style.color = '#222'
  container.style.background = '#fff'

  const title = document.createElement('h2')
  title.style.margin = '0 0 12px 0'
  title.innerText = `Activity Report — ${new Date().toLocaleString()}`
  container.appendChild(title)

  // optional grouping by day
  const groups = {}
  for (const a of items) {
    const d = a.createdAt ? new Date(a.createdAt).toISOString().slice(0,10) : (new Date().toISOString().slice(0,10))
    groups[d] = groups[d] || []
    groups[d].push(a)
  }
  const groupKeys = Object.keys(groups).sort((a,b)=> b.localeCompare(a)) // newest first

  for (const gk of groupKeys) {
    const header = document.createElement('div')
    header.style.margin = '12px 0 6px 0'
    header.style.fontWeight = '700'
    header.innerText = (new Date(gk + 'T00:00:00Z')).toLocaleDateString() // e.g., 15 Nov 2025
    container.appendChild(header)

    for (const a of groups[gk]) {
      const r = flattenActivity(a)
      const row = document.createElement('div')
      row.style.marginBottom = '8px'
      row.innerHTML = `<div><strong>${r.createdAtLocal}</strong> — <strong>${escapeHtml(r.userName)}</strong> — ${r.emoji || ''} ${escapeHtml(r.verb || r.type || '')}${r.itemName ? ` — ${escapeHtml(r.itemName)}` : ''}</div>
        <div style="color:#555;margin-top:2px">${escapeHtml(r.brief)}</div>`
      container.appendChild(row)
      if (opts.includeDetails && r.details) {
        const det = document.createElement('pre')
        det.style.background = '#f8f8f8'
        det.style.padding = '8px'
        det.style.borderRadius = '6px'
        det.style.overflowX = 'auto'
        det.style.maxHeight = '160px'
        det.style.fontSize = '11px'
        det.innerText = typeof r.details === 'string' ? r.details : JSON.stringify(r.details, null, 2)
        container.appendChild(det)
      }
    }
  }

  document.body.appendChild(container)

  const canvas = await html2canvas(container, { scale: 2, useCORS: true })
  const imgData = canvas.toDataURL('image/png')
  const pdf = new jsPDF({ unit: 'pt', format: 'a4' })
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  // scale to page width with margin
  const margin = 40
  const usableW = pageWidth - margin * 2
  const imgProps = pdf.getImageProperties(imgData)
  const ratio = usableW / imgProps.width
  const imgW = imgProps.width * ratio
  const imgH = imgProps.height * ratio

  // if height fits one page
  if (imgH <= pageHeight - margin * 2) {
    pdf.addImage(imgData, 'PNG', margin, margin, imgW, imgH)
  } else {
    // simple pagination: draw into pdf and add new pages slicing the canvas vertically
    const pageCanvas = document.createElement('canvas')
    pageCanvas.width = canvas.width
    pageCanvas.height = Math.floor((pageHeight - margin * 2) / ratio)
    const ctx = pageCanvas.getContext('2d')

    let y = 0
    while (y < canvas.height) {
      ctx.clearRect(0, 0, pageCanvas.width, pageCanvas.height)
      ctx.drawImage(canvas, 0, y, canvas.width, pageCanvas.height, 0, 0, pageCanvas.width, pageCanvas.height)
      const pageData = pageCanvas.toDataURL('image/png')
      if (y > 0) pdf.addPage()
      pdf.addImage(pageData, 'PNG', margin, margin, imgW, (pageCanvas.height * ratio))
      y += pageCanvas.height
    }
  }

  const from = items[items.length-1]?.createdAt?.slice(0,10) || new Date().toISOString().slice(0,10)
  const to = items[0]?.createdAt?.slice(0,10) || new Date().toISOString().slice(0,10)
  pdf.save(`activities_${from}_${to}.pdf`)

  // cleanup
  document.body.removeChild(container)
}

/* small helper */
function escapeHtml(s='') {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

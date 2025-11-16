// src/components/SwipeableRow.jsx
import { useRef, useState } from 'react'

/**
 * SwipeableRow
 * - Swipe left to trigger onDelete, right to trigger onEdit
 * - Works with touch and mouse via Pointer Events
 * - Shows contextual affordances and supports keyboard (ArrowLeft/ArrowRight + Enter)
 */
export default function SwipeableRow({
  children,
  onDelete,
  onEdit,
  threshold = 72,
  maxSwipe = 140,
  editLabel = 'Edit',
  deleteLabel = 'Delete'
}) {
  const ref = useRef(null)
  const [dx, setDx] = useState(0)
  const [startX, setStartX] = useState(null)
  const [dragging, setDragging] = useState(false)

  const clamp = (v, min, max) => Math.min(max, Math.max(min, v))

  const onPointerDown = (e) => {
    // Only primary pointer
    if (e.isPrimary === false) return
    setStartX(e.clientX)
    setDragging(true)
    ref.current?.setPointerCapture?.(e.pointerId)
  }

  const onPointerMove = (e) => {
    if (startX == null) return
    const delta = e.clientX - startX
    // Rubber-banding feel near edges
    const band = Math.abs(delta) > maxSwipe ? (delta > 0 ? maxSwipe : -maxSwipe) : delta
    setDx(band)
  }

  const finish = (commit) => {
    if (commit === 'left' && onDelete) onDelete()
    if (commit === 'right' && onEdit) onEdit()
    setDx(0)
    setStartX(null)
    setDragging(false)
  }

  const onPointerUp = () => {
    if (dx < -threshold) finish('left')
    else if (dx > threshold) finish('right')
    else finish(null)
  }

  // Keyboard support: Arrow keys to arm, Enter to commit
  const [armed, setArmed] = useState(null) // 'left' | 'right' | null
  const onKeyDown = (e) => {
    if (e.key === 'ArrowLeft') {
      setArmed('left')
      setDx(-threshold - 1) // visual hint
      e.preventDefault()
    } else if (e.key === 'ArrowRight') {
      setArmed('right')
      setDx(threshold + 1)
      e.preventDefault()
    } else if (e.key === 'Enter') {
      if (armed === 'left') finish('left')
      else if (armed === 'right') finish('right')
    } else if (e.key === 'Escape') {
      setArmed(null)
      setDx(0)
    }
  }

  const translateX = clamp(dx, -maxSwipe, maxSwipe)
  const opacityLeft = clamp(Math.abs(translateX) / maxSwipe, 0, 1)
  const opacityRight = opacityLeft

  return (
    <div
      className="relative select-none"
      style={{ touchAction: 'pan-y' }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onKeyDown={onKeyDown}
      tabIndex={0}
      aria-label="Swipeable row"
    >
      {/* Action backgrounds */}
      <div className="absolute inset-0 pointer-events-none flex">
        {/* Right-swipe: Edit */}
        <div
          className="flex-1 flex items-center pl-3 bg-green-900/25 border border-transparent rounded-lg mr-1"
          style={{ opacity: translateX > 0 ? opacityRight : 0 }}
          aria-hidden="true"
        >
          <span className="text-green-300 text-xs px-2 py-1 rounded border border-green-800/50 bg-green-900/30">
            {editLabel}
          </span>
        </div>
        {/* Left-swipe: Delete */}
        <div
          className="flex-1 flex items-center justify-end pr-3 bg-red-900/25 border border-transparent rounded-lg ml-1"
          style={{ opacity: translateX < 0 ? opacityLeft : 0 }}
          aria-hidden="true"
        >
          <span className="text-red-300 text-xs px-2 py-1 rounded border border-red-800/50 bg-red-900/30">
            {deleteLabel}
          </span>
        </div>
      </div>

      {/* Foreground content */}
      <div
        className="relative bg-slate-900/60 rounded-lg border border-slate-800/50"
        style={{
          transform: `translateX(${translateX}px)`,
          transition: dragging ? 'none' : 'transform 160ms ease'
        }}
      >
        {children}
      </div>
    </div>
  )
}

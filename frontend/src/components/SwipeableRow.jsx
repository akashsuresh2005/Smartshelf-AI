// import { useRef, useState } from 'react'

// export default function SwipeableRow({ children, onDelete, onEdit }) {
//   const ref = useRef(null)
//   const [dx, setDx] = useState(0)
//   const [startX, setStartX] = useState(null)

//   const threshold = 60

//   const onTouchStart = (e) => setStartX(e.touches[0].clientX)
//   const onTouchMove = (e) => {
//     if (startX == null) return
//     const delta = e.touches[0].clientX - startX
//     setDx(delta)
//   }
//   const onTouchEnd = () => {
//     if (dx < -threshold) {
//       onDelete?.()
//     } else if (dx > threshold) {
//       onEdit?.()
//     }
//     setDx(0); setStartX(null)
//   }

//   return (
//     <div
//       ref={ref}
//       className="relative"
//       onTouchStart={onTouchStart}
//       onTouchMove={onTouchMove}
//       onTouchEnd={onTouchEnd}
//       style={{ transform: `translateX(${dx}px)`, transition: startX ? 'none' : 'transform 160ms ease' }}
//     >
//       {children}
//       {/* hint bars */}
//       <div className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-green-200 rounded-l"></div>
//       <div className="pointer-events-none absolute inset-y-0 right-0 w-1 bg-red-200 rounded-r"></div>
//     </div>
//   )
// }
import { useRef, useState } from 'react'

export default function SwipeableRow({ children, onDelete, onEdit }) {
  const ref = useRef(null)
  const [dx, setDx] = useState(0)
  const [startX, setStartX] = useState(null)

  const threshold = 60

  const onTouchStart = (e) => setStartX(e.touches[0].clientX)
  const onTouchMove = (e) => {
    if (startX == null) return
    const delta = e.touches[0].clientX - startX
    setDx(delta)
  }
  const onTouchEnd = () => {
    if (dx < -threshold) {
      onDelete?.()
    } else if (dx > threshold) {
      onEdit?.()
    }
    setDx(0); setStartX(null)
  }

  return (
    <div
      ref={ref}
      className="relative"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      style={{ transform: `translateX(${dx}px)`, transition: startX ? 'none' : 'transform 160ms ease' }}
    >
      {children}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-green-200 rounded-l"></div>
      <div className="pointer-events-none absolute inset-y-0 right-0 w-1 bg-red-200 rounded-r"></div>
    </div>
  )
}

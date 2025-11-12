export const defaultOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: { usePointStyle: true }
    },
    tooltip: {
      mode: 'index',
      intersect: false
    }
  },
  scales: {
    x: { grid: { display: false } },
    y: { grid: { color: 'rgba(0,0,0,0.05)' }, beginAtZero: true }
  }
}

// Keys must match Item.category enum values exactly
export const categoryColors = {
  grocery:  '#22c55e',
  medicine: '#3b82f6',
  cosmetic: '#ec4899',
  beverage: '#f59e0b',
  other:    '#6b7280'
}

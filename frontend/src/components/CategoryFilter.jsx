// src/components/CategoryFilter.jsx
export default function CategoryFilter({ value, onChange }) {
  return (
    <select
      className="w-full rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-300 px-4 py-2.5 text-base focus:outline-none focus:border-cyan-500/50 transition-colors"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {/* value MUST match schema; label can be plural */}
      <option value="grocery">Groceries</option>
      <option value="medicine">Medicines</option>
      <option value="cosmetic">Cosmetics</option>
      <option value="beverage">Beverages</option>
      <option value="other">Others</option>
    </select>
  )
}

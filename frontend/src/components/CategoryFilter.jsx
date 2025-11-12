// export default function CategoryFilter({ value, onChange }) {
//   return (
//     <select className="w-full rounded-lg border-gray-200 focus:ring-2 focus:ring-blue-500" value={value} onChange={(e) => onChange(e.target.value)}>
//       <option value="groceries">Groceries</option>
//       <option value="medicines">Medicines</option>
//       <option value="cosmetics">Cosmetics</option>
//       <option value="beverages">Beverages</option>
//       <option value="others">Others</option>
//     </select>
//   )
// }
export default function CategoryFilter({ value, onChange }) {
  return (
    <select
      className="w-full rounded-lg border-gray-200 focus:ring-2 focus:ring-blue-500"
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
  );
}

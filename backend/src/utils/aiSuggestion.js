export function getAISuggestion(item) {
  const name = item.name?.toLowerCase() || "";

  if (name.includes("milk")) return "Make tea or smoothie 🥤";
  if (name.includes("bread")) return "Prepare sandwich 🍞";

  return "Use soon to avoid waste ♻️";
}
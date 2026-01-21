export const SHOP_QUICK_FILTERS = [
  { label: "Dog Food", tab: "products", category: "dog-food" },
  { label: "Cat Food", tab: "products", category: "cat-food" },
  { label: "Livestock Feed", tab: "products", category: "livestock-feed" },
  { label: "Puppies", tab: "animals", category: "dog" },
  { label: "Kittens", tab: "animals", category: "cat" }
];

export function buildShopHref({ tab, category, search } = {}) {
  const qs = new URLSearchParams();
  if (tab) qs.set("tab", tab);
  if (category) qs.set("category", category);
  if (search) qs.set("search", search);
  const s = qs.toString();
  return `/shop${s ? `?${s}` : ""}`;
}

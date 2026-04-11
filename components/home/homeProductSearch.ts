export type HomeSearchableProduct = {
  name: string;
  category: string;
  size: string;
  unit: string;
};

export function filterProductsBySearchQuery<T extends HomeSearchableProduct>(
  list: readonly T[],
  searchQuery: string
): T[] {
  const query = searchQuery.trim().toLowerCase();
  if (!query) {
    return [...list];
  }
  return list.filter((product) => {
    const name = product.name.toLowerCase();
    const category = product.category.toLowerCase();
    const size = product.size.toLowerCase();
    const unit = product.unit.toLowerCase();
    return (
      name.includes(query) ||
      category.includes(query) ||
      size.includes(query) ||
      unit.includes(query)
    );
  });
}

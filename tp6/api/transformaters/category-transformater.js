/**
 * @param {import("../models/Category.js").CategoryDoc} dto
 * @returns {import("../models/Category.js").CategoryProps}
 */
export function toCategoryProps(dto) {
  return {
    id: dto.id,
    name: dto.name ?? "",
    description: dto.description ?? "",
    sortOrder: dto.sort_order ?? 0,
    slug: dto.slug ?? "",
  };
}

/**
 * @param {import("../models/product.js").DTOProduct} dto
 * @returns {import("../models/product.js").ProductProps}
 */
export function toProductProps(dto) {
  const productData = dto.product_data ?? {};
  const images = dto.images ?? [];
  const categories = dto.categories ?? [];

  const primaryCategory =
    categories[0]?.name ?? productData.categories?.[0] ?? "Général";

  return {
    id: dto.id,
    title: productData.product_title ?? "Produit sans titre",
    price: productData.price ?? 0,
    description:
      productData.long_description ?? productData.short_description ?? "",
    shortDescription: productData.short_description ?? "",
    category: primaryCategory,
    categories: categories.map((c) => c.name),

    imageObjects: images,
    bulletPoints: productData.bullet_points ?? [],
    tags: productData.tags ?? [],
    collections: productData.collections ?? [],
    options: productData.options ?? {},
    attributes: productData.attributes ?? {},

    state: dto.state ?? "",
    visibility: dto.visibility ?? "",
    status: productData.status ?? "",
    language: productData.language ?? "en",
    customCategory: dto.custom_category ?? null,
    errorMessage: dto.error_message ?? null,
  };
}

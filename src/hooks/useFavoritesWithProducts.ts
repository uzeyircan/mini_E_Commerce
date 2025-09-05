import { useMemo } from "react";
import { useFavorites } from "@/store/favorites";
import { useProducts } from "@/store/product";

export function useFavoritesWithProducts() {
  const { items: favs } = useFavorites(); // [{ product_id: string }]
  const { items: products } = useProducts();

  const productMap = useMemo(
    () => new Map(products.map((p) => [p.id, p])),
    [products]
  );

  const enriched = useMemo(() => {
    return Object.values(favs).map((f: { product_id: string }) => {
      const p = productMap.get(f.product_id);
      return {
        product_id: f.product_id,
        product: p
          ? {
              id: p.id,
              title: p.title,
              price: p.price,
              image: p.image,
            }
          : undefined,
      };
    });
  }, [favs, productMap]);

  return enriched;
}

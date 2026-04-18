import { supabase } from '../supabase'

const RATING_ORDER = { clean: 0, mixed: 1, avoid: 2 }

function mapProduct(p) {
  return {
    id: p.id,
    name: p.name,
    brand: p.brand,
    category: p.category,
    rating: p.rating,
    score: p.score,
    summary: p.summary,
    imageUrl: p.image_url ?? null,
  }
}

export async function fetchRelatedProducts(category, excludeProductId) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('category', category)
    .neq('id', excludeProductId)
    .limit(4)

  if (error) throw new Error(error.message)

  return data
    .map(mapProduct)
    .sort((a, b) => (RATING_ORDER[a.rating] ?? 3) - (RATING_ORDER[b.rating] ?? 3))
}

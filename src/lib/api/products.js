import { supabase } from '../supabase'

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

export async function fetchProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) throw new Error(error.message)
  return data.map(mapProduct)
}

export async function searchProducts(query) {
  const term = query.trim()
  if (!term) return []

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .or(`name.ilike.%${term}%,brand.ilike.%${term}%,summary.ilike.%${term}%`)
    .order('created_at', { ascending: true })

  if (error) throw new Error(error.message)
  return data.map(mapProduct)
}

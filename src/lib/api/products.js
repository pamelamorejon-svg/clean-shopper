import { supabase } from '../supabase'

export async function fetchProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) throw new Error(error.message)

  // Map snake_case DB columns to camelCase for components
  return data.map((p) => ({
    id: p.id,
    name: p.name,
    brand: p.brand,
    category: p.category,
    rating: p.rating,
    score: p.score,
    summary: p.summary,
    imageUrl: p.image_url ?? null,
  }))
}

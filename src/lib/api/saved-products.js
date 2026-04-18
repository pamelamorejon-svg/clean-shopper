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

export async function fetchSavedProducts() {
  const { data: saved, error: savedError } = await supabase
    .from('saved_products')
    .select('product_id')
    .order('created_at', { ascending: false })

  if (savedError) throw new Error(savedError.message)
  if (saved.length === 0) return []

  const ids = saved.map((r) => r.product_id)

  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('*')
    .in('id', ids)

  if (productsError) throw new Error(productsError.message)

  // Preserve saved order
  const productMap = new Map(products.map((p) => [p.id, p]))
  return ids.map((id) => productMap.get(id)).filter(Boolean).map(mapProduct)
}

export async function fetchSavedProductIds() {
  const { data, error } = await supabase
    .from('saved_products')
    .select('product_id')

  if (error) throw new Error(error.message)
  return new Set(data.map((r) => r.product_id))
}

export async function saveProduct(productId) {
  const { data: { user } } = await supabase.auth.getUser()
  const { error } = await supabase
    .from('saved_products')
    .insert({ user_id: user.id, product_id: productId })

  if (error) throw new Error(error.message)
}

export async function unsaveProduct(productId) {
  const { data: { user } } = await supabase.auth.getUser()
  const { error } = await supabase
    .from('saved_products')
    .delete()
    .eq('user_id', user.id)
    .eq('product_id', productId)

  if (error) throw new Error(error.message)
}

export async function unsaveAll() {
  const { data: { user } } = await supabase.auth.getUser()
  const { error } = await supabase
    .from('saved_products')
    .delete()
    .eq('user_id', user.id)

  if (error) throw new Error(error.message)
}

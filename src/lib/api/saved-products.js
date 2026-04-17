import { supabase } from '../supabase'

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

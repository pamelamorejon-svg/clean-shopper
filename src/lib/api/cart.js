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
    price: p.price ?? null,
  }
}

export async function fetchCartProducts() {
  const { data: cartItems, error: cartError } = await supabase
    .from('cart_items')
    .select('*')
    .order('created_at', { ascending: false })

  if (cartError) throw new Error(cartError.message)
  if (cartItems.length === 0) return { products: [], ids: new Set(), totalQuantity: 0 }

  const ids = cartItems.map((r) => r.product_id)
  const quantityMap = new Map(cartItems.map((r) => [r.product_id, r.quantity ?? 1]))

  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('*')
    .in('id', ids)

  if (productsError) throw new Error(productsError.message)

  const productMap = new Map(products.map((p) => [p.id, p]))
  const ordered = ids
    .map((id) => {
      const p = productMap.get(id)
      if (!p) return null
      return { ...mapProduct(p), quantity: quantityMap.get(id) ?? 1 }
    })
    .filter(Boolean)

  const totalQuantity = ordered.reduce((sum, p) => sum + p.quantity, 0)
  return { products: ordered, ids: new Set(ids), totalQuantity }
}

export async function addToCart(productId) {
  const { data: { user } } = await supabase.auth.getUser()

  // Check if already in cart — increment quantity if so
  const { data: existing } = await supabase
    .from('cart_items')
    .select('quantity')
    .eq('user_id', user.id)
    .eq('product_id', productId)
    .maybeSingle()

  if (existing) {
    const { error } = await supabase
      .from('cart_items')
      .update({ quantity: existing.quantity + 1 })
      .eq('user_id', user.id)
      .eq('product_id', productId)
    if (error) throw new Error(error.message)
  } else {
    const { error } = await supabase
      .from('cart_items')
      .insert({ user_id: user.id, product_id: productId })
    if (error) throw new Error(error.message)
  }
}

export async function updateCartQuantity(productId, quantity) {
  const { data: { user } } = await supabase.auth.getUser()
  if (quantity <= 0) return removeFromCart(productId)
  const { error } = await supabase
    .from('cart_items')
    .update({ quantity })
    .eq('user_id', user.id)
    .eq('product_id', productId)
  if (error) throw new Error(error.message)
}

export async function removeFromCart(productId) {
  const { data: { user } } = await supabase.auth.getUser()
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('user_id', user.id)
    .eq('product_id', productId)
  if (error) throw new Error(error.message)
}

export async function clearCart() {
  const { data: { user } } = await supabase.auth.getUser()
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('user_id', user.id)
  if (error) throw new Error(error.message)
}

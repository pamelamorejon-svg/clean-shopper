-- Enable RLS on saved_products (already enabled via dashboard)
-- alter table public.saved_products enable row level security;

-- Each user can only see their own saved products
create policy "Users can view own saved products"
  on public.saved_products
  for select
  to authenticated
  using (user_id = auth.uid());

-- Users can only save products for themselves
create policy "Users can insert own saved products"
  on public.saved_products
  for insert
  to authenticated
  with check (user_id = auth.uid());

-- Users can only remove their own saved products
create policy "Users can delete own saved products"
  on public.saved_products
  for delete
  to authenticated
  using (user_id = auth.uid());

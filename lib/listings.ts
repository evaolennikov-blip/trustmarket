import { supabase } from './supabase'

export interface Listing {
  id: string
  title: string
  price_rub: number
  condition: string
  city: string
  category: string
  images: string[]
  description?: string
  seller: {
    full_name: string
    verification_tier: 'none' | 'basic' | 'enhanced' | 'trusted'
    successful_transactions: number
  }
}

export async function getListings(filters?: {
  category?: string
  condition?: string
  maxPrice?: number
  verifiedOnly?: boolean
  search?: string
}): Promise<Listing[]> {
  let query = supabase
    .from('listings')
    .select(`
      id, title, price_rub, condition, city, category, images,
      seller:users!listings_seller_id_fkey(full_name, verification_tier, successful_transactions)
    `)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })

  if (filters?.category && filters.category !== 'all') {
    query = query.eq('category', filters.category)
  }
  if (filters?.condition && filters.condition !== 'all') {
    query = query.eq('condition', filters.condition)
  }
  if (filters?.maxPrice) {
    query = query.lte('price_rub', filters.maxPrice)
  }
  // verifiedOnly filtered client-side after fetch (can't filter on joined columns in Supabase)
  if (filters?.search) {
    query = query.ilike('title', `%${filters.search}%`)
  }

  const { data, error } = await query
  if (error) throw error
  let results = (data ?? []) as unknown as Listing[]
  if (filters?.verifiedOnly) {
    results = results.filter(l => l.seller.verification_tier === 'enhanced' || l.seller.verification_tier === 'trusted')
  }
  return results
}

export async function getListing(id: string): Promise<Listing | null> {
  const { data, error } = await supabase
    .from('listings')
    .select(`
      id, title, price_rub, condition, city, category, images, description,
      seller:users!listings_seller_id_fkey(full_name, verification_tier, successful_transactions)
    `)
    .eq('id', id)
    .eq('status', 'approved')
    .single()

  if (error) return null
  return data as unknown as Listing
}

import { supabase } from './supabase'
import type { Listing } from './listings'

export interface UserProfile {
  id: string
  full_name: string | null
  verification_tier: 'none' | 'basic' | 'enhanced' | 'trusted'
  successful_transactions: number
  account_created_at: string
}

export interface MyListing {
  id: string
  title: string
  price_rub: number
  condition: string
  status: string
  created_at: string
  category: string
  images: string[]
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('users')
    .select('id, full_name, verification_tier, successful_transactions, account_created_at')
    .eq('id', userId)
    .single()
  if (error) return null
  return data as UserProfile
}

export async function getMyListings(userId: string): Promise<MyListing[]> {
  const { data, error } = await supabase
    .from('listings')
    .select('id, title, price_rub, condition, status, created_at, category, images')
    .eq('seller_id', userId)
    .order('created_at', { ascending: false })
  if (error) return []
  return (data ?? []) as MyListing[]
}

export async function getSellerProfile(id: string): Promise<UserProfile | null> {
  return getUserProfile(id)
}

export async function getSellerListings(sellerId: string): Promise<Listing[]> {
  const { data, error } = await supabase
    .from('listings')
    .select(`
      id, title, price_rub, condition, city, category, images,
      seller:users!listings_seller_id_fkey(full_name, verification_tier, successful_transactions)
    `)
    .eq('seller_id', sellerId)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
  if (error) return []
  return (data ?? []) as unknown as Listing[]
}

export async function getAllSellerIds(): Promise<string[]> {
  const { data, error } = await supabase
    .from('users')
    .select('id')
    .limit(100)
  if (error) return []
  return (data ?? []).map(u => u.id)
}

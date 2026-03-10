import SellerView from './SellerView'

export async function generateStaticParams() {
  try {
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
    )
    const { data } = await supabase.from('users').select('id').limit(100)
    return (data ?? []).map(u => ({ id: u.id }))
  } catch {
    return []
  }
}

export default function SellerPage({ params }: { params: { id: string } }) {
  return <SellerView id={params.id} />
}

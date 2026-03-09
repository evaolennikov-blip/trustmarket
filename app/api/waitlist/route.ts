import { NextRequest, NextResponse } from 'next/server'

// Lazy initialize Supabase client to avoid build-time errors
function getSupabase() {
  const { createClient } = require('@supabase/supabase-js')
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase credentials not configured')
  }
  
  return createClient(supabaseUrl, supabaseKey)
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabase()
    
    const body = await request.json()
    const { name, email, role } = body

    // Validate required fields
    if (!name || !email || !role) {
      return NextResponse.json(
        { error: 'Пожалуйста, заполните все поля' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Введите корректный email' },
        { status: 400 }
      )
    }

    // Validate role
    if (!['buyer', 'seller', 'both'].includes(role)) {
      return NextResponse.json(
        { error: 'Выберите роль' },
        { status: 400 }
      )
    }

    // Insert into waitlist
    const { data, error } = await supabase
      .from('waitlist')
      .insert([
        {
          name: name.trim(),
          email: email.toLowerCase().trim(),
          role,
        },
      ])
      .select()

    if (error) {
      // Handle duplicate email
      if (error.code === '23505' || error.message?.includes('duplicate')) {
        return NextResponse.json(
          { error: 'Этот email уже зарегистрирован в waitlist' },
          { status: 409 }
        )
      }

      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Ошибка сервера. Попробуйте позже.' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { success: true, message: 'Вы успешно добавлены в waitlist!', data },
      { status: 201 }
    )
  } catch (error) {
    console.error('Waitlist API error:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const supabase = getSupabase()
    
    // Check auth - in production, add admin authentication
    const { data, error } = await supabase
      .from('waitlist')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Ошибка при получении данных' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Waitlist GET error:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

'use client'

import { useState, FormEvent } from 'react'

interface WaitlistEntry {
  name: string
  email: string
  role: 'buyer' | 'seller' | ''
}

export default function Home() {
  const [formData, setFormData] = useState<WaitlistEntry>({
    name: '',
    email: '',
    role: ''
  })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.role) return
    
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Ошибка при отправке')
      }
      
      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Что-то пошло не так')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen">
      {/* Navigation */}
      <nav className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-trust-700 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <span className="font-bold text-xl text-trust-900">Трастмаркет</span>
            </div>
            <div className="text-sm text-gray-500">
              Скоро запуск
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-trust-50 to-white py-20 sm:py-28">
        <div className="absolute inset-0 bg-grid-trust-100/[0.5] bg-[size:30px_30px]" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-accent-100 text-accent-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Безопасная торговля электроникой
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-trust-900 tracking-tight text-balance mb-6">
              Покупай и продавай<br />
              <span className="text-trust-600">электронику без мошенников</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
              Трастмаркет — это первая проверенная площадка для торговли электроникой в России. 
              Каждый продавец верифицирован. Каждая сделка защищена.
            </p>

            {/* Waitlist Form */}
            {!submitted ? (
              <form onSubmit={handleSubmit} className="max-w-md mx-auto">
                <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-100">
                  <p className="text-center font-semibold text-gray-900 mb-4">
                    Присоединяйся к waitlist — получи приоритетный доступ
                  </p>
                  
                  <div className="space-y-4">
                    {error && (
                      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                        {error}
                      </div>
                    )}
                    <div>
                      <input
                        type="text"
                        placeholder="Твоё имя"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-trust-500 focus:ring-2 focus:ring-trust-200 outline-none transition"
                        required
                      />
                    </div>
                    
                    <div>
                      <input
                        type="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-trust-500 focus:ring-2 focus:ring-trust-200 outline-none transition"
                        required
                      />
                    </div>
                    
                    <div>
                      <select
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value as 'buyer' | 'seller' })}
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-trust-500 focus:ring-2 focus:ring-trust-200 outline-none transition"
                        required
                      >
                        <option value="">Я хочу...</option>
                        <option value="buyer">Покупать электронику</option>
                        <option value="seller">Продавать электронику</option>
                      </select>
                    </div>
                    
                    <button
                      type="submit"
                      disabled={loading || !formData.name || !formData.email || !formData.role}
                      className="w-full bg-trust-700 hover:bg-trust-800 disabled:bg-gray-300 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:cursor-not-allowed"
                    >
                      {loading ? 'Отправка...' : 'Присоединиться к waitlist'}
                    </button>
                  </div>
                  
                  <p className="text-center text-xs text-gray-400 mt-4">
                    Мы не будем спамить. Только важные обновления.
                  </p>
                </div>
              </form>
            ) : (
              <div className="max-w-md mx-auto">
                <div className="bg-accent-50 border border-accent-200 rounded-2xl p-8 text-center">
                  <div className="w-16 h-16 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-accent-800 mb-2">Ты в списке!</h3>
                  <p className="text-accent-700">
                    Спасибо, {formData.name}! Мы свяжемся с тобой, когда площадка будет готова.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Trust Differentiators */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Почему Трастмаркет лучше Авито
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Мы построили платформу с нуля, чтобы решить проблему мошенников, которая не решена на Авито
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Card 1: Verified ID */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-trust-100 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-trust-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Верификация продавцов</h3>
              <p className="text-gray-600">
                Каждый продавец проходит проверку личности через Госуслуги. 
                Мошенники не могут создать аккаунт. Объявления публикуют только проверенные люди.
              </p>
            </div>

            {/* Card 2: Escrow */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-accent-100 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Эскроу сделка</h3>
              <p className="text-gray-600">
                Деньги покупателя хранятся на безопасном счёте, пока он не получит и не проверит товар. 
                Только после подтверждения деньги уходят продавцу. Полная защита от обмана.
              </p>
            </div>

            {/* Card 3: Human Moderation */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-trust-100 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-trust-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Человеческая модерация</h3>
              <p className="text-gray-600">
                Каждое объявление проверяется человеком перед публикацией. 
                Подозрительные продавцы и товары блокируются вручную. Никаких сомнительных объявлений.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Placeholder */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">
              Присоединяйтесь к waitlist
            </h2>
            
            {/* Placeholder for testimonials */}
            <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              <div className="bg-gray-50 rounded-xl p-6 text-left">
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-accent-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-700 italic">
                  &quot;На Авито меня развели на 15 тысяч. Больше ни ногой. Рад, что появилась альтернатива с проверкой продавцов.&quot;
                </p>
                <p className="text-sm text-gray-500 mt-3">— Антон, покупатель</p>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-6 text-left">
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-accent-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-700 italic">
                  &quot;Продаю телефоны 3 года. На Авито постоянно блокируют без причины. Хочу нормальную площадку с адекватной модерацией.&quot;
                </p>
                <p className="text-sm text-gray-500 mt-3">— Дмитрий, продавец</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-trust-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Готов попрощаться с мошенниками?
          </h2>
          <p className="text-trust-200 text-lg mb-8">
            Присоединяйся к waitlist и получи приоритетный доступ при запуске
          </p>
          <a 
            href="#waitlist"
            className="inline-block bg-accent-500 hover:bg-accent-600 text-white font-semibold py-4 px-8 rounded-xl transition-colors"
          >
            Присоединиться к waitlist
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-trust-700 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <span className="font-bold text-xl text-white">Трастмаркет</span>
            </div>
            
            <div className="text-gray-400 text-sm text-center md:text-right">
              <p>© 2026 Трастмаркет. Все права защищены.</p>
              <p className="mt-1">Электронная коммерция без обмана</p>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}

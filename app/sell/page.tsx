'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/useAuth'

type Step = 'details' | 'pricing' | 'review'

const steps: { key: Step; label: string }[] = [
  { key: 'details', label: 'Детали' },
  { key: 'pricing', label: 'Цена' },
  { key: 'review', label: 'Проверка' },
]

const categories = [
  { id: 'smartphones', label: 'Смартфоны' },
  { id: 'laptops', label: 'Ноутбуки' },
  { id: 'tablets', label: 'Планшеты' },
  { id: 'accessories', label: 'Аксессуары' },
  { id: 'gaming', label: 'Игровые' },
  { id: 'computers', label: 'Компьютеры' },
  { id: 'tv_audio', label: 'ТВ и аудио' },
  { id: 'other', label: 'Другое' },
]

const cities = ['Москва', 'Санкт-Петербург', 'Новосибирск', 'Екатеринбург', 'Казань', 'Нижний Новгород', 'Краснодар', 'Другой']

const conditionOptions = [
  { id: 'new', label: 'Новое' },
  { id: 'like_new', label: 'Как новое' },
  { id: 'good', label: 'Хорошее' },
  { id: 'fair', label: 'Удовлетворительное' },
  { id: 'for_parts', label: 'На запчасти' },
]

async function ensureProfile(userId: string, email: string) {
  const { data } = await supabase.from('users').select('id').eq('id', userId).single()
  if (data) return data.id

  const { data: created, error } = await supabase.from('users').insert({
    id: userId,
    email,
    verification_tier: 'none',
    full_name: email.split('@')[0],
  }).select('id').single()

  if (error) throw new Error('Не удалось создать профиль: ' + error.message)
  return created.id
}

export default function SellPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [currentStep, setCurrentStep] = useState<Step>('details')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    category: 'smartphones',
    brand: '',
    model: '',
    condition: '',
    description: '',
    price: '',
    city: '',
    agreed: false,
  })

  if (authLoading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400">Загрузка...</div>
  )

  const update = (field: string, value: string | boolean) =>
    setFormData(prev => ({ ...prev, [field]: value }))

  const currentIndex = steps.findIndex(s => s.key === currentStep)
  const nextStep = () => currentIndex < steps.length - 1 && setCurrentStep(steps[currentIndex + 1].key)
  const prevStep = () => currentIndex > 0 && setCurrentStep(steps[currentIndex - 1].key)

  const handleSubmit = async () => {
    if (!user) return
    setError('')
    setSubmitting(true)
    try {
      const profileId = await ensureProfile(user.id, user.email ?? '')
      const title = `${formData.brand} ${formData.model}`.trim()

      const { error: err } = await supabase.from('listings').insert({
        seller_id: profileId,
        title,
        description: formData.description,
        price_rub: parseInt(formData.price),
        category: formData.category,
        condition: formData.condition,
        brand: formData.brand,
        model: formData.model,
        city: formData.city,
        status: 'pending',
      })

      if (err) throw new Error(err.message)
      router.push('/dashboard?submitted=1')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Ошибка при отправке')
      setSubmitting(false)
    }
  }

  const canProceed = () => {
    if (currentStep === 'details') return formData.brand && formData.model && formData.condition && formData.description
    if (currentStep === 'pricing') return formData.price && formData.city
    if (currentStep === 'review') return formData.agreed
    return true
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold text-xl text-trust-900">Трастмаркет</Link>
          <Link href="/dashboard" className="text-gray-500 hover:text-gray-700 text-sm">Отмена</Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Steps */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {steps.map((step, i) => (
            <div key={step.key} className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                step.key === currentStep ? 'bg-trust-700 text-white' :
                currentIndex > i ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {currentIndex > i ? '✓' : i + 1}
              </div>
              <span className={`ml-2 text-sm hidden sm:block ${step.key === currentStep ? 'font-medium text-gray-900' : 'text-gray-400'}`}>
                {step.label}
              </span>
              {i < steps.length - 1 && <div className={`w-12 h-0.5 mx-3 ${currentIndex > i ? 'bg-green-500' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8">

          {/* Step 1: Details */}
          {currentStep === 'details' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold text-gray-900">Информация об устройстве</h1>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Категория</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {categories.map(c => (
                    <button key={c.id} type="button" onClick={() => update('category', c.id)}
                      className={`py-2 px-3 rounded-lg border text-sm font-medium transition ${
                        formData.category === c.id ? 'border-trust-500 bg-trust-50 text-trust-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}>
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Бренд *</label>
                  <input type="text" placeholder="Apple, Samsung..." value={formData.brand}
                    onChange={e => update('brand', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-trust-500 focus:ring-2 focus:ring-trust-100 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Модель *</label>
                  <input type="text" placeholder="iPhone 14 Pro..." value={formData.model}
                    onChange={e => update('model', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-trust-500 focus:ring-2 focus:ring-trust-100 outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Состояние *</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {conditionOptions.map(c => (
                    <button key={c.id} type="button" onClick={() => update('condition', c.id)}
                      className={`py-2.5 px-3 rounded-xl border text-sm font-medium transition ${
                        formData.condition === c.id ? 'border-trust-500 bg-trust-50 text-trust-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}>
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Описание *</label>
                <textarea rows={4} placeholder="Опишите состояние, комплектацию, причину продажи..."
                  value={formData.description} onChange={e => update('description', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-trust-500 focus:ring-2 focus:ring-trust-100 outline-none resize-none" />
              </div>
            </div>
          )}

          {/* Step 2: Pricing */}
          {currentStep === 'pricing' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold text-gray-900">Цена и город</h1>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Цена, ₽ *</label>
                <input type="number" placeholder="65000" value={formData.price}
                  onChange={e => update('price', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-trust-500 focus:ring-2 focus:ring-trust-100 outline-none text-lg" />
              </div>

              {formData.price && (
                <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                  <div className="flex justify-between text-gray-500">
                    <span>Комиссия платформы (3%)</span>
                    <span>{Math.round(parseInt(formData.price) * 0.03).toLocaleString('ru-RU')} ₽</span>
                  </div>
                  <div className="flex justify-between font-semibold text-gray-900 pt-2 border-t border-gray-200">
                    <span>Вы получите</span>
                    <span className="text-green-600">{Math.round(parseInt(formData.price) * 0.97).toLocaleString('ru-RU')} ₽</span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Город *</label>
                <select value={formData.city} onChange={e => update('city', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-trust-500 focus:ring-2 focus:ring-trust-100 outline-none bg-white">
                  <option value="">Выберите город</option>
                  {cities.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {currentStep === 'review' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold text-gray-900">Проверьте объявление</h1>

              <div className="bg-gray-50 rounded-xl p-5 space-y-3 text-sm">
                {[
                  ['Устройство', `${formData.brand} ${formData.model}`],
                  ['Категория', categories.find(c => c.id === formData.category)?.label ?? ''],
                  ['Состояние', conditionOptions.find(c => c.id === formData.condition)?.label ?? ''],
                  ['Цена', `${parseInt(formData.price).toLocaleString('ru-RU')} ₽`],
                  ['Город', formData.city],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-gray-500">{label}</span>
                    <span className="font-medium text-gray-900">{value}</span>
                  </div>
                ))}
              </div>

              <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600">
                <strong className="text-gray-800">Описание:</strong>
                <p className="mt-1 whitespace-pre-line">{formData.description}</p>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800">
                После отправки объявление будет проверено модератором. Обычно занимает 15–30 минут.
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={formData.agreed} onChange={e => update('agreed', e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-trust-600" />
                <span className="text-sm text-gray-600">Я подтверждаю, что информация верна, и соглашаюсь с правилами платформы</span>
              </label>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
            <button onClick={prevStep} disabled={currentStep === 'details'}
              className="px-6 py-3 rounded-xl font-medium text-gray-600 hover:bg-gray-100 transition disabled:opacity-30 disabled:cursor-not-allowed">
              Назад
            </button>

            {currentStep === 'review' ? (
              <button onClick={handleSubmit} disabled={!canProceed() || submitting}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-xl transition disabled:opacity-50">
                {submitting ? 'Отправляем...' : 'Отправить на проверку'}
              </button>
            ) : (
              <button onClick={nextStep} disabled={!canProceed()}
                className="bg-trust-700 hover:bg-trust-800 text-white font-semibold py-3 px-8 rounded-xl transition disabled:opacity-50">
                Далее
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

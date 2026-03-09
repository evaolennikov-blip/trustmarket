'use client'

import { useState } from 'react'
import Link from 'next/link'

type Step = 'details' | 'verification' | 'pricing' | 'review'

const steps: { key: Step; label: string }[] = [
  { key: 'details', label: 'Детали' },
  { key: 'verification', label: 'Фото' },
  { key: 'pricing', label: 'Цена' },
  { key: 'review', label: 'Проверка' },
]

export default function SellPage() {
  const [currentStep, setCurrentStep] = useState<Step>('details')
  const [formData, setFormData] = useState({
    // Step 1: Details
    category: 'smartphones',
    brand: '',
    model: '',
    condition: '',
    description: '',
    // Step 2: Verification
    frontPhoto: null as File | null,
    backPhoto: null as File | null,
    verificationPhoto: null as File | null,
    // Step 3: Pricing
    price: '',
    city: '',
  })

  const nextStep = () => {
    const currentIndex = steps.findIndex(s => s.key === currentStep)
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1].key)
    }
  }

  const prevStep = () => {
    const currentIndex = steps.findIndex(s => s.key === currentStep)
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1].key)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-trust-700 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <span className="font-bold text-xl text-trust-900">Трастмаркет</span>
            </Link>
            <Link href="/dashboard" className="text-gray-600 hover:text-trust-600 font-medium">
              Отмена
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.key} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                  step.key === currentStep
                    ? 'bg-trust-700 text-white'
                    : steps.findIndex(s => s.key === currentStep) > index
                      ? 'bg-accent-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                }`}>
                  {steps.findIndex(s => s.key === currentStep) > index ? '✓' : index + 1}
                </div>
                <span className={`ml-2 text-sm hidden sm:block ${
                  step.key === currentStep ? 'font-medium text-gray-900' : 'text-gray-500'
                }`}>
                  {step.label}
                </span>
                {index < steps.length - 1 && (
                  <div className={`w-8 sm:w-16 h-0.5 mx-2 ${
                    steps.findIndex(s => s.key === currentStep) > index
                      ? 'bg-accent-500'
                      : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 sm:p-8">
          {/* Step 1: Device Details */}
          {currentStep === 'details' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold text-gray-900">Информация об устройстве</h1>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Бренд *</label>
                <input
                  type="text"
                  placeholder="Apple, Samsung, Xiaomi..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-trust-200 focus:border-trust-500"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Модель *</label>
                <input
                  type="text"
                  placeholder="iPhone 14 Pro, Galaxy S23..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-trust-200 focus:border-trust-500"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Состояние *</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {['new', 'like_new', 'good', 'fair', 'for_parts'].map((condition) => (
                    <button
                      key={condition}
                      type="button"
                      className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                        formData.condition === condition
                          ? 'border-trust-500 bg-trust-50 text-trust-700'
                          : 'border-gray-200 text-gray-700 hover:border-gray-300'
                      }`}
                      onClick={() => setFormData({ ...formData, condition })}
                    >
                      {condition === 'new' ? 'Новый' :
                       condition === 'like_new' ? 'Как новый' :
                       condition === 'good' ? 'Хорошее' :
                       condition === 'fair' ? 'Удовлетворительное' : 'На запчасти'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Описание *</label>
                <textarea
                  rows={4}
                  placeholder="Опишите состояние, комплектацию, причину продажи..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-trust-200 focus:border-trust-500"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </div>
          )}

          {/* Step 2: Verification Photos */}
          {currentStep === 'verification' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold text-gray-900">Фотографии для верификации</h1>
              
              <div className="bg-accent-50 border border-accent-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <svg className="w-5 h-5 text-accent-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="font-medium text-accent-800">Зачем нужны фото верификации?</p>
                    <p className="text-sm text-accent-700 mt-1">
                      Мы проверяем, что устройство действительно работает. Фото с кодом подтверждает, что вы — реальный продавец.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Фото с включённым устройством и кодом *
                </label>
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center hover:border-trust-400 transition-colors cursor-pointer">
                  <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-gray-600">Нажмите или перетащите файл</p>
                  <p className="text-sm text-gray-400 mt-1">PNG, JPG до 10MB</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Пример фото верификации:</p>
                <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center text-gray-400">
                  [Пример изображения]
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  В кадре должно быть видно: включённый телефон + бумажка с кодом "TM-XXXX"
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Дополнительные фото (до 5)</label>
                <div className="grid grid-cols-3 gap-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="aspect-square bg-gray-100 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400 hover:border-trust-400 cursor-pointer transition-colors">
                      <span className="text-xs">+</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Pricing */}
          {currentStep === 'pricing' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold text-gray-900">Цена и расположение</h1>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Цена, ₽ *</label>
                <div className="relative">
                  <input
                    type="number"
                    placeholder="65000"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-trust-200 focus:border-trust-500 text-lg"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">₽</span>
                </div>
                <p className="text-sm text-gray-500 mt-2">Рекомендованная цена: 65 000 ₽</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Город *</label>
                <select
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-trust-200 focus:border-trust-500"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                >
                  <option value="">Выберите город</option>
                  <option value="moscow">Москва</option>
                  <option value="spb">Санкт-Петербург</option>
                </select>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Комиссия платформы (3%)</span>
                  <span className="font-medium text-gray-900">
                    {formData.price ? (parseInt(formData.price) * 0.03).toFixed(0) : 0} ₽
                  </span>
                </div>
                <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-200">
                  <span className="font-medium text-gray-900">Вы получите</span>
                  <span className="font-bold text-accent-600 text-lg">
                    {formData.price ? (parseInt(formData.price) * 0.97).toFixed(0) : 0} ₽
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {currentStep === 'review' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold text-gray-900">Проверьте объявление</h1>
              
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Устройство</span>
                  <span className="font-medium">{formData.brand} {formData.model}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Состояние</span>
                  <span className="font-medium">{formData.condition}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Цена</span>
                  <span className="font-medium">{formData.price} ₽</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Город</span>
                  <span className="font-medium">{formData.city}</span>
                </div>
              </div>

              <div className="bg-accent-50 border border-accent-200 rounded-lg p-4">
                <p className="text-sm text-accent-800">
                  После отправки объявление будет проверено модератором. Это обычно занимает 15-30 минут.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <input type="checkbox" id="terms" className="mt-1 rounded border-gray-300 text-trust-600" />
                <label htmlFor="terms" className="text-sm text-gray-600">
                  Я согласен с правилами платформы и подтверждаю, что информация верна
                </label>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
            <button
              onClick={prevStep}
              disabled={currentStep === 'details'}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                currentStep === 'details'
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Назад
            </button>
            
            {currentStep === 'review' ? (
              <button className="bg-accent-500 hover:bg-accent-600 text-white font-semibold py-3 px-8 rounded-lg transition-colors">
                Отправить на проверку
              </button>
            ) : (
              <button
                onClick={nextStep}
                className="bg-trust-700 hover:bg-trust-800 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
              >
                Далее
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

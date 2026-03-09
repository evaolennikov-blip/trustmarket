import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Трастмаркет — Покупай и продавай электронику без мошенников',
  description: 'Первая проверенная площадка для покупки и продажи электроники в России. Верификация продавцов, защита покупателей, гарантия сделки.',
  keywords: 'электроника, купить, продать, б/у, телефон, ноутбук, авито, мошенники, trust, marketplace',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body className="min-h-screen bg-white">{children}</body>
    </html>
  )
}

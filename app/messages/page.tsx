import { Metadata } from 'next'
import { Suspense } from 'react'
import MessagesView from './MessagesView'

export const metadata: Metadata = {
  title: 'Сообщения — Трастмаркет',
  description: 'Вся переписка с продавцами и покупателями',
}

export default function MessagesPage() {
  return (
    <Suspense>
      <MessagesView />
    </Suspense>
  )
}

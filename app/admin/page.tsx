import { Metadata } from 'next'
import AdminView from './AdminView'

export const metadata: Metadata = {
  title: 'Админ панель — Трастмаркет',
  description: 'Модерация объявлений и пользователей',
}

export default function AdminPage() {
  return <AdminView />
}

# TrustMarket Архитектура

**Версия:** 1.0  
**Дата:** 2026-03-09  
**Статус:** MVP Architecture

---

## 1. System Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              TRUSTMARKET MVP                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                    │
│  │   Browser   │    │   Mobile   │    │    API     │                    │
│  │   (Web)    │    │    (PWA)   │    │  Clients   │                    │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘                    │
│         │                  │                  │                            │
│         └──────────────────┼──────────────────┘                            │
│                            ▼                                               │
│                  ┌─────────────────────┐                                   │
│                  │    Next.js 14 App   │                                   │
│                  │      Router         │                                   │
│                  └──────────┬──────────┘                                   │
│                             │                                               │
│         ┌──────────────────┼──────────────────┐                            │
│         ▼                  ▼                  ▼                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                       │
│  │ Auth Layer  │  │  API Layer  │  │   Admin     │                       │
│  │  (NextAuth) │  │  (Route    │  │   Panel     │                       │
│  │  + OTP     │  │   Handlers)│  │   (SSR)     │                       │
│  └──────┬──────┘  └──────┬──────┘  └─────────────┘                       │
│         │                 │                                                │
│         └─────────────────┼────────────────────────────────┐               │
│                           ▼                                ▼               │
│                  ┌─────────────────────┐    ┌─────────────────────┐       │
│                  │     Supabase        │    │     YooKassa        │       │
│                  │   (PostgreSQL)     │    │    (Payments)       │       │
│                  │                     │    │                     │       │
│                  │ • users            │    │ • Payment creation  │       │
│                  │ • listings         │    │ • Escrow hold       │       │
│                  │ • transactions     │    │ • Refunds          │       │
│                  │ • messages         │    │ • Payouts          │       │
│                  │ • ratings          │    └─────────┬───────────┘       │
│                  │ • reports         │              │                   │
│                  └─────────────────────┘              │                   │
│                                                      │                   │
│  ┌───────────────────────────────────────────────────┘                   │
│  │                                                                         │
│  ▼                                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │   Gosuslugi │  │    SMS      │  │   Email     │  │   Storage   │     │
│  │  (ID Verify)│  │  (OTP)      │  │  (Resend)   │  │   (Images)  │     │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Tech Stack

###Frontend

| Технология | Назначение | Обоснование |
|-----------|-----------|-------------|
| **Next.js 14** | Full-stack framework | App Router, SSR для SEO, API routes встроены |
| **Tailwind CSS** | Styling | Ускоряет разработку, консистентный дизайн |
| **React 18** | UI Library | Декларативные компоненты, экосистема |
| **PWA** | Mobile | Service workers → офлайн, push notifications |
| **Zustand** | State management | Проще Redux, TS-типизация |

### Backend

| Технология | Назначение | Обоснование |
|-----------|-----------|-------------|
| **Supabase** | Database + Auth | PostgreSQL, встроенный Auth, Row Level Security |
| **Next.js API Routes** | Backend logic | Не нужен отдельный сервер |
| **YooKassa** | Payments | Российская платёжная система, официальные документы |

### Infrastructure

| Технология | Назначение | Обоснование |
|-----------|-----------|-------------|
| **Netlify** | Hosting | Edge functions, SSL, CI/CD из коробки |
| **Supabase** | Database | Бекапы, репликация, простой API |
| **Cloudflare** | CDN/DNS | DDoS защита, кеширование |

### Integrations

| Сервис | Назначение |
|--------|-----------|
| **Gosuslugi API** | Паспортная верификация |
| **SMS.ru / TurboSMS** | OTP коды |
| **Resend** | Транзакционные email |
| **S3-compatible** | Хранение фото |

---

## 3. API Routes

### Auth
| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/auth/register` | Регистрация с email/phone |
| POST | `/api/auth/login` | Логин |
| POST | `/api/auth/otp/send` | Отправить OTP |
| POST | `/api/auth/otp/verify` | Подтвердить OTP |
| POST | `/api/auth/logout` | Выход |
| GET | `/api/auth/session` | Текущая сессия |

### Users
| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/users/me` | Профиль текущего юзера |
| PATCH | `/api/users/me` | Обновить профиль |
| POST | `/api/users/verification/request` | Запрос верификации |
| GET | `/api/users/:id/public` | Публичный профиль продавца |

### Listings
| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/listings` | Поиск объявлений (filter, pagination) |
| POST | `/api/listings` | Создать объявление |
| GET | `/api/listings/:id` | Детали объявления |
| PATCH | `/api/listings/:id` | Обновить объявление |
| DELETE | `/api/listings/:id` | Удалить объявление |
| POST | `/api/listings/:id/submit` | Отправить на модерацию |
| POST | `/api/listings/:id/feature` | Поднять в топ |

### Transactions (Escrow)
| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/transactions/create` | Начать сделку |
| POST | `/api/transactions/:id/pay` | Оплатить (YooKassa) |
| POST | `/api/transactions/:id/confirm` | Подтвердить получение |
| POST | `/api/transactions/:id/dispute` | Открыть спор |
| POST | `/api/transactions/:id/refund` | Возврат (админ) |

### Messages
| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/messages` | Список чатов |
| GET | `/api/messages/:conversationId` | Сообщения в чате |
| POST | `/api/messages` | Отправить сообщение |

### Ratings
| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/ratings` | Оставить отзыв (после сделки) |
| GET | `/api/users/:id/ratings` | Отзывы о продавце |

### Reports
| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/reports` | Пожаловаться на объявление/юзера |
| GET | `/api/admin/reports` | Список репортов (админ) |

### Admin
| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/admin/listings/pending` | Объявления на модерации |
| POST | `/api/admin/listings/:id/approve` | Одобрить |
| POST | `/api/admin/listings/:id/reject` | Отклонить |
| GET | `/api/admin/stats` | Статистика платформы |

---

## 4. Key User Flows

### 4.1 Create Listing Flow

```
User                    System                      Database
  │                        │                           │
  │──POST /listings───────>│                           │
  │   (title, photos,      │                           │
  │    price, condition)   │                           │
  │                        │──INSERT listing─────────>│ (status=draft)
  │<──201 Created───────────│                           │
  │   (listing_id)         │                           │
  │                        │                           │
  │──POST /listings/:id───>│                           │
  │   /submit              │                           │
  │                        │──UPDATE status───────────>│ (status=pending)
  │                        │                           │
  │                        │──Notify moderator────────>│
  │                        │                           │
  │                        │   [HUMAN REVIEW]         │
  │                        │                           │
  │                        │──UPDATE status───────────>│ (status=approved)
  │<──200 OK───────────────│                           │
```

### 4.2 Buy Item Flow (Escrow)

```
Buyer                   Seller                   System              YooKassa
  │                        │                        │                   │
  │──GET /listings/:id───>│                        │                   │
  │<──Listing data─────────│                        │                   │
  │                        │                        │                   │
  │──POST /transactions───>│                        │                   │
  │   (listing_id)         │                        │                   │
  │                        │──CREATE payment───────>│                   │
  │<──Payment URL──────────│<──Payment URL───────────│                   │
  │                        │                        │                   │
  │──[Pay on YooKassa]───>│                        │                   │
  │                        │<──Payment webhook──────│                   │
  │                        │                        │                   │
  │                        │──UPDATE transaction───>│ (status=held)
  │                        │   [ESCROW]             │                   │
  │                        │                        │                   │
  │                        │──Notify seller─────────>│ (ship item)
  │                        │                        │                   │
  │                        │──POST /ship───────────>│ (tracking_number)
  │                        │                        │                   │
  │<─[Receive item]────────│                        │                   │
  │                        │                        │                   │
  │──POST /confirm────────>│                        │                   │
  │                        │──UPDATE escrow─────────>│ (status=released)
  │                        │──Transfer to seller───>│ (payout)
  │                        │                        │                   │
  │                        │──Notify both───────────>│ (deal complete)
```

### 4.3 Dispute Flow

```
Buyer                   System                   Admin
  │                        │                       │
  │──POST /dispute────────>│                       │
  │   (reason, evidence)   │                       │
  │                        │──UPDATE status───────>│ (status=dispute)
  │<──200 OK───────────────│                       │
  │                        │──Notify admin────────>│
  │                        │                       │
  │                        │   [HUMAN REVIEW]      │
  │                        │   (chat logs,         │
  │                        │    tracking, etc.)    │
  │                        │                       │
  │                        │──RESOLVE─────────────>│ (refund OR release)
  │<──Resolution───────────│<──Resolution──────────│
```

---

## 5. Trust & Verification System

### Verification Tiers

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         VERIFICATION FLOW                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────┐     ┌─────────┐     ┌──────────┐     ┌─────────┐          │
│   │  None   │────>│  Basic  │────>│ Enhanced │────>│ Trusted │          │
│   │ (0%)    │     │  (15%)  │     │  (50%)   │     │ (100%)  │          │
│   └─────────┘     └─────────┘     └──────────┘     └─────────┘          │
│       │               │               │               │                   │
│       │           Phone +         Passport +        10+ deals             │
│       │          Email +        Selfie +           95%+ rating            │
│       │         Bank card       Address                               │
│       │                                                        ✓ Feature │
│       │                                                         listings │
│       │                                                          │
│       └───────────────────────────────────────────────────────────┘       │
│                            FREE TIER                                       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Trust Signals Displayed

| Signal | Source | Display Location |
|--------|--------|-----------------|
| Verification badge | `users.verification_tier` | Listing, profile |
| Successful deals | `users.successful_transactions` | Profile |
| Rating % | `get_seller_rating()` function | Profile, listing |
| Account age | `users.account_created_at` | Profile |
| Last active | `users.last_active_at` | Profile |
| Response time | `messages.avg_response_time` | Profile |

### Anti-Fraud Measures

| Measure | Implementation |
|---------|---------------|
| External links blocking | Regex в сообщениях, триггер на INSERT |
| Phone sharing blocking | NLP в сообщениях |
| Email sharing blocking | Regex в сообщениях |
| Fake reviews prevention | RLS: только после `transactions.escrow_state = 'released'` |
| Escrow | YooKassa hold, ручной release |
| Listing human review | Статус `pending` → модератор → `approved/rejected` |

---

## 6. YooKassa Escrow Flow

### Payment States

```
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌──────────┐    ┌─────────┐
│pending  │───>│  held   │───>│released │    │ refunded │    │cancelled│
│(created)│    │(escrow) │    │(payout) │    │          │    │         │
└─────────┘    └─────────┘    └──────────┘    └──────────┘    └─────────┘
     │              │               │               │             │
     │              │               │               │             │
  Buyer         Buyer          Buyer confirms   Dispute       Before
  initiates    pays           delivery         resolved      payment
```

### YooKassa Integration

```typescript
// Создание платежа с холдом
const payment = await yookassa.createPayment({
  amount: {
    value: `${transaction.amount_rub}.00`,
    currency: 'RUB'
  },
  payment_method_data: {
    type: 'bank_card'
  },
  capture: false,  // Важно: не списывать сразу
  description: `Покупка: ${listing.title}`,
  metadata: {
    transaction_id: transaction.id,
    listing_id: listing.id
  }
});

// YooKassa webhook → подтверждение оплаты
// → UPDATE transactions SET escrow_state = 'held'

// Подтверждение получения товара
await yookassa.capturePayment(payment.id, {
  amount: { value: amount }
});

// Списание с холда → перевод продавцу
```

### Commission Structure

| Участник | Комиссия |
|----------|----------|
| Платформа | 3% от сделки |
| YooKassa | ~2.5% (включено в наш %) |
| Продавец получает | ~97% |

---

## 7. Data Model Summary

### Core Tables

```
users
├── id (UUID)
├── email, phone
├── verification_tier (enum)
├── successful_transactions
├── failed_transactions
└── banned_until

listings
├── id (UUID)
├── seller_id → users
├── title, description, price_rub
├── category (smartphones ONLY - MVP)
├── condition
├── status (draft→pending→approved→sold)
├── verification_photo_url
└── expires_at (30 days)

transactions
├── id (UUID)
├── listing_id → listings
├── buyer_id, seller_id → users
├── amount_rub, platform_fee_rub
├── escrow_state (pending→held→released/refunded)
├── tracking_number, carrier
└── dispute_reason

messages
├── id (UUID)
├── conversation_id
├── sender_id, receiver_id → users
├── content (текст)
├── contains_external_links (boolean)
└── transaction_id, listing_id

ratings
├── id (UUID)
├── transaction_id → transactions
├── rater_id, rated_user_id → users
├── score (1-5)
└── created_at (только после завершения сделки)

listing_reports
├── id (UUID)
├── reporter_id → users
├── listing_id / user_id
├── reason
└── status (pending→investigating→resolved)
```

### Key Constraints

- `ratings.transaction_id` UNIQUE с `rating_type` — один отзыв на сделку
- `transactions.buyer_id != seller_id` — нельзя продать самому себе
- RLS: верифицированные пользователи могут создавать объявления
- RLS: только модераторы могут менять `listings.status`

---

## 8. Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         DEPLOYMENT (NETLIFY + SUPABASE)                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌──────────────────────────────────────────────────────────────────┐    │
│   │                         NETLIFY                                  │    │
│   │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │    │
│   │  │   CDN       │  │  Edge       │  │     Serverless           │ │    │
│   │  │ (Static)    │  │  Functions  │  │     (API Routes)         │ │    │
│   │  │             │  │  (Next.js)  │  │                         │ │    │
│   │  │ • HTML      │  │             │  │ • /api/auth/*           │ │    │
│   │  │ • CSS/JS    │  │ • Rewrite   │  │ • /api/users/*          │ │    │
│   │  │ • Images    │  │ • Auth      │  │ • /api/listings/*      │ │    │
│   │  │             │  │             │  │ • /api/transactions/*   │ │    │
│   │  └─────────────┘  └─────────────┘  └─────────────────────────┘ │    │
│   │                                                                  │    │
│   │  ┌─────────────────────────────────────────────────────────────┐ │    │
│   │  │              Webhooks (YooKassa, SMS, Email)              │ │    │
│   │  └─────────────────────────────────────────────────────────────┘ │    │
│   └──────────────────────────────────────────────────────────────────┘    │
│                                    │                                        │
│                                    ▼                                        │
│   ┌──────────────────────────────────────────────────────────────────┐    │
│   │                         SUPABASE                                  │    │
│   │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │    │
│   │  │  PostgreSQL │  │    Auth     │  │     Realtime            │ │    │
│   │  │             │  │             │  │                         │ │    │
│   │  │ • Tables    │  │ • JWT       │  │ • Messages              │ │    │
│   │  │ • RLS       │  │ • OAuth     │  │ • Notifications         │ │    │
│   │  │ • Functions │  │ • OTP       │  │ • Online status         │ │    │
│   │  │ • Triggers  │  │             │  │                         │ │    │
│   │  └─────────────┘  └─────────────┘  └─────────────────────────┘ │    │
│   │                                                                  │    │
│   │  ┌─────────────┐  ┌─────────────┐                              │    │
│   │  │   Storage  │  │    Edge      │                              │    │
│   │  │  (Images)  │  │  Functions   │                              │    │
│   │  │             │  │  (Database   │                              │    │
│   │  │ • Listings  │  │   Triggers)  │                              │    │
│   │  │ • Profiles  │  │              │                              │    │
│   │  │ • Verif.   │  │              │                              │    │
│   │  └─────────────┘  └──────────────┘                              │    │
│   └──────────────────────────────────────────────────────────────────┘    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

# YooKassa
YOOKASSA_SHOP_ID=xxx
YOOKASSA_SECRET_KEY=xxx
YOOOKASSAWebhook_SECRET=xxx

# Auth
NEXTAUTH_SECRET=xxx
NEXTAUTH_URL=https://trustmarket.netlify.app

# SMS
SMS_API_KEY=xxx

# Email
RESEND_API_KEY=xxx
```

---

## 9. Build Timeline (8 Weeks)

### Week 1-2: Foundation
| Day | Task |
|-----|------|
| 1-3 | Supabase setup, schema deploy, RLS policies |
| 4-5 | Next.js scaffolding, Tailwind, layouts |
| 6-7 | Auth system (NextAuth + OTP) |
| 8-10 | Basic CRUD for users/profiles |
| 11-14 | Listing creation form (draft → submit) |

### Week 3-4: Core Listings
| Day | Task |
|-----|------|
| 15-17 | Listing search + filters (price, condition, city) |
| 18-19 | Image upload to Supabase Storage |
| 20-21 | Listing detail page |
| 22 | User public profile page |
| 23-28 | **MILESTONE: Listings searchable** |

### Week 5-6: Transactions & Escrow
| Day | Task |
|-----|------|
| 29-31 | YooKassa integration (payment creation) |
| 32-33 | Escrow hold flow |
| 34-35 | Delivery confirmation |
| 36-37 | Payout to seller |
| 38 | Dispute flow basics |
| 39-42 | **MILESTONE: First test transaction** |

### Week 7: Trust & Moderation
| Day | Task |
|-----|------|
| 43-44 | Admin dashboard (pending listings) |
| 45-46 | Listing approval workflow |
| 47 | Message system (in-app) |
| 48-49 | External link/phone blocking |
| 50 | Post-transaction ratings |
| 51 | **MILESTONE: Trust signals visible** |

### Week 8: Polish & Launch
| Day | Task |
|-----|------|
| 52-53 | PWA setup (manifest, service worker) |
| 54 | SEO (meta tags, sitemap) |
| 55 | Error handling, loading states |
| 56 | Testing (critical paths) |
| 57 | Bug fixes |
| 58 | **MILESTONE: PRODUCTION LAUNCH** |

---

## 10. MVP Success Metrics

| Metric | Target (Month 1) |
|--------|------------------|
| Listings | 500+ |
| Verified sellers | 100+ |
| Transactions | 50+ |
| GMV | ₽1M+ |
| Fraud rate | 0% |
| Trust rating | 4.5+ |

---

## 11. Out of Scope (Post-MVP)

- [ ] Multi-category electronics (Tablets, laptops → v2)
- [ ] Cities beyond Moscow → v2
- [ ] Mobile apps (native) → v2
- [ ] Real-time chat (websocket) → v2
- [ ] AI fraud detection → v3
- [ ] Insurance program → v3
- [ ] Delivery integration → v3

---

**Document Status:** Ready for Implementation  
**Next Step:** Week 1 tasks begin

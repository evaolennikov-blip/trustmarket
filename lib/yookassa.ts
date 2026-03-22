const SHOP_ID = process.env.YOOKASSA_SHOP_ID!
const SECRET_KEY = process.env.YOOKASSA_SECRET_KEY!
const BASE_URL = 'https://api.yookassa.ru/v3'

function authHeader(): string {
  return 'Basic ' + Buffer.from(`${SHOP_ID}:${SECRET_KEY}`).toString('base64')
}

async function ykFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Authorization': authHeader(),
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`YooKassa ${res.status}: ${text}`)
  }
  return res.json() as Promise<T>
}

export interface YKPayment {
  id: string
  status: 'pending' | 'waiting_for_capture' | 'succeeded' | 'canceled'
  amount: { value: string; currency: string }
  confirmation?: { type: string; confirmation_url?: string }
  captured_at?: string
  metadata?: Record<string, string>
}

export interface CreatePaymentParams {
  amount_rub: number
  description: string
  return_url: string
  idempotency_key: string
  metadata?: Record<string, string>
}

export async function createPayment(params: CreatePaymentParams): Promise<YKPayment> {
  return ykFetch<YKPayment>('/payments', {
    method: 'POST',
    headers: { 'Idempotence-Key': params.idempotency_key },
    body: JSON.stringify({
      amount: { value: params.amount_rub.toFixed(2), currency: 'RUB' },
      capture: false, // hold only — release on buyer confirm
      confirmation: { type: 'redirect', return_url: params.return_url },
      description: params.description,
      metadata: params.metadata ?? {},
    }),
  })
}

export async function capturePayment(paymentId: string, amount_rub: number): Promise<YKPayment> {
  return ykFetch<YKPayment>(`/payments/${paymentId}/capture`, {
    method: 'POST',
    headers: { 'Idempotence-Key': `capture-${paymentId}` },
    body: JSON.stringify({
      amount: { value: amount_rub.toFixed(2), currency: 'RUB' },
    }),
  })
}

export async function cancelPayment(paymentId: string): Promise<YKPayment> {
  return ykFetch<YKPayment>(`/payments/${paymentId}/cancel`, {
    method: 'POST',
    headers: { 'Idempotence-Key': `cancel-${paymentId}` },
    body: JSON.stringify({}),
  })
}

export async function createRefund(paymentId: string, amount_rub: number): Promise<{ id: string; status: string }> {
  return ykFetch('/refunds', {
    method: 'POST',
    headers: { 'Idempotence-Key': `refund-${paymentId}` },
    body: JSON.stringify({
      payment_id: paymentId,
      amount: { value: amount_rub.toFixed(2), currency: 'RUB' },
    }),
  })
}

export async function getPayment(paymentId: string): Promise<YKPayment> {
  return ykFetch<YKPayment>(`/payments/${paymentId}`)
}

/** Verify YooKassa webhook signature (IP-based — allowlist in middleware) */
export function verifyWebhookBody(body: unknown): body is { type: string; object: YKPayment } {
  return (
    typeof body === 'object' &&
    body !== null &&
    'type' in body &&
    'object' in body
  )
}

// @shared

/**
 * Нормализация номера телефона
 * +7 (999) 123-45-67 -> +79991234567
 */
export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 0) return ''
  if (digits.startsWith('7')) return '+' + digits
  if (digits.startsWith('8')) return '+7' + digits.slice(1)
  return '+7' + digits
}

/**
 * Форматирование номера телефона для отображения
 * +79991234567 -> +7 (999) 123-45-67
 */
export function formatPhone(phone: string): string {
  const normalized = normalizePhone(phone).replace('+', '')
  if (normalized.length < 2) return '+7'

  let result = '+7'
  if (normalized.length > 1) result += ' (' + normalized.slice(1, 4)
  if (normalized.length >= 4) result += ')'
  if (normalized.length > 4) result += ' ' + normalized.slice(4, 7)
  if (normalized.length >= 7) result += '-'
  if (normalized.length > 7) result += normalized.slice(7, 9)
  if (normalized.length >= 9) result += '-'
  if (normalized.length > 9) result += normalized.slice(9, 11)

  return result
}

/**
 * Проверка валидности email
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

/**
 * Проверка валидности телефона
 */
export function isValidPhone(phone: string): boolean {
  const normalized = normalizePhone(phone)
  return normalized.length === 12 && normalized.startsWith('+7')
}

/**
 * Интерфейс ответа от API авторизации
 */
export interface AuthResponse {
  ok?: boolean
  success?: boolean
  message?: string
  error?: string
  token?: string
  user?: {
    id: string
    displayName: string
    phone?: string
    email?: string
  }
}

/**
 * Отправить код по SMS
 */
export async function sendSmsCode(phone: string): Promise<AuthResponse> {
  const normalizedPhone = normalizePhone(phone)

  const response = await fetch('/s/auth/sms/init', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone: normalizedPhone })
  })

  return await response.json()
}

/**
 * Подтвердить код SMS
 */
export async function verifySmsCode(
  phone: string,
  code: string,
  stayLoggedIn = true
): Promise<AuthResponse> {
  const normalizedPhone = normalizePhone(phone)

  const response = await fetch('/s/auth/sms/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phone: normalizedPhone,
      code,
      stayLoggedIn
    })
  })

  return await response.json()
}

/**
 * Отправить код по Email
 */
export async function sendEmailCode(email: string): Promise<AuthResponse> {
  const response = await fetch('/s/auth/email/init', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.trim().toLowerCase() })
  })

  return await response.json()
}

/**
 * Подтвердить код Email
 */
export async function verifyEmailCode(
  email: string,
  code: string,
  stayLoggedIn = true
): Promise<AuthResponse> {
  const response = await fetch('/s/auth/email/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: email.trim().toLowerCase(),
      code,
      stayLoggedIn
    })
  })

  return await response.json()
}

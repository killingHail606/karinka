import { createHmac, timingSafeEqual } from 'node:crypto'
import type { H3Event } from 'h3'

export const ADMIN_COOKIE = 'karinka_admin'

/* У куку кладемо не сам пароль, а HMAC від сталої фрази на його ключі.
   Так навіть при витоку куки пароль з неї не дістати, а перевірка
   зводиться до перерахунку того самого значення. */
function tokenFor(password: string) {
  return createHmac('sha256', password).update('karinka-admin-v1').digest('hex')
}

function equal(a: string, b: string) {
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)
  if (bufA.length !== bufB.length) return false
  return timingSafeEqual(bufA, bufB)
}

function adminPassword() {
  const pass = process.env.ADMIN_PASSWORD
  return pass && pass.length > 0 ? pass : null
}

/** Пароль правильний? Якщо ADMIN_PASSWORD не заданий — вхід закритий. */
export function checkPassword(input: string) {
  const pass = adminPassword()
  if (!pass) return false
  return equal(input, pass)
}

export function sessionToken() {
  const pass = adminPassword()
  return pass ? tokenFor(pass) : null
}

export function adminEnabled() {
  return adminPassword() !== null
}

export function requireAdmin(event: H3Event) {
  const expected = sessionToken()
  const got = getCookie(event, ADMIN_COOKIE)

  if (!expected || !got || !equal(got, expected)) {
    throw createError({ statusCode: 401, statusMessage: 'Потрібен вхід' })
  }
}

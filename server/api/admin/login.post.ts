import { ADMIN_COOKIE, adminEnabled, checkPassword, sessionToken } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  if (!adminEnabled()) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Адмінку вимкнено: не задано ADMIN_PASSWORD',
    })
  }

  const body = await readBody<{ password?: unknown }>(event)
  const password = typeof body?.password === 'string' ? body.password : ''

  if (!checkPassword(password)) {
    // Невелика затримка, щоб перебір паролів був повільнішим.
    await new Promise((r) => setTimeout(r, 600))
    throw createError({ statusCode: 401, statusMessage: 'Невірний пароль' })
  }

  setCookie(event, ADMIN_COOKIE, sessionToken()!, {
    httpOnly: true,
    sameSite: 'lax',
    secure: !import.meta.dev,
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  })

  return { ok: true }
})

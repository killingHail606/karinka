import { requireAdmin } from '../../utils/auth'
import { setAnswered } from '../../utils/store'

export default defineEventHandler(async (event) => {
  requireAdmin(event)

  const body = await readBody<{ id?: unknown; answered?: unknown }>(event)
  const id = Number(body?.id)
  const answered = Boolean(body?.answered)

  if (!Number.isInteger(id) || id <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'Невірний id' })
  }

  await setAnswered(id, answered)
  return { ok: true }
})

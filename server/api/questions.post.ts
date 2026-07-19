import { addQuestion } from '../utils/store'

const MAX = 2000

export default defineEventHandler(async (event) => {
  const payload = await readBody<{ body?: unknown }>(event)
  const raw = typeof payload?.body === 'string' ? payload.body.trim() : ''

  if (!raw) {
    throw createError({ statusCode: 400, statusMessage: 'Питання порожнє' })
  }
  if (raw.length > MAX) {
    throw createError({ statusCode: 400, statusMessage: 'Питання задовге' })
  }

  await addQuestion(raw)
  return { ok: true }
})

import { requireAdmin } from '../../utils/auth'
import { listQuestions } from '../../utils/store'

export default defineEventHandler(async (event) => {
  requireAdmin(event)
  return { questions: await listQuestions() }
})

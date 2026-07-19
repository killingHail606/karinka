import pg from 'pg'

export type Question = {
  id: number
  body: string
  createdAt: string
  answered: boolean
}

const CREATE_TABLE = `
  create table if not exists questions (
    id serial primary key,
    body text not null,
    created_at timestamptz not null default now(),
    answered boolean not null default false
  )
`

let pool: pg.Pool | null = null
let ready: Promise<void> | null = null

function getPool() {
  const url = process.env.DATABASE_URL
  if (!url) return null

  if (!pool) {
    // TLS вмикаємо лише коли про це сказано прямо. Всередині приватної
    // мережі Railway Postgres його не використовує, тож вгадувати за іменем
    // хоста — надійний спосіб не підключитися.
    const wantsSsl =
      /[?&]sslmode=(require|verify-ca|verify-full)/.test(url) ||
      process.env.DATABASE_SSL === 'true'

    pool = new pg.Pool({
      connectionString: url,
      ssl: wantsSsl ? { rejectUnauthorized: false } : undefined,
      max: 4,
    })
  }
  return pool
}

async function ensureSchema(p: pg.Pool) {
  if (!ready) ready = p.query(CREATE_TABLE).then(() => undefined)
  return ready
}

/* Без DATABASE_URL тримаємо питання в памʼяті — щоб форму можна було
   крутити локально. Дані при перезапуску зникають, тому голосно попереджаємо. */
const memory: Question[] = []
let memoryId = 0
let warned = false

function warnMemory() {
  if (warned) return
  warned = true
  console.warn(
    '[questions] DATABASE_URL не задано — питання зберігаються лише в памʼяті процесу',
  )
}

export async function addQuestion(body: string): Promise<Question> {
  const p = getPool()
  if (!p) {
    warnMemory()
    const row: Question = {
      id: ++memoryId,
      body,
      createdAt: new Date().toISOString(),
      answered: false,
    }
    memory.unshift(row)
    return row
  }

  await ensureSchema(p)
  const { rows } = await p.query(
    'insert into questions (body) values ($1) returning id, body, created_at, answered',
    [body],
  )
  const r = rows[0]
  return { id: r.id, body: r.body, createdAt: r.created_at.toISOString(), answered: r.answered }
}

export async function listQuestions(): Promise<Question[]> {
  const p = getPool()
  if (!p) {
    warnMemory()
    return memory
  }

  await ensureSchema(p)
  const { rows } = await p.query(
    'select id, body, created_at, answered from questions order by created_at desc limit 500',
  )
  return rows.map((r) => ({
    id: r.id,
    body: r.body,
    createdAt: r.created_at.toISOString(),
    answered: r.answered,
  }))
}

export async function setAnswered(id: number, answered: boolean): Promise<void> {
  const p = getPool()
  if (!p) {
    const row = memory.find((q) => q.id === id)
    if (row) row.answered = answered
    return
  }

  await ensureSchema(p)
  await p.query('update questions set answered = $1 where id = $2', [answered, id])
}

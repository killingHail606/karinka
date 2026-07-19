<script setup lang="ts">
/* Адмінка з питаннями. Дані тягнемо тільки на клієнті після монтування:
   доступ залежить від куки, тож рендерити список на сервері немає сенсу,
   та й дати форматуються в часовому поясі того, хто дивиться. */

type Question = {
  id: number
  body: string
  createdAt: string
  answered: boolean
}

useHead({
  title: 'Питання від Карінки',
  meta: [{ name: 'robots', content: 'noindex, nofollow' }],
})

const questions = ref<Question[]>([])
const authed = ref(false)
const loading = ref(true)
const password = ref('')
const loginError = ref('')
const busy = ref(false)

const unanswered = computed(() => questions.value.filter((q) => !q.answered).length)

const formatter = new Intl.DateTimeFormat('uk-UA', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

function when(iso: string) {
  return formatter.format(new Date(iso))
}

async function load() {
  loading.value = true
  try {
    const res = await $fetch<{ questions: Question[] }>('/api/admin/questions')
    questions.value = res.questions
    authed.value = true
  } catch (err: unknown) {
    const status = (err as { statusCode?: number })?.statusCode
    if (status === 401) authed.value = false
    else loginError.value = 'Не вдалося завантажити питання.'
  } finally {
    loading.value = false
  }
}

async function login() {
  if (busy.value) return
  busy.value = true
  loginError.value = ''

  try {
    await $fetch('/api/admin/login', {
      method: 'POST',
      body: { password: password.value },
    })
    password.value = ''
    await load()
  } catch (err: unknown) {
    const e = err as { statusCode?: number; statusMessage?: string }
    loginError.value =
      e?.statusCode === 503
        ? 'Адмінку вимкнено: на сервері не задано ADMIN_PASSWORD.'
        : 'Невірний пароль.'
  } finally {
    busy.value = false
  }
}

async function toggle(q: Question) {
  const next = !q.answered
  q.answered = next // оптимістично, щоб клік відчувався миттєво
  try {
    await $fetch('/api/admin/answered', {
      method: 'POST',
      body: { id: q.id, answered: next },
    })
  } catch {
    q.answered = !next
  }
}

onMounted(load)
</script>

<template>
  <div class="admin">
    <div class="wrap admin__inner">
      <header class="admin__head">
        <p class="eyebrow">адмінка</p>
        <h1 class="admin__title display">Питання</h1>
      </header>

      <p v-if="loading" class="admin__muted">Завантажую…</p>

      <!-- вхід -->
      <form v-else-if="!authed" class="login" @submit.prevent="login">
        <label class="login__label" for="pass">Пароль</label>
        <input
          id="pass"
          v-model="password"
          class="login__field"
          type="password"
          autocomplete="current-password"
          :disabled="busy"
        />
        <button class="login__btn" type="submit" :disabled="busy || !password">
          {{ busy ? 'Перевіряю…' : 'Увійти' }}
        </button>
        <p v-if="loginError" class="login__error" role="alert">{{ loginError }}</p>
      </form>

      <!-- список -->
      <template v-else>
        <p class="admin__summary">
          Усього: <strong>{{ questions.length }}</strong>
          <span v-if="unanswered"> · без відповіді: <strong>{{ unanswered }}</strong></span>
          <button class="admin__refresh" type="button" @click="load">оновити</button>
        </p>

        <p v-if="!questions.length" class="admin__muted admin__empty">
          Питань поки немає. Щойно Карінка щось спитає — воно зʼявиться тут.
        </p>

        <ul v-else class="qlist">
          <li v-for="q in questions" :key="q.id" class="q" :class="{ 'q--done': q.answered }">
            <div class="q__meta">
              <time :datetime="q.createdAt">{{ when(q.createdAt) }}</time>
              <button class="q__toggle" type="button" @click="toggle(q)">
                {{ q.answered ? '✓ відповів' : 'позначити' }}
              </button>
            </div>
            <p class="q__body">{{ q.body }}</p>
          </li>
        </ul>
      </template>
    </div>
  </div>
</template>

<style scoped>
.admin {
  min-height: 100dvh;
  padding-block: clamp(2.5rem, 7vw, 5rem);
}

.admin__inner {
  width: min(46rem, 100%);
}

.admin__title {
  margin-top: 0.4rem;
  font-size: var(--step-2);
  color: var(--fir);
}

.admin__muted {
  margin-top: 1.5rem;
  color: var(--fir-soft);
}

.admin__empty {
  padding: 2rem 1.4rem;
  background: var(--plaster-deep);
  border-radius: var(--radius);
  text-align: center;
}

.admin__summary {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1.6rem;
  color: var(--fir-soft);
  font-size: 0.92rem;
}

.admin__refresh {
  margin-left: auto;
  font: inherit;
  color: var(--tile);
  background: none;
  border: none;
  padding: 0.2rem 0.4rem;
  cursor: pointer;
  text-decoration: underline;
}

/* вхід */
.login {
  max-width: 22rem;
  margin-top: 2rem;
}

.login__label {
  display: block;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--fir-soft);
}

.login__field {
  width: 100%;
  margin-top: 0.5rem;
  padding: 0.85rem 1rem;
  font-family: var(--font-body);
  font-size: 1rem;
  color: var(--fir);
  background: var(--plaster-deep);
  border: 2px solid transparent;
  border-radius: var(--radius);
}

.login__field:focus-visible {
  outline: none;
  border-color: var(--tile);
}

.login__btn {
  margin-top: 0.9rem;
  font-family: var(--font-body);
  font-size: 1rem;
  font-weight: 600;
  color: var(--plaster);
  background: var(--fir);
  border: none;
  border-radius: 999px;
  padding: 0.8rem 1.8rem;
  cursor: pointer;
}

.login__btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.login__error {
  margin-top: 0.8rem;
  color: var(--tile);
  font-size: 0.92rem;
}

/* список */
.qlist {
  list-style: none;
  margin: 1.5rem 0 0;
  padding: 0;
  display: grid;
  gap: 1rem;
}

.q {
  padding: 1.2rem 1.35rem;
  background: var(--plaster-deep);
  border-radius: var(--radius);
  border-left: 5px solid var(--tile);
}

.q--done {
  border-left-color: var(--sage);
  opacity: 0.72;
}

.q__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  font-size: 0.78rem;
  color: var(--fir-soft);
}

.q__toggle {
  font: inherit;
  color: var(--fir);
  background: var(--plaster);
  border: none;
  border-radius: 999px;
  padding: 0.35rem 0.8rem;
  cursor: pointer;
}

.q__toggle:hover {
  background: #fff;
}

.q__body {
  margin-top: 0.6rem;
  color: var(--fir);
  line-height: 1.6;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
</style>

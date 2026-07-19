<script setup lang="ts">
/* Відповідь. «Так» осипає екран черепицею з тих самих дахів. */

type State = 'asking' | 'yes' | 'questions'

const state = ref<State>('asking')
const tiles = ref<{ id: number; left: number; delay: number; dur: number; rot: number }[]>([])

let nextId = 0

function shower() {
  if (import.meta.server) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  tiles.value = Array.from({ length: 44 }, () => ({
    id: nextId++,
    left: Math.random() * 100,
    delay: Math.random() * 900,
    dur: 2600 + Math.random() * 1800,
    rot: Math.random() * 360,
  }))

  setTimeout(() => {
    tiles.value = []
  }, 5600)
}

const { celebrate } = useBruno()

function sayYes() {
  state.value = 'yes'
  shower()
  celebrate() // радіють усі Бруно на сторінці, не тільки цей
}

/* Форма питання */
const question = ref('')
const sending = ref(false)
const sent = ref(false)
const sendError = ref('')

const MAX = 2000
const left = computed(() => MAX - question.value.length)

async function sendQuestion() {
  const text = question.value.trim()
  if (!text || sending.value) return

  sending.value = true
  sendError.value = ''

  try {
    await $fetch('/api/questions', { method: 'POST', body: { body: text } })
    sent.value = true
    question.value = ''
  } catch {
    sendError.value = 'Не вдалося надіслати. Спробуй ще раз або просто напиши мені.'
  } finally {
    sending.value = false
  }
}

function askAnother() {
  sent.value = false
  sendError.value = ''
}
</script>

<template>
  <section class="rsvp" aria-labelledby="rsvp-title">
    <div class="wrap rsvp__inner">
      <p class="eyebrow">відповідь</p>

      <h2 id="rsvp-title" class="rsvp__title hand">
        Карінко, домовились?
      </h2>

      <p class="rsvp__note prose">
        Автобус, зустріч у Сучаві й дорога — усе на мені. Тобі лишається
        зібрати валізу і не забути зарядку.
      </p>

      <div class="rsvp__bear">
        <BrasovBear
          :pose="state === 'yes' ? 'happy' : 'sign'"
          sign="скажи так"
          width="min(52vw, 210px)"
          greeting="ну скажи так"
          :lines="['скажи так', 'я чекаю', 'ну будь ласка', 'валізу вже склала?']"
        />
      </div>

      <div v-if="state !== 'yes'" class="rsvp__actions">
        <button class="btn btn--yes" type="button" @click="sayYes">
          Так, я приїду
        </button>
        <button class="btn btn--ask" type="button" @click="state = 'questions'">
          У мене є питання
        </button>
      </div>

      <div v-if="state === 'questions'" class="ask">
        <p class="rsvp__reply prose">
          Питай будь-що — автобус, кордон, скільки днів, що брати з собою.
          Напиши тут, і я побачу.
        </p>

        <form v-if="!sent" class="ask__form" @submit.prevent="sendQuestion">
          <label class="visually-hidden" for="question">Твоє питання</label>
          <textarea
            id="question"
            v-model="question"
            class="ask__field"
            rows="4"
            :maxlength="MAX"
            placeholder="Наприклад: скільки днів мене не буде і що взяти з собою?"
            :disabled="sending"
          />

          <div class="ask__row">
            <!-- лічильник зʼявляється тільки коли ліміт справді близько -->
            <span v-if="left < 200" class="ask__counter" :class="{ 'is-low': left < 50 }">
              лишилось {{ left }}
            </span>
            <span v-else />
            <button
              class="btn btn--yes ask__send"
              type="submit"
              :disabled="sending || !question.trim()"
            >
              {{ sending ? 'Надсилаю…' : 'Надіслати питання' }}
            </button>
          </div>

          <p v-if="sendError" class="ask__error" role="alert">{{ sendError }}</p>
        </form>

        <div v-else class="ask__done" role="status">
          <p class="ask__thanks hand">Отримав!</p>
          <p class="prose ask__after">
            Відповім, щойно побачу. А Бруно вже побіг думати над відповіддю.
          </p>
          <button class="btn btn--ask ask__more" type="button" @click="askAnother">
            Спитати ще
          </button>
        </div>
      </div>

      <div v-if="state === 'yes'" class="rsvp__confirmed" role="status">
        <p class="rsvp__date display">30.07 · 23:30</p>
        <p class="rsvp__yes hand">Тоді до зустрічі в Сучаві</p>
        <p class="prose rsvp__after">
          Я виїду раніше, щоб точно бути на місці до твого автобуса. Кава на
          тебе вже замовлена, Бруно попереджений.
        </p>
      </div>
    </div>

    <div class="tiles" aria-hidden="true">
      <span
        v-for="t in tiles"
        :key="t.id"
        class="tile"
        :style="{
          left: `${t.left}%`,
          animationDelay: `${t.delay}ms`,
          animationDuration: `${t.dur}ms`,
          '--rot': `${t.rot}deg`,
        }"
      />
    </div>
  </section>
</template>

<style scoped>
.rsvp {
  position: relative;
  overflow: hidden;
  background: var(--fir);
  color: var(--plaster);
  padding-block: clamp(4rem, 10vw, 8rem);
}

.rsvp__inner {
  text-align: center;
}

.rsvp .eyebrow {
  color: var(--sage);
}

.rsvp__title {
  margin-top: 0.75rem;
  font-size: clamp(2.6rem, 8vw, 5.5rem);
  color: var(--plaster);
}

.rsvp__note {
  margin: 1.1rem auto 0;
  color: #cfdcd0;
}

.rsvp__bear {
  display: flex;
  justify-content: center;
  margin-top: 1.8rem;
}

.rsvp__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.85rem;
  margin-top: 2.4rem;
}

.btn {
  font-family: var(--font-body);
  font-size: 1rem;
  font-weight: 600;
  padding: 0.95rem 1.9rem;
  border-radius: 999px;
  border: 2px solid transparent;
  cursor: pointer;
  transition: transform 200ms ease, background-color 200ms ease, color 200ms ease;
}

.btn--yes {
  background: var(--ochre);
  color: var(--fir);
}

.btn--yes:hover {
  transform: translateY(-3px) rotate(-1.2deg);
  background: #f2c469;
}

.btn--ask {
  background: transparent;
  color: var(--plaster);
  border-color: rgba(253, 242, 236, 0.35);
}

.btn--ask:hover {
  background: rgba(253, 242, 236, 0.09);
}

.rsvp__reply {
  margin: 1.8rem auto 0;
  color: #cfdcd0;
}

.ask {
  margin-top: 0.4rem;
}

.ask__form {
  max-width: 34rem;
  margin: 1.2rem auto 0;
  text-align: left;
}

.ask__field {
  width: 100%;
  padding: 1rem 1.1rem;
  font-family: var(--font-body);
  font-size: 1rem;
  line-height: 1.55;
  color: var(--fir);
  background: var(--plaster);
  border: 2px solid transparent;
  border-radius: var(--radius);
  resize: vertical;
}

.ask__field::placeholder {
  color: var(--fir-soft);
  opacity: 0.85;
}

.ask__field:focus-visible {
  outline: none;
  border-color: var(--ochre);
}

.ask__field:disabled {
  opacity: 0.6;
}

.ask__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 0.85rem;
}

.ask__counter {
  font-family: var(--font-body);
  font-size: 0.82rem;
  color: #9fb3a4;
}

.ask__counter.is-low {
  color: var(--ochre);
}

.ask__send:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.ask__error {
  margin-top: 0.8rem;
  font-size: 0.92rem;
  color: var(--ochre);
}

.ask__done {
  margin-top: 1.6rem;
  animation: settle 600ms cubic-bezier(0.22, 1, 0.36, 1) both;
}

.ask__thanks {
  font-size: clamp(2rem, 5vw, 3rem);
  color: var(--plaster);
}

.ask__after {
  margin: 0.4rem auto 0;
  color: #cfdcd0;
}

.ask__more {
  margin-top: 1.2rem;
}

.rsvp__confirmed {
  margin-top: 2.4rem;
  animation: settle 700ms cubic-bezier(0.22, 1, 0.36, 1) both;
}

.rsvp__date {
  font-size: var(--step-2);
  color: var(--ochre);
  letter-spacing: 0.08em;
}

.rsvp__yes {
  margin-top: 0.4rem;
  font-size: clamp(2rem, 5.5vw, 3.4rem);
  color: var(--plaster);
}

.rsvp__after {
  margin: 1.1rem auto 0;
  color: #cfdcd0;
}

@keyframes settle {
  from {
    transform: translateY(16px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.tiles {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.tile {
  position: absolute;
  top: -6%;
  width: 15px;
  height: 11px;
  border-radius: 3px 3px 1px 1px;
  background: var(--tile);
  animation-name: fall;
  animation-timing-function: linear;
  animation-fill-mode: both;
}

.tile:nth-child(3n) {
  background: var(--ochre);
}

.tile:nth-child(4n) {
  background: var(--rose);
}

@keyframes fall {
  from {
    transform: translateY(0) rotate(var(--rot, 0deg));
    opacity: 1;
  }
  to {
    transform: translateY(115vh) rotate(calc(var(--rot, 0deg) + 540deg));
    opacity: 0.85;
  }
}
</style>

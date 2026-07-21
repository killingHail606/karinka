<script setup lang="ts">
/* Відлік як лічилка: рівно 10 ялинок — останні десять днів до автобуса.
   День, що минув, замальовуємо; сьогоднішній світиться; майбутні — контуром.
   Ціль — момент, коли Карінка сідає в автобус.
   Рахуємо тільки на клієнті, щоб розмітка сервера й браузера збігалась. */

const TARGET = new Date('2026-07-30T21:00:00+03:00')
const WINDOW = 10 // скільки ялинок-днів показуємо

const days = ref<number | null>(null)
const hours = ref(0)
const minutes = ref(0)
const now = ref<number>(TARGET.getTime()) // мітка «зараз», оновлюється клієнтом

let timer: ReturnType<typeof setInterval> | undefined

function tick() {
  now.value = Date.now()
  const ms = TARGET.getTime() - now.value
  if (ms <= 0) {
    days.value = 0
    hours.value = 0
    minutes.value = 0
    return
  }
  days.value = Math.floor(ms / 86_400_000)
  hours.value = Math.floor(ms / 3_600_000) % 24
  minutes.value = Math.floor(ms / 60_000) % 60
}

onMounted(() => {
  tick()
  timer = setInterval(tick, 30_000)
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})

function pluralDays(n: number) {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return 'день'
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'дні'
  return 'днів'
}

const label = computed(() => {
  if (days.value === null) return ' ' // тримає висоту рядка до гідратації
  if (days.value === 0) return 'сьогодні!'
  return `${days.value} ${pluralDays(days.value)}`
})

const dateFmt = new Intl.DateTimeFormat('uk-UA', { day: 'numeric', month: 'long' })

function startOfDay(ms: number) {
  const d = new Date(ms)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

type FirState = 'past' | 'today' | 'future'
interface Fir {
  n: number
  state: FirState
  isTarget: boolean
  date: string
  aria: string
  speak: string // коротка репліка, яку промовляє Бруно
}

/* Десять ялинок: остання (n=10) — сам день автобуса, перша (n=1) — за 9 днів
   до нього. Кожна знає свою дату, свій стан і те, що Бруно про неї скаже. */
const firs = computed<Fir[]>(() => {
  if (days.value === null) return []
  const today = startOfDay(now.value)
  const target = startOfDay(TARGET.getTime())
  const list: Fir[] = []
  for (let n = 1; n <= WINDOW; n++) {
    const firDay = target - (WINDOW - n) * 86_400_000
    const state: FirState = firDay < today ? 'past' : firDay > today ? 'future' : 'today'
    const isTarget = n === WINDOW
    const date = dateFmt.format(new Date(firDay))

    let aria: string
    let speak: string
    if (isTarget) {
      aria = state === 'future' ? `${date} — твій автобус` : `${date} — автобус!`
      speak = state === 'future' ? `${date} 🚌` : 'автобус! 🚌'
    } else if (state === 'today') {
      aria = `${date} — сьогодні`
      speak = `${date} — тут я!`
    } else if (state === 'past') {
      aria = `${date} — вже позаду`
      speak = `${date} 🐾`
    } else {
      aria = date
      speak = date
    }
    list.push({ n, state, isTarget, date, aria, speak })
  }
  return list
})

const passed = computed(() => firs.value.filter((f) => f.state === 'past').length)
const todayN = computed(() => firs.value.find((f) => f.state === 'today')?.n ?? null)

/* Скільки шляху Бруно вже пройшов — заливка стежки під ялинками. */
const progress = computed(() => {
  if (days.value === null) return 0
  const done = passed.value + (todayN.value !== null ? 1 : 0)
  return Math.max(0, Math.min(100, (done / WINDOW) * 100))
})

/* Де стоїть Бруно: над сьогоднішньою ялинкою. До вікна — на старті,
   після від'їзду — у кінці. Трохи підтиснуто від країв, щоб не звисав. */
const markerPos = computed(() => {
  if (days.value === null) return 6
  let n: number
  if (todayN.value !== null) n = todayN.value
  else if (passed.value >= WINDOW) n = WINDOW
  else n = 0
  const pos = ((n - 0.5) / WINDOW) * 100
  return Math.max(6, Math.min(94, pos))
})

// Бруно-маркер, що крокує над ялинками; вміє промовляти репліки.
const bear = ref<{ say: (text: string, ms?: number) => void } | null>(null)
const active = ref<number | null>(null)

function announce(f: Fir) {
  bear.value?.say(f.speak, 2200)
}

// Тап по ялинці (тач): підсвічуємо й змушуємо Бруно сказати дату.
function pin(f: Fir) {
  active.value = active.value === f.n ? null : f.n
  announce(f)
}
</script>

<template>
  <section class="countdown wrap" aria-labelledby="countdown-title">
    <p class="eyebrow">скільки лишилось до твого автобуса</p>

    <div class="countdown__crown">
      <svg class="spark spark--l" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 0 L14.5 9.5 L24 12 L14.5 14.5 L12 24 L9.5 14.5 L0 12 L9.5 9.5 Z" />
      </svg>
      <h2 id="countdown-title" class="countdown__title display">{{ label }}</h2>
      <svg class="spark spark--r" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 0 L14.5 9.5 L24 12 L14.5 14.5 L12 24 L9.5 14.5 L0 12 L9.5 9.5 Z" />
      </svg>
    </div>

    <p v-if="days !== null && days > 0" class="countdown__sub">
      і ще {{ hours }} год {{ minutes }} хв. Останні десять днів — десять ялинок;
      кожну, що минула, я замальовую.
    </p>
    <p v-else-if="days === 0" class="countdown__sub">
      Сьогодні ти сідаєш в автобус. Всі ялинки замальовані — я вже не можу
      всидіти на місці.
    </p>

    <div class="firs-scene" :style="{ '--progress': `${progress}%` }">
      <!-- Бруно крокує понад ялинками й зупиняється на сьогоднішній -->
      <div class="firs__walker" :style="{ left: `${markerPos}%` }">
        <span class="firs__walker-bob">
          <BrasovBear
            ref="bear"
            pose="idle"
            width="clamp(48px, 14vw, 66px)"
            greeting="я дійду разом з тобою"
            :lines="['я тут', 'ще трохи', 'йдемо!', 'мур']"
          />
        </span>
      </div>

      <div class="firs" role="group" :aria-label="`Останні 10 днів, ${passed} вже позаду`">
        <span class="firs__road" aria-hidden="true"></span>
        <span class="firs__road firs__road--done" aria-hidden="true"></span>

        <button v-for="f in firs" :key="f.n" type="button" class="fir"
          :class="[`is-${f.state}`, { 'is-target': f.isTarget, 'is-active': active === f.n }]"
          :style="{ '--d': `${f.n * 60}ms` }" :aria-label="f.aria"
          @click="pin(f)"
          @mouseenter="announce(f)" @focus="announce(f)">
          <svg class="fir__svg" viewBox="0 0 24 40" aria-hidden="true">
            <polygon v-if="f.isTarget" class="fir__star"
              points="12,0 13.4,4 17.5,4 14.2,6.6 15.4,10.6 12,8.2 8.6,10.6 9.8,6.6 6.5,4 10.6,4" />
            <g class="fir__shape">
              <polygon points="12,7 20,21 4,21" />
              <polygon points="12,16 22,33 2,33" />
              <rect x="10.5" y="32" width="3" height="7" rx="1.2" />
            </g>
          </svg>
        </button>
      </div>

      <MarginNote text="він проведе тебе" :rotate="-3" arrow="none" />
    </div>
  </section>
</template>

<style scoped>
.countdown {
  padding-block: clamp(3.5rem, 9vw, 7rem);
  text-align: center;
}

.countdown__crown {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: clamp(0.5rem, 2vw, 1.2rem);
}

.countdown__title {
  font-size: var(--step-3);
  color: var(--fir);
  min-height: 1.1em;
}

.spark {
  width: clamp(16px, 3vw, 30px);
  height: auto;
  flex: none;
  fill: var(--ochre);
  animation: twinkle 2.6s ease-in-out infinite;
}

.spark--r {
  animation-delay: 1.3s;
}

.countdown__sub {
  margin: 0.9rem auto 0;
  max-width: 28rem;
  color: var(--fir-soft);
}

/* Сцена: Бруно крокує зверху, під ним — стежка з ялинок. */
.firs-scene {
  position: relative;
  max-width: 34rem;
  margin: 0 auto;
  padding-top: clamp(5rem, 16vw, 6.5rem); /* місце для Бруно над рядком */
}

.firs {
  position: relative;
  display: flex;
  flex-wrap: nowrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: clamp(0.15rem, 1vw, 0.5rem);
}

/* сама стежка під ялинками — дорога, якою Бруно вже пройшов */
.firs__road {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 3px;
  height: 3px;
  border-radius: 3px;
  background: repeating-linear-gradient(
    90deg,
    var(--sage) 0 8px,
    transparent 8px 15px
  );
  opacity: 0.6;
  z-index: 0;
}

.firs__road--done {
  right: auto;
  width: var(--progress, 0%);
  background: var(--tile);
  opacity: 1;
  transition: width 0.7s cubic-bezier(0.22, 1, 0.36, 1);
}

.fir {
  position: relative;
  z-index: 1;
  flex: 1 1 0;
  min-width: 0;
  display: flex;
  justify-content: center;
  appearance: none;
  border: 0;
  padding: 0.35rem 0 0.6rem;
  background: none;
  cursor: pointer;
  line-height: 0;
  animation: sprout 520ms cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: var(--d, 0ms);
  transition: transform 0.25s cubic-bezier(0.22, 1, 0.36, 1);
}

.fir__svg {
  width: clamp(22px, 4.4vw, 38px);
  height: auto;
  display: block;
}

.fir__shape {
  fill: var(--fir);
  transition: fill 0.4s ease, stroke 0.4s ease, opacity 0.4s ease;
}

/* Майбутні дні — ще порожній контур, чекають своєї черги. */
.fir.is-future .fir__shape {
  fill: none;
  stroke: var(--sage);
  stroke-width: 1.4;
  opacity: 0.55;
}

/* Дні, що минули, — замальовані. */
.fir.is-past .fir__shape {
  fill: var(--fir);
}

/* Сьогодні — тепла ялинка, що ледь дихає. */
.fir.is-today .fir__shape {
  fill: var(--ochre);
  animation: breathe 3s ease-in-out infinite;
}

/* Ялинка від'їзду — теракотова, із зіркою-топером. */
.fir.is-target.is-today .fir__shape,
.fir.is-target.is-past .fir__shape {
  fill: var(--tile);
}

.fir__star {
  fill: var(--ochre);
  opacity: 0;
  transform-box: fill-box;
  transform-origin: center;
  transition: opacity 0.4s ease;
}

.fir.is-target .fir__star {
  opacity: 1;
  animation: twinkle 2.6s ease-in-out infinite;
}

/* Наведення / фокус / тап — легке похитування й підняття. */
.fir:hover,
.fir:focus-visible,
.fir.is-active {
  transform: translateY(-4px);
  outline: none;
}

.fir:hover .fir__shape,
.fir:focus-visible .fir__shape,
.fir.is-active .fir__shape {
  opacity: 1;
}

/* Бруно-ходок: тримається над «сьогоднішньою» ялинкою й плавно
   переїжджає до наступної, коли минає день. */
.firs__walker {
  position: absolute;
  top: 0;
  transform: translateX(-50%);
  z-index: 2;
  transition: left 0.7s cubic-bezier(0.22, 1, 0.36, 1);
  pointer-events: auto;
}

.firs__walker-bob {
  display: block;
  animation: walk-bob 2.4s ease-in-out infinite;
}

/* приписка «він проведе тебе» — трохи нижче й праворуч від рядка */
.firs-scene :deep(.note) {
  margin-top: 1.4rem;
}

@keyframes walk-bob {
  0%,
  100% {
    transform: translateY(0) rotate(-1.5deg);
  }
  50% {
    transform: translateY(-5px) rotate(1.5deg);
  }
}

@keyframes sprout {
  from {
    transform: translateY(10px) scale(0.6);
    opacity: 0;
  }
  to {
    transform: translateY(0) scale(1);
    opacity: 0.9;
  }
}

@keyframes twinkle {
  0%,
  100% {
    transform: scale(0.75) rotate(0deg);
    opacity: 0.5;
  }
  50% {
    transform: scale(1.15) rotate(45deg);
    opacity: 1;
  }
}

@keyframes breathe {
  0%,
  100% {
    opacity: 0.85;
  }
  50% {
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .spark,
  .fir,
  .fir.is-today .fir__shape,
  .fir.is-target .fir__star,
  .firs__walker-bob {
    animation: none;
  }

  .fir,
  .firs__walker,
  .firs__road--done {
    transition: none;
  }
}
</style>

<script setup lang="ts">
/* Відлік як лічилка: одна ялинка — один день, що лишився.
   Ціль — момент, коли Карінка сідає в автобус.
   Рахуємо тільки на клієнті, щоб розмітка сервера й браузера збігалась. */

const TARGET = new Date('2026-07-30T23:30:00+03:00')

const days = ref<number | null>(null)
const hours = ref(0)
const minutes = ref(0)

let timer: ReturnType<typeof setInterval> | undefined

function tick() {
  const ms = TARGET.getTime() - Date.now()
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

const firs = computed(() => (days.value === null ? 0 : Math.min(days.value, 90)))
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
      і ще {{ hours }} год {{ minutes }} хв. Кожна ялинка — один день, який я
      чекаю.
    </p>
    <p v-else-if="days === 0" class="countdown__sub">
      Сьогодні ти сідаєш в автобус. Я вже не можу всидіти на місці.
    </p>

    <div class="firs" role="img" :aria-label="`Залишилось ${label}`">
      <svg v-for="i in firs" :key="i" class="fir" :style="{ '--d': `${i * 28}ms` }"
        viewBox="0 0 24 34" aria-hidden="true">
        <polygon points="12,1 20,15 4,15" />
        <polygon points="12,10 22,27 2,27" />
        <rect x="10.5" y="26" width="3" height="7" rx="1.2" />
      </svg>
    </div>

    <div class="countdown__bear">
      <BrasovBear
        pose="idle"
        width="min(30vw, 108px)"
        :lines="['я рахую', 'ще трохи', 'не збивай!', 'скільки там?']"
      />
      <MarginNote text="він теж рахує" :rotate="4" arrow="left" />
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

.firs {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.55rem 0.4rem;
  margin-top: 2.5rem;
}

.fir {
  width: clamp(18px, 2.6vw, 26px);
  height: auto;
  fill: var(--fir);
  opacity: 0.9;
  animation: sprout 520ms cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: var(--d, 0ms);
}

/* Остання ялинка — теракотова: це вже сам день від'їзду. */
.fir:last-child {
  fill: var(--tile);
  opacity: 1;
}

.countdown__bear {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1.6rem;
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

@media (prefers-reduced-motion: reduce) {
  .spark {
    animation: none;
  }
}
</style>

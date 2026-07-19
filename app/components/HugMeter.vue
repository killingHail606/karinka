<script setup lang="ts">
/* Обійми наперед. Нічого не робить — і в цьому вся суть. */

const hugs = ref(0)
const squeezing = ref(false)
const hearts = ref<{ id: number; dx: number; rot: number; scale: number }[]>([])

let release: ReturnType<typeof setTimeout> | undefined
let nextId = 0

function hug() {
  hugs.value++
  squeezing.value = true
  if (release) clearTimeout(release)
  release = setTimeout(() => {
    squeezing.value = false
  }, 620)

  const batch = Array.from({ length: 3 }, () => ({
    id: nextId++,
    dx: Math.round((Math.random() - 0.5) * 120),
    rot: Math.round((Math.random() - 0.5) * 50),
    scale: 0.7 + Math.random() * 0.6,
  }))
  hearts.value.push(...batch)

  const ids = new Set(batch.map((h) => h.id))
  setTimeout(() => {
    hearts.value = hearts.value.filter((h) => !ids.has(h.id))
  }, 1800)
}

onBeforeUnmount(() => {
  if (release) clearTimeout(release)
})

function pluralHugs(n: number) {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return 'обійми'
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'обійми'
  return 'обіймів'
}

const caption = computed(() => {
  if (hugs.value === 0) return 'Бруно чекає'
  if (hugs.value === 1) return 'Одні обійми надіслано'
  if (hugs.value < 10) return `${hugs.value} ${pluralHugs(hugs.value)} надіслано`
  if (hugs.value < 30) return `${hugs.value} обіймів. Бруно вже щасливий`
  return `${hugs.value}. Ну все, він розтанув`
})
</script>

<template>
  <section class="hugs" aria-labelledby="hugs-title">
    <div class="wrap hugs__inner">
      <h2 id="hugs-title" class="hugs__title hand">Поки що — так</h2>
      <p class="prose hugs__text">
        До твого автобуса ще ціла купа днів, а обійняти тебе хочеться вже зараз.
        Тримай авансом, скільки треба — у Бруно необмежений запас.
      </p>

      <div class="hugs__stage">
        <div class="hugs__bear" :class="{ 'is-squeezing': squeezing }">
          <BrasovBear
            pose="hug"
            width="min(46vw, 190px)"
            :lines="['ще!', 'обіймашки', 'мнякий', 'не відпускай']"
          />
        </div>

        <svg
          v-for="h in hearts"
          :key="h.id"
          class="hugs__heart"
          viewBox="0 0 24 22"
          aria-hidden="true"
          :style="{ '--dx': `${h.dx}px`, '--rot': `${h.rot}deg`, '--s': h.scale }"
        >
          <path
            d="M12 21 C 3 14 1 9 1 6.5 A 5.5 5.5 0 0 1 12 4.5 A 5.5 5.5 0 0 1 23 6.5 C 23 9 21 14 12 21 Z"
          />
        </svg>
      </div>

      <button class="hugs__btn" type="button" @click="hug">
        Обійняти
      </button>

      <p class="hugs__count" role="status" aria-live="polite">{{ caption }}</p>
    </div>
  </section>
</template>

<style scoped>
.hugs {
  background: var(--plaster-deep);
  padding-block: clamp(3.5rem, 9vw, 6rem);
}

.hugs__inner {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.hugs__title {
  font-size: clamp(2.2rem, 6vw, 3.4rem);
  color: var(--fir);
}

.hugs__text {
  margin-top: 0.6rem;
  color: var(--fir);
  opacity: 0.75;
}

.hugs__stage {
  position: relative;
  margin-top: 1.5rem;
}

.hugs__bear {
  transition: transform 260ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

.hugs__heart {
  position: absolute;
  left: 50%;
  top: 18%;
  width: 26px;
  height: auto;
  fill: var(--tile);
  pointer-events: none;
  animation: float-up 1.7s ease-out forwards;
}

@keyframes float-up {
  0% {
    opacity: 0;
    transform: translate(-50%, 0) scale(0.3) rotate(0deg);
  }
  20% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: translate(calc(-50% + var(--dx, 0px)), -150px)
      scale(var(--s, 1)) rotate(var(--rot, 0deg));
  }
}

@media (prefers-reduced-motion: reduce) {
  .hugs__heart {
    animation-duration: 1ms;
  }
}

.hugs__bear.is-squeezing {
  transform: scale(1.12) rotate(-3deg);
}

.hugs__btn {
  margin-top: 1.4rem;
  font-family: var(--font-body);
  font-size: 1rem;
  font-weight: 600;
  color: var(--plaster);
  background: var(--tile);
  border: none;
  border-radius: 999px;
  padding: 0.9rem 2.2rem;
  cursor: pointer;
  transition: transform 160ms cubic-bezier(0.34, 1.56, 0.64, 1), background-color 200ms ease;
}

.hugs__btn:hover {
  background: #d2624c;
  transform: translateY(-2px);
}

.hugs__btn:active {
  transform: scale(0.94);
}

.hugs__count {
  margin-top: 0.9rem;
  font-family: var(--font-hand);
  font-size: 1.45rem;
  color: var(--tile);
  min-height: 1.5em;
}
</style>

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

function sayYes() {
  state.value = 'yes'
  shower()
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

      <p v-if="state === 'questions'" class="rsvp__reply prose" role="status">
        Питай будь-що і будь-коли — на все відповім. Автобус, кордон, скільки
        днів, що брати з собою. А поки просто знай: я дуже чекаю.
      </p>

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

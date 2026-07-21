<script setup lang="ts">
/* Перемикач теми: сонце вдень — місяць уночі. Кнопка їде по «небу»,
   удень навколо неї крутяться промені й пливуть хмаринки, а вночі
   замість них засвічуються зорі. Саме перемикання (кругове розкриття)
   живе в useTheme. */

const { isDark, toggle } = useTheme()

// Промені сонця — вісім, рівномірно по колу.
const rays = Array.from({ length: 8 }, (_, i) => i * 45)

// Зорі нічного неба: позиція в px усередині доріжки + розмір і затримка.
const stars = [
  { x: 12, y: 10, s: 2.4, d: 0 },
  { x: 20, y: 22, s: 1.6, d: 600 },
  { x: 30, y: 8, s: 1.8, d: 300 },
  { x: 15, y: 26, s: 1.4, d: 900 },
  { x: 26, y: 16, s: 1.3, d: 1200 },
]
</script>

<template>
  <button
    class="tt"
    :class="{ 'tt--dark': isDark }"
    type="button"
    role="switch"
    :aria-checked="isDark"
    aria-label="Перемкнути тему: світла та темна"
    @click="toggle"
  >
    <span class="tt__track">
      <!-- зорі — проявляються вночі -->
      <span class="tt__stars" aria-hidden="true">
        <i
          v-for="(st, i) in stars"
          :key="i"
          class="tt__star"
          :style="{
            left: `${st.x}px`,
            top: `${st.y}px`,
            width: `${st.s}px`,
            height: `${st.s}px`,
            animationDelay: `${st.d}ms`,
          }"
        />
      </span>

      <!-- хмаринки — пливуть удень -->
      <span class="tt__clouds" aria-hidden="true">
        <i class="tt__cloud tt__cloud--a" />
        <i class="tt__cloud tt__cloud--b" />
      </span>

      <!-- сонце, що стає місяцем -->
      <span class="tt__knob">
        <span class="tt__rays" aria-hidden="true">
          <i
            v-for="deg in rays"
            :key="deg"
            class="tt__ray"
            :style="{ transform: `rotate(${deg}deg) translateY(-13px)` }"
          />
        </span>
      </span>
    </span>
  </button>
</template>

<style scoped>
.tt {
  position: fixed;
  top: clamp(0.85rem, 2vw, 1.25rem);
  left: clamp(0.85rem, 2vw, 1.25rem);
  z-index: 200;
  padding: 0;
  border: 0;
  background: none;
  cursor: pointer;
  border-radius: 999px;
  -webkit-tap-highlight-color: transparent;
}

.tt:focus-visible {
  outline: 3px solid var(--tile);
  outline-offset: 4px;
}

.tt__track {
  position: relative;
  display: block;
  width: 76px;
  height: 34px;
  border-radius: 999px;
  overflow: hidden;
  background: linear-gradient(160deg, #f7d9c4 0%, #fdeee0 100%);
  box-shadow:
    inset 0 1px 3px rgba(46, 74, 61, 0.18),
    0 6px 16px -8px rgba(46, 74, 61, 0.5);
  transition: background 600ms ease;
}

.tt--dark .tt__track {
  background: linear-gradient(160deg, #10202e 0%, #1d2c3c 100%);
}

/* ---- сонце / місяць ---- */
.tt__knob {
  position: absolute;
  top: 4px;
  left: 4px;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: var(--ochre);
  box-shadow:
    0 0 0 2px rgba(233, 180, 76, 0.35),
    0 2px 6px rgba(180, 110, 20, 0.5);
  transition:
    transform 520ms cubic-bezier(0.34, 1.56, 0.64, 1),
    background 500ms ease,
    box-shadow 500ms ease;
}

.tt--dark .tt__knob {
  transform: translateX(42px);
  background: #ece0cd;
  /* тінь ізсередини вирізає серп + м'яке нічне сяйво */
  box-shadow:
    inset -7px -3px 0 0 #c9bda6,
    0 0 10px 2px rgba(236, 224, 205, 0.45);
}

/* кратери місяця — проявляються тільки в темряві */
.tt__knob::before,
.tt__knob::after {
  content: '';
  position: absolute;
  border-radius: 50%;
  background: #d7cbb4;
  opacity: 0;
  transition: opacity 400ms ease 120ms;
}

.tt__knob::before {
  width: 5px;
  height: 5px;
  top: 6px;
  left: 8px;
}

.tt__knob::after {
  width: 3.5px;
  height: 3.5px;
  top: 14px;
  left: 14px;
}

.tt--dark .tt__knob::before,
.tt--dark .tt__knob::after {
  opacity: 0.7;
}

/* ---- промені ---- */
.tt__rays {
  position: absolute;
  inset: 0;
  display: block;
  animation: tt-spin 12s linear infinite;
  transition: opacity 320ms ease, transform 400ms ease;
}

.tt__ray {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 2px;
  height: 5px;
  margin: -2.5px 0 0 -1px;
  border-radius: 2px;
  background: var(--ochre);
  transform-origin: center;
}

.tt--dark .tt__rays {
  opacity: 0;
  transform: scale(0.4);
}

/* ---- зорі ---- */
.tt__stars {
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity 500ms ease;
}

.tt--dark .tt__stars {
  opacity: 1;
}

.tt__star {
  position: absolute;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 0 4px rgba(255, 255, 255, 0.8);
  animation: tt-twinkle 2.8s ease-in-out infinite;
}

/* ---- хмаринки ---- */
.tt__clouds {
  position: absolute;
  inset: 0;
  opacity: 1;
  transition: opacity 400ms ease;
}

.tt--dark .tt__clouds {
  opacity: 0;
}

.tt__cloud {
  position: absolute;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.85);
}

.tt__cloud--a {
  width: 16px;
  height: 7px;
  right: 9px;
  bottom: 7px;
  box-shadow: -6px -3px 0 -1px rgba(255, 255, 255, 0.85);
  animation: tt-drift 6s ease-in-out infinite;
}

.tt__cloud--b {
  width: 11px;
  height: 5px;
  right: 22px;
  top: 8px;
  opacity: 0.7;
  animation: tt-drift 7.5s ease-in-out infinite reverse;
}

@keyframes tt-spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes tt-twinkle {
  0%,
  100% {
    opacity: 0.35;
    transform: scale(0.7);
  }
  50% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes tt-drift {
  0%,
  100% {
    transform: translateX(0);
  }
  50% {
    transform: translateX(-3px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .tt__rays,
  .tt__star,
  .tt__cloud {
    animation: none;
  }
}
</style>

<script setup lang="ts">
/* Ряд будинків Ради (Piața Sfatului) з дзвіницею, за ними — гора Тимпа.
   Через площу натягнута гірлянда, на прапорцях якої складається ім'я.

   Два розкладки. Широка (2.6:1) добре лягає на десктоп, але на телефоні
   стискається до смужки. Обрізати її по боках не можна — зникнуть крайні
   прапорці, тобто частина імені. Тому для вузьких екранів є власна
   вертикальна сцена: будинків менше, зате вони більші. */

const props = withDefaults(
  defineProps<{ name?: string; variant?: 'wide' | 'tall' }>(),
  { name: 'КАРІНКА', variant: 'wide' },
)

type House = { x: number; w: number; h: number; fill: string }

type Layout = {
  viewBox: string
  base: number
  hills: [string, string]
  letters: { x: number; y: number; rotate: number; size: number }
  ground: { x: number; y: number; w: number; h: number }
  houses: House[]
  church: {
    roof: string
    facade: { x: number; y: number; w: number; h: number }
    spire: string
    tower: { x: number; y: number; w: number; h: number }
    clock: { cx: number; cy: number; r: number }
    hourHand: number[]
    minuteHand: number[]
    arch: string
  }
  sun: { cx: number; cy: number; r: number; ray1: number; ray2: number }
  birds: [string, string]
  rope: { p0: [number, number]; c: [number, number]; p1: [number, number] }
  flag: { halfW: number; drop: number; fontSize: number; letterY: number }
  window: {
    w: number
    h: number
    gapY: number
    rx: number
    top: number
    colBreak: number
  }
}

const LAYOUTS: Record<'wide' | 'tall', Layout> = {
  wide: {
    viewBox: '0 0 1200 460',
    base: 420,
    hills: [
      'M -60 460 L -60 300 Q 180 190 430 236 Q 700 292 940 176 Q 1120 92 1260 150 L 1260 460 Z',
      'M -60 460 L -60 352 Q 240 268 560 320 Q 880 372 1260 268 L 1260 460 Z',
    ],
    letters: { x: 907, y: 196, rotate: -9, size: 38 },
    ground: { x: -60, y: 418, w: 1320, h: 42 },
    houses: [
      { x: 0, w: 110, h: 150, fill: 'var(--rose)' },
      { x: 110, w: 95, h: 182, fill: 'var(--ochre)' },
      { x: 205, w: 120, h: 140, fill: 'var(--sage)' },
      { x: 325, w: 100, h: 196, fill: 'var(--plaster-deep)' },
      { x: 425, w: 115, h: 158, fill: 'var(--rose)' },
      { x: 660, w: 105, h: 150, fill: 'var(--ochre)' },
      { x: 765, w: 125, h: 186, fill: 'var(--sage)' },
      { x: 890, w: 100, h: 154, fill: 'var(--plaster-deep)' },
      { x: 990, w: 115, h: 176, fill: 'var(--rose)' },
      { x: 1105, w: 95, h: 144, fill: 'var(--ochre)' },
    ],
    church: {
      roof: '533,210 600,150 667,210',
      facade: { x: 540, y: 210, w: 120, h: 210 },
      spire: '600,18 578,120 622,120',
      tower: { x: 578, y: 120, w: 44, h: 300 },
      clock: { cx: 600, cy: 168, r: 13 },
      hourHand: [600, 168, 600, 160],
      minuteHand: [600, 168, 607, 171],
      arch: 'M 590 420 v -44 a 10 10 0 0 1 20 0 v 44 z',
    },
    sun: { cx: 1135, cy: 62, r: 30, ray1: 20, ray2: 6 },
    birds: [
      'M210 58 q7 -7 14 0 M224 58 q7 -7 14 0',
      'M296 40 q5 -5 10 0 M306 40 q5 -5 10 0',
    ],
    rope: { p0: [60, 72], c: [550, 192], p1: [1050, 58] },
    flag: { halfW: 21, drop: 46, fontSize: 25, letterY: 24 },
    window: { w: 18, h: 26, gapY: 42, rx: 9, top: 26, colBreak: 111 },
  },

  tall: {
    viewBox: '0 0 600 660',
    base: 620,
    hills: [
      'M -30 660 L -30 430 Q 150 330 320 380 Q 470 425 630 320 L 630 660 Z',
      'M -30 660 L -30 500 Q 180 430 350 470 Q 500 505 630 440 L 630 660 Z',
    ],
    letters: { x: 425, y: 402, rotate: -8, size: 26 },
    ground: { x: -30, y: 618, w: 660, h: 42 },
    houses: [
      { x: 0, w: 100, h: 185, fill: 'var(--rose)' },
      { x: 100, w: 85, h: 225, fill: 'var(--ochre)' },
      { x: 185, w: 100, h: 170, fill: 'var(--sage)' },
      { x: 390, w: 100, h: 205, fill: 'var(--plaster-deep)' },
      { x: 490, w: 110, h: 180, fill: 'var(--ochre)' },
    ],
    church: {
      roof: '278,360 337,295 396,360',
      facade: { x: 285, y: 360, w: 105, h: 260 },
      spire: '337,140 314,250 360,250',
      tower: { x: 314, y: 250, w: 46, h: 370 },
      clock: { cx: 337, cy: 300, r: 15 },
      hourHand: [337, 300, 337, 290],
      minuteHand: [337, 300, 345, 304],
      arch: 'M 326 620 v -50 a 11 11 0 0 1 22 0 v 50 z',
    },
    sun: { cx: 530, cy: 62, r: 32, ray1: 16, ray2: 0 },
    birds: [
      'M120 62 q7 -7 14 0 M134 62 q7 -7 14 0',
      'M196 44 q5 -5 10 0 M206 44 q5 -5 10 0',
    ],
    rope: { p0: [25, 130], c: [300, 240], p1: [555, 120] },
    flag: { halfW: 26, drop: 52, fontSize: 30, letterY: 31 },
    window: { w: 24, h: 34, gapY: 54, rx: 12, top: 34, colBreak: 96 },
  },
}

const L = computed(() => LAYOUTS[props.variant])

function roof(h: House) {
  const top = L.value.base - h.h
  return `${h.x - 7},${top} ${h.x + h.w / 2},${top - 30} ${h.x + h.w + 7},${top}`
}

function windows(h: House) {
  const cfg = L.value.window
  const base = L.value.base
  const cols = h.w >= cfg.colBreak ? 3 : 2
  const rows = Math.min(4, Math.max(1, Math.floor((h.h - cfg.top - 10) / cfg.gapY)))
  const gapX = h.w / (cols + 1)
  const out: { x: number; y: number }[] = []
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      out.push({
        x: h.x + gapX * (c + 1) - cfg.w / 2,
        y: base - h.h + cfg.top + r * cfg.gapY,
      })
    }
  }
  return out.filter((w) => w.y + cfg.h < base - 14)
}

/* Обличчя сонця виводимо з його радіуса, щоб обидві сцени
   мали однакові пропорції усмішки. */
const sunFace = computed(() => {
  const { cx, cy, r } = L.value.sun
  return {
    cheeks: [cx - 0.43 * r, cx + 0.43 * r],
    cheekY: cy + 0.27 * r,
    cheekR: 0.17 * r,
    eyes: [cx - 0.33 * r, cx + 0.33 * r],
    eyeY: cy - 0.2 * r,
    eyeRx: 0.087 * r,
    eyeRy: 0.113 * r,
    smile: `M${cx - 0.3 * r} ${cy + 0.13 * r} q${0.3 * r} ${0.23 * r} ${0.6 * r} 0`,
  }
})

const ropePath = computed(() => {
  const { p0, c, p1 } = L.value.rope
  return `M${p0[0]} ${p0[1]} Q${c[0]} ${c[1]} ${p1[0]} ${p1[1]}`
})

const palette = [
  { fill: 'var(--rose)', ink: 'var(--fir)' },
  { fill: 'var(--ochre)', ink: 'var(--fir)' },
  { fill: 'var(--sage)', ink: 'var(--fir)' },
  { fill: 'var(--tile)', ink: '#fdf6ef' },
]

/* Округлюємо: Math.atan2 на сервері й у браузері розходиться в останньому
   розряді, і кожен прапорець давав би помилку гідратації. */
const round = (n: number) => Math.round(n * 100) / 100

const flags = computed(() => {
  const { p0, c, p1 } = L.value.rope
  const letters = [...props.name]
  return letters.map((letter, i) => {
    const t = (i + 0.5) / letters.length
    const u = 1 - t
    const x = u * u * p0[0] + 2 * u * t * c[0] + t * t * p1[0]
    const y = u * u * p0[1] + 2 * u * t * c[1] + t * t * p1[1]
    const dx = 2 * u * (c[0] - p0[0]) + 2 * t * (p1[0] - c[0])
    const dy = 2 * u * (c[1] - p0[1]) + 2 * t * (p1[1] - c[1])
    const angle = (Math.atan2(dy, dx) * 180) / Math.PI
    const tone = palette[i % palette.length]!
    return {
      letter,
      x: round(x),
      y: round(y),
      angle: round(angle),
      fill: tone.fill,
      ink: tone.ink,
      delay: i * 90,
    }
  })
})

const flagPoints = computed(() => {
  const { halfW, drop } = L.value.flag
  return `${-halfW},-1 ${halfW},-1 0,${drop}`
})
</script>

<template>
  <div class="skyline">
    <svg :viewBox="L.viewBox" preserveAspectRatio="xMidYMax meet" role="presentation" aria-hidden="true">
      <!-- сонце -->
      <g class="sun">
        <g class="sun__rays">
          <line
            v-for="r in 12"
            :key="r"
            :x1="L.sun.cx"
            :y1="L.sun.ray1"
            :x2="L.sun.cx"
            :y2="L.sun.ray2"
            :transform="`rotate(${r * 30} ${L.sun.cx} ${L.sun.cy})`"
          />
        </g>
        <circle class="sun__face" :cx="L.sun.cx" :cy="L.sun.cy" :r="L.sun.r" />
        <circle
          v-for="(cx, i) in sunFace.cheeks"
          :key="`cheek${i}`"
          class="sun__cheek"
          :cx="cx"
          :cy="sunFace.cheekY"
          :r="sunFace.cheekR"
        />
        <ellipse
          v-for="(cx, i) in sunFace.eyes"
          :key="`eye${i}`"
          class="sun__eye"
          :cx="cx"
          :cy="sunFace.eyeY"
          :rx="sunFace.eyeRx"
          :ry="sunFace.eyeRy"
        />
        <path class="sun__smile" :d="sunFace.smile" />
      </g>

      <!-- пташки -->
      <g class="birds">
        <path class="bird bird--a" :d="L.birds[0]" />
        <path class="bird bird--b" :d="L.birds[1]" />
      </g>

      <!-- Тимпа -->
      <path class="hill" :d="L.hills[0]" />
      <path class="hill hill--front" :d="L.hills[1]" />
      <text
        class="hill-letters"
        :x="L.letters.x"
        :y="L.letters.y"
        :style="{ fontSize: `${L.letters.size}px` }"
        :transform="`rotate(${L.letters.rotate} ${L.letters.x} ${L.letters.y})`"
      >
        BRAȘOV
      </text>

      <g class="town">
        <!-- Чорна церква -->
        <g class="house" style="--d: 250ms">
          <polygon class="roof" :points="L.church.roof" />
          <rect
            class="facade facade--church"
            :x="L.church.facade.x"
            :y="L.church.facade.y"
            :width="L.church.facade.w"
            :height="L.church.facade.h"
            rx="3"
          />
          <polygon class="spire" :points="L.church.spire" />
          <rect
            class="tower"
            :x="L.church.tower.x"
            :y="L.church.tower.y"
            :width="L.church.tower.w"
            :height="L.church.tower.h"
            rx="3"
          />
          <circle class="clock" :cx="L.church.clock.cx" :cy="L.church.clock.cy" :r="L.church.clock.r" />
          <line
            class="hand-h"
            :x1="L.church.hourHand[0]"
            :y1="L.church.hourHand[1]"
            :x2="L.church.hourHand[2]"
            :y2="L.church.hourHand[3]"
          />
          <line
            class="hand-m"
            :x1="L.church.minuteHand[0]"
            :y1="L.church.minuteHand[1]"
            :x2="L.church.minuteHand[2]"
            :y2="L.church.minuteHand[3]"
          />
          <path class="arch" :d="L.church.arch" />
        </g>

        <g v-for="(h, i) in L.houses" :key="h.x" class="house" :style="{ '--d': `${i * 70}ms` }">
          <polygon class="roof" :points="roof(h)" />
          <rect
            class="facade"
            :x="h.x"
            :y="L.base - h.h"
            :width="h.w"
            :height="h.h"
            rx="3"
            :style="{ fill: h.fill }"
          />
          <rect
            v-for="w in windows(h)"
            :key="`${w.x}-${w.y}`"
            class="window"
            :x="w.x"
            :y="w.y"
            :width="L.window.w"
            :height="L.window.h"
            :rx="L.window.rx"
          />
        </g>
      </g>

      <rect
        class="ground"
        :x="L.ground.x"
        :y="L.ground.y"
        :width="L.ground.w"
        :height="L.ground.h"
      />

      <!-- гірлянда з іменем, поверх площі -->
      <g class="bunting">
        <path class="rope" :d="ropePath" />
        <g v-for="f in flags" :key="f.letter + f.x" class="flag" :style="{ '--d': `${f.delay}ms` }">
          <g :transform="`translate(${f.x} ${f.y}) rotate(${f.angle})`">
            <g class="flag__sway" :style="{ '--d': `${f.delay}ms` }">
              <polygon class="flag__cloth" :points="flagPoints" :style="{ fill: f.fill }" />
              <text
                class="flag__letter"
                x="0"
                :y="L.flag.letterY"
                :style="{ fill: f.ink, fontSize: `${L.flag.fontSize}px` }"
              >
                {{ f.letter }}
              </text>
            </g>
          </g>
        </g>
      </g>
    </svg>
  </div>
</template>

<style scoped>
.skyline {
  position: relative;
  width: 100%;
  line-height: 0;
}

/* Висота йде за шириною: інакше на широких екранах "slice" зрізав би
   шпиль церкви й літери на схилі. */
.skyline svg {
  display: block;
  width: 100%;
  height: auto;
}

.hill {
  fill: #cfd9c8;
}

.hill--front {
  fill: #b6c6ac;
}

/* Літери на схилі — тло, а не другий заголовок: ім'я на прапорцях
   має лишатися головним у сцені. */
.hill-letters {
  fill: #fdf6ef;
  font-family: var(--font-display);
  font-weight: 800;
  letter-spacing: 0.3em;
  opacity: 0.5;
  /* без цього x читався б як початок рядка, і на вузькій сцені
     напис виїжджав за правий край */
  text-anchor: middle;
}

.facade {
  fill: var(--rose);
}

.facade--church,
.tower {
  fill: #6f6a72;
}

.roof,
.spire {
  fill: var(--tile);
}

.window {
  fill: #fdf6ef;
  opacity: 0.85;
}

.clock {
  fill: var(--ochre);
}

.hand-h,
.hand-m {
  stroke: var(--fir);
  stroke-width: 2;
  stroke-linecap: round;
}

.arch {
  fill: var(--fir);
  opacity: 0.55;
}

.ground {
  fill: #9fb396;
}

/* сонце */
.sun__face {
  fill: var(--ochre);
}

.sun__cheek {
  fill: var(--tile);
  opacity: 0.35;
}

.sun__eye {
  fill: var(--fir);
}

.sun__smile {
  fill: none;
  stroke: var(--fir);
  stroke-width: 2.4;
  stroke-linecap: round;
}

.sun__rays line {
  stroke: var(--ochre);
  stroke-width: 5;
  stroke-linecap: round;
}

.sun__rays {
  transform-box: fill-box;
  transform-origin: center;
  animation: spin 44s linear infinite;
}

.sun {
  animation: fade-in 900ms ease both;
}

/* пташки */
.bird {
  fill: none;
  stroke: var(--fir-soft);
  stroke-width: 2.6;
  stroke-linecap: round;
  opacity: 0.55;
}

.bird--a {
  animation: glide 9s ease-in-out infinite;
}

.bird--b {
  animation: glide 11s ease-in-out infinite reverse;
}

/* гірлянда */
.rope {
  fill: none;
  stroke: var(--fir-soft);
  stroke-width: 2.6;
  stroke-linecap: round;
  opacity: 0.7;
}

.flag {
  animation: flag-drop 620ms cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: calc(var(--d, 0ms) + 500ms);
}

.flag__sway {
  transform-box: fill-box;
  transform-origin: top center;
  animation: sway 3.4s ease-in-out infinite;
  animation-delay: var(--d, 0ms);
}

.flag__cloth {
  filter: drop-shadow(0 2px 0 rgba(46, 74, 61, 0.12));
}

.flag__letter {
  font-family: var(--font-display);
  font-weight: 800;
  text-anchor: middle;
}

.house {
  animation: rise 900ms cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: var(--d, 0ms);
}

@keyframes rise {
  from {
    transform: translateY(70px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes flag-drop {
  from {
    transform: translateY(-16px) scale(0.6);
    opacity: 0;
  }
  to {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

@keyframes sway {
  0%,
  100% {
    transform: rotate(-3.5deg);
  }
  50% {
    transform: rotate(3.5deg);
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes glide {
  0%,
  100% {
    transform: translate(0, 0);
  }
  50% {
    transform: translate(26px, -12px);
  }
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .house,
  .flag,
  .flag__sway,
  .sun,
  .sun__rays,
  .bird {
    animation: none;
  }
}
</style>

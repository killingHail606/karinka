<script setup lang="ts">
/* Бруно — карпатський ведмідь і талісман сторінки. У Брашові ведмеді
   справжні й іноді заходять у місто, тож він тут місцевий.

   Він живий: голова й очі стежать за курсором, його можна погладити,
   сам по собі позіхає, принюхується й ворушить вухами, а коли Карінка
   каже «так» — святкує разом з усіма іншими Бруно на сторінці. */

const props = withDefaults(
  defineProps<{
    pose?: 'idle' | 'wave' | 'hug' | 'happy' | 'sign'
    sign?: string
    width?: string
    lines?: string[]
    greeting?: string
    interactive?: boolean
  }>(),
  {
    pose: 'idle',
    width: '120px',
    interactive: true,
    lines: () => ['мур', 'ще!', 'приємно', 'я Бруно'],
  },
)

const { pointerX, pointerY, pointerSeen, celebrating } = useBruno()
const { isDark } = useTheme()

const root = ref<HTMLElement | null>(null)
const tilted = ref(false)
const petted = ref(false)
const bubble = ref('')
const idle = ref<'' | 'yawn' | 'ears' | 'sniff' | 'shake'>('')
const hearts = ref<{ id: number; dx: number; rot: number }[]>([])

// Реакції на дотик у різні місця + настрій.
const react = ref<'' | 'boop' | 'giggle' | 'joy'>('')
const earHit = ref<'' | 'l' | 'r'>('')
const awake = ref(false) // вночі прокидається на дотик
const zzz = ref<{ id: number; dx: number }[]>([])

let heartId = 0
let zzzId = 0
let combo = 0
let lastPet = 0
let reactTimer: ReturnType<typeof setTimeout> | undefined
let earTimer: ReturnType<typeof setTimeout> | undefined
let wakeTimer: ReturnType<typeof setTimeout> | undefined
let comboTimer: ReturnType<typeof setTimeout> | undefined

const reduced = () =>
  import.meta.client && window.matchMedia('(prefers-reduced-motion: reduce)').matches

const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)] ?? ''

/* ---- погляд за курсором ---- */
const originX = ref(0)
const originY = ref(0)

function measure() {
  const r = root.value?.getBoundingClientRect()
  if (!r || !r.width) return
  originX.value = r.left + r.width / 2
  originY.value = r.top + r.height * 0.3 // приблизно рівень голови
}

const clamp = (n: number) => Math.max(-1, Math.min(1, n))

const look = computed(() => {
  if (!pointerSeen.value) return { x: 0, y: 0 }
  const reach = 460
  return {
    x: clamp((pointerX.value - originX.value) / reach),
    y: clamp((pointerY.value - originY.value) / reach),
  }
})

const lookStyle = computed(() => ({
  '--head-x': `${(look.value.x * 2.4).toFixed(2)}px`,
  '--head-y': `${(look.value.y * 1.6).toFixed(2)}px`,
  '--eye-x': `${(look.value.x * 2.2).toFixed(2)}px`,
  '--eye-y': `${(look.value.y * 1.8).toFixed(2)}px`,
  '--lean': `${(look.value.x * 3).toFixed(2)}deg`, // тіло ледь хилиться до курсору
}))

/* Курсор близько — Бруно нашорошує вуха й пильнує. */
const near = computed(() => {
  if (!pointerSeen.value) return false
  const dx = pointerX.value - originX.value
  const dy = pointerY.value - originY.value
  return Math.hypot(dx, dy) < 150
})

/* Уночі Бруно куняє — доки його не поторкати. */
const sleepy = computed(() => isDark.value && !awake.value)

/* ---- погладити ---- */
function say(text: string, ms = 2600) {
  bubble.value = text
  setTimeout(() => {
    if (bubble.value === text) bubble.value = ''
  }, ms)
}

function popHearts(n: number) {
  if (reduced()) return
  const batch = Array.from({ length: n }, () => ({
    id: heartId++,
    dx: Math.round((Math.random() - 0.5) * 70),
    rot: Math.round((Math.random() - 0.5) * 40),
  }))
  hearts.value.push(...batch)
  const ids = new Set(batch.map((h) => h.id))
  setTimeout(() => {
    hearts.value = hearts.value.filter((h) => !ids.has(h.id))
  }, 1500)
}

function flash(kind: 'boop' | 'giggle' | 'joy', ms: number) {
  react.value = kind
  clearTimeout(reactTimer)
  reactTimer = setTimeout(() => (react.value = ''), ms)
}

/* У яку частину ведмедика тицьнули — рахуємо в координатах viewBox (120×150),
   тож працює за будь-якого розміру Бруно. */
function regionAt(e: MouseEvent): 'nose' | 'ear-l' | 'ear-r' | 'belly' | 'head' {
  const r = root.value?.getBoundingClientRect()
  if (!r || !r.width) return 'head'
  const vx = ((e.clientX - r.left) / r.width) * 120
  const vy = ((e.clientY - r.top) / r.height) * 150
  const hit = (cx: number, cy: number, rad: number) => Math.hypot(vx - cx, vy - cy) <= rad
  if (hit(60, 56, 18)) return 'nose'
  if (hit(32, 28, 17)) return 'ear-l'
  if (hit(88, 28, 17)) return 'ear-r'
  if (hit(60, 118, 27)) return 'belly'
  return 'head'
}

/* Головна реакція на дотик: різні місця — різні емоції, а швидкі
   повторні дотики розганяють Бруно в захват. */
function reactAt(e: MouseEvent) {
  // вночі — прокидається на кілька секунд
  if (isDark.value) {
    awake.value = true
    clearTimeout(wakeTimer)
    wakeTimer = setTimeout(() => (awake.value = false), 3800)
  }

  const now = Date.now()
  combo = now - lastPet < 1200 ? combo + 1 : 1
  lastPet = now
  clearTimeout(comboTimer)
  comboTimer = setTimeout(() => (combo = 0), 1500)

  // серія швидких дотиків — Бруно не витримує й радіє від душі
  if (combo >= 4) {
    flash('joy', 900)
    popHearts(6)
    say(pick(['я тебе теж!', 'ще-ще!', 'найкращий день!', 'муррр 🥰']), 2200)
    combo = 0
    return
  }

  switch (regionAt(e)) {
    case 'nose':
      flash('boop', 620)
      say(pick(['буп!', 'ой!', 'гей!']), 1600)
      break
    case 'ear-l':
    case 'ear-r':
      earHit.value = regionAt(e) === 'ear-l' ? 'l' : 'r'
      clearTimeout(earTimer)
      earTimer = setTimeout(() => (earHit.value = ''), 1300)
      say(pick(['хі!', 'лоскотно', 'му?']), 1600)
      break
    case 'belly':
      flash('giggle', 720)
      popHearts(4)
      say(pick(['ха-ха!', 'ой, лоскотно!', 'годі 😄']), 1900)
      break
    default:
      pet()
  }
}

function pet() {
  petted.value = true
  setTimeout(() => (petted.value = false), 700)
  say(pick(props.lines) || 'мур')
  popHearts(3)
}

/* ---- власне життя: випадкові дрібні дії ---- */
let idleTimer: ReturnType<typeof setTimeout> | undefined

function scheduleIdle() {
  const delay = 5000 + Math.random() * 7000
  idleTimer = setTimeout(() => {
    const actions = ['yawn', 'ears', 'sniff', 'shake'] as const
    idle.value = actions[Math.floor(Math.random() * actions.length)]!
    setTimeout(() => (idle.value = ''), 1600)
    scheduleIdle()
  }, delay)
}

/* ---- привітання, коли Бруно вперше зʼявляється на екрані ---- */
let io: IntersectionObserver | undefined

/* ---- нічні «Zzz», поки Бруно куняє ---- */
let zzzTimer: ReturnType<typeof setInterval> | undefined

function scheduleZzz() {
  zzzTimer = setInterval(() => {
    if (!sleepy.value || reduced() || document.hidden) return
    const id = zzzId++
    zzz.value.push({ id, dx: Math.round((Math.random() - 0.5) * 12) })
    setTimeout(() => {
      zzz.value = zzz.value.filter((z) => z.id !== id)
    }, 2600)
  }, 2400)
}

onMounted(() => {
  measure()
  window.addEventListener('resize', measure, { passive: true })
  window.addEventListener('scroll', measure, { passive: true })

  if (!reduced()) {
    scheduleIdle()
    scheduleZzz()
  }

  if (props.greeting && root.value && 'IntersectionObserver' in window) {
    io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setTimeout(() => say(props.greeting!, 3400), 700)
            io?.disconnect()
          }
        }
      },
      { threshold: 0.6 },
    )
    io.observe(root.value)
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', measure)
  window.removeEventListener('scroll', measure)
  if (idleTimer) clearTimeout(idleTimer)
  if (zzzTimer) clearInterval(zzzTimer)
  clearTimeout(reactTimer)
  clearTimeout(earTimer)
  clearTimeout(wakeTimer)
  clearTimeout(comboTimer)
  io?.disconnect()
})

/* коли сказано «так» — радіє кожен Бруно на сторінці */
watch(celebrating, (on) => {
  if (on) say('урааа!', 4000)
})

const activePose = computed(() => (celebrating.value ? 'happy' : props.pose))

/* Дозволяємо батьківському компоненту звертатись до Бруно —
   напр. відлік просить його промовити дату ялинки. */
defineExpose({ say })
</script>

<template>
  <component
    :is="props.interactive ? 'button' : 'div'"
    ref="root"
    class="bruno"
    :class="[
      `bruno--${activePose}`,
      idle ? `is-${idle}` : '',
      react ? `is-${react}` : '',
      earHit ? `is-ear-${earHit}` : '',
      {
        'is-tilted': tilted,
        'is-petted': petted,
        'is-celebrating': celebrating,
        'is-alert': near && !sleepy,
        'is-sleepy': sleepy,
      },
    ]"
    :style="[{ width: props.width }, lookStyle]"
    :type="props.interactive ? 'button' : undefined"
    :aria-label="props.interactive ? 'Погладити ведмедика Бруно' : undefined"
    @click="props.interactive && reactAt($event)"
    @mouseenter="tilted = true"
    @mouseleave="tilted = false"
  >
    <Transition name="pop">
      <span v-if="bubble" class="bruno__bubble hand">{{ bubble }}</span>
    </Transition>

    <!-- нічні «Zzz» -->
    <span
      v-for="z in zzz"
      :key="`z${z.id}`"
      class="bruno__zzz hand"
      aria-hidden="true"
      :style="{ '--dx': `${z.dx}px` }"
      >z</span
    >

    <svg
      v-for="h in hearts"
      :key="h.id"
      class="bruno__heart"
      viewBox="0 0 24 22"
      aria-hidden="true"
      :style="{ '--dx': `${h.dx}px`, '--rot': `${h.rot}deg` }"
    >
      <path
        d="M12 21 C 3 14 1 9 1 6.5 A 5.5 5.5 0 0 1 12 4.5 A 5.5 5.5 0 0 1 23 6.5 C 23 9 21 14 12 21 Z"
      />
    </svg>

    <svg class="bear" viewBox="0 0 120 150" aria-hidden="true">
      <g class="bear__all">
        <!-- ноги -->
        <ellipse class="fur" cx="43" cy="141" rx="12" ry="9" />
        <ellipse class="fur" cx="77" cy="141" rx="12" ry="9" />
        <ellipse class="pad" cx="43" cy="142" rx="6" ry="4.5" />
        <ellipse class="pad" cx="77" cy="142" rx="6" ry="4.5" />

        <!-- руки -->
        <ellipse class="fur arm arm--l" cx="26" cy="104" rx="10.5" ry="15" />
        <ellipse class="fur arm arm--r" cx="94" cy="104" rx="10.5" ry="15" />

        <!-- тулуб -->
        <ellipse class="fur" cx="60" cy="112" rx="31" ry="32" />
        <ellipse class="belly" cx="60" cy="118" rx="20" ry="22" />

        <!-- табличка -->
        <g v-if="props.pose === 'sign' && props.sign" class="sign">
          <rect x="6" y="98" width="108" height="36" rx="8" />
          <text x="60" y="122">{{ props.sign }}</text>
        </g>

        <g class="head-follow">
          <g class="bear__head">
            <!-- вуха -->
            <g class="ear ear--l">
              <circle class="fur" cx="32" cy="28" r="15" />
              <circle class="ear-in" cx="32" cy="29" r="7.5" />
            </g>
            <g class="ear ear--r">
              <circle class="fur" cx="88" cy="28" r="15" />
              <circle class="ear-in" cx="88" cy="29" r="7.5" />
            </g>

            <circle class="fur" cx="60" cy="52" r="33" />

            <circle class="cheek" cx="33" cy="59" r="6.5" />
            <circle class="cheek" cx="87" cy="59" r="6.5" />

            <ellipse class="muzzle" cx="60" cy="64" rx="19" ry="14.5" />
            <ellipse class="nose" cx="60" cy="56" rx="6.5" ry="4.6" />
            <path class="mouth" d="M60 61 v4 M60 65 q-6 5 -11 1 M60 65 q6 5 11 1" />

            <g class="eyes">
              <ellipse class="eye" cx="46" cy="44" rx="4.2" ry="5.2" />
              <ellipse class="eye" cx="74" cy="44" rx="4.2" ry="5.2" />
              <circle class="glint" cx="47.6" cy="42" r="1.5" />
              <circle class="glint" cx="75.6" cy="42" r="1.5" />
            </g>
          </g>
        </g>
      </g>
    </svg>
  </component>
</template>

<style scoped>
.bruno {
  position: relative;
  display: block;
  padding: 0;
  border: none;
  background: none;
  line-height: 0;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.bruno:not(button) {
  cursor: default;
}

.bruno:focus-visible {
  outline: 3px solid var(--tile);
  outline-offset: 6px;
  border-radius: 18px;
}

.bear {
  display: block;
  width: 100%;
  height: auto;
  overflow: visible;
}

/* ---- хмаринка з реплікою ---- */
.bruno__bubble {
  position: absolute;
  left: 50%;
  bottom: 96%;
  transform: translateX(-50%);
  z-index: 3;
  white-space: nowrap;
  font-size: clamp(1.1rem, 3.4vw, 1.5rem);
  line-height: 1;
  color: var(--fir);
  background: var(--plaster);
  border: 2.5px solid var(--tile);
  border-radius: 999px;
  padding: 0.45em 0.85em;
  box-shadow: 0 6px 14px -8px rgba(46, 74, 61, 0.5);
}

.bruno__bubble::after {
  content: '';
  position: absolute;
  left: 50%;
  top: 100%;
  width: 11px;
  height: 11px;
  margin-left: -5px;
  background: var(--plaster);
  border-right: 2.5px solid var(--tile);
  border-bottom: 2.5px solid var(--tile);
  transform: translateY(-6px) rotate(45deg);
  border-radius: 0 0 3px 0;
}

.pop-enter-active {
  transition: transform 260ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 200ms ease;
}

.pop-leave-active {
  transition: transform 180ms ease, opacity 180ms ease;
}

.pop-enter-from,
.pop-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(6px) scale(0.7);
}

/* ---- сердечка від погладжування ---- */
.bruno__heart {
  position: absolute;
  left: 50%;
  top: 12%;
  width: 20px;
  height: auto;
  fill: var(--tile);
  pointer-events: none;
  z-index: 2;
  animation: bruno-heart 1.4s ease-out forwards;
}

@keyframes bruno-heart {
  0% {
    opacity: 0;
    transform: translate(-50%, 0) scale(0.3);
  }
  25% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: translate(calc(-50% + var(--dx, 0px)), -90px) scale(1)
      rotate(var(--rot, 0deg));
  }
}

/* ---- сам ведмідь ---- */
.fur {
  fill: #9a6b4a;
}

.belly,
.muzzle,
.ear-in,
.pad {
  fill: #d8b48c;
}

.nose {
  fill: #4a342a;
  transform-box: fill-box;
  transform-origin: center;
}

.eye {
  fill: #3b2a22;
  transform-box: fill-box;
  transform-origin: center;
  animation: blink 5.5s infinite;
}

.glint {
  fill: #fff;
  opacity: 0.9;
  transition: opacity 180ms ease;
}

.cheek {
  fill: var(--rose);
  opacity: 0.55;
}

.mouth {
  fill: none;
  stroke: #4a342a;
  stroke-width: 2.4;
  stroke-linecap: round;
  transform-box: fill-box;
  transform-origin: top center;
}

/* Табличка мусить бути ширшою за напис: поза нею текст
   зливається з темним тлом секції. */
.sign text {
  font-family: var(--font-hand);
  font-weight: 700;
  font-size: 22px;
  fill: var(--fir);
  text-anchor: middle;
}

.sign rect {
  fill: var(--plaster);
  stroke: var(--tile);
  stroke-width: 3;
}

.sign {
  transform: rotate(-4deg);
  transform-box: fill-box;
  transform-origin: center;
}

/* дихання */
.bear__all {
  transform-box: fill-box;
  transform-origin: bottom center;
  animation: breathe 3.6s ease-in-out infinite;
}

/* голова тягнеться за курсором… */
.head-follow {
  transform: translate(var(--head-x, 0px), var(--head-y, 0px));
  transition: transform 380ms cubic-bezier(0.22, 1, 0.36, 1);
}

/* …а очі ще трохи більше */
.eyes {
  transform: translate(var(--eye-x, 0px), var(--eye-y, 0px));
  transition: transform 300ms cubic-bezier(0.22, 1, 0.36, 1);
}

.bear__head {
  transform-box: fill-box;
  transform-origin: bottom center;
  transition: transform 320ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

.bruno.is-tilted .bear__head {
  transform: rotate(-7deg);
}

.ear {
  transform-box: fill-box;
  transform-origin: center bottom;
}

.arm {
  transform-box: fill-box;
  transform-origin: center top;
}

.bruno--wave .arm--r {
  animation: wave 1.5s ease-in-out infinite;
}

.bruno--hug .arm--l {
  transform: rotate(38deg);
}

.bruno--hug .arm--r {
  transform: rotate(-38deg);
}

.bruno--happy .bear__all {
  animation: hop 620ms cubic-bezier(0.28, 0.84, 0.42, 1) infinite;
}

.bruno--happy .arm--l {
  transform: rotate(-32deg);
}

.bruno--happy .arm--r {
  transform: rotate(32deg);
}

/* ---- реакція на погладжування ---- */
.bruno.is-petted .bear__all {
  animation: squish 700ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* ---- власні дрібні дії ---- */
.bruno.is-yawn .mouth {
  animation: yawn 1.6s ease-in-out;
}

.bruno.is-yawn .eye {
  animation: squint 1.6s ease-in-out;
}

.bruno.is-ears .ear--l {
  animation: ear-wiggle 1.4s ease-in-out;
}

.bruno.is-ears .ear--r {
  animation: ear-wiggle 1.4s ease-in-out 120ms reverse;
}

.bruno.is-sniff .nose {
  animation: sniff 1.2s ease-in-out;
}

.bruno.is-shake .bear__head {
  animation: shake 1.1s ease-in-out;
}

/* ---- тіло ледь хилиться до курсору ---- */
.bear {
  transform: rotate(var(--lean, 0deg));
  transform-origin: bottom center;
  transition: transform 500ms cubic-bezier(0.22, 1, 0.36, 1);
}

/* ---- курсор близько: нашорошені вуха ---- */
.bruno.is-alert .ear {
  transform: translateY(-2px) scale(1.1);
  transition: transform 260ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

.bruno.is-alert .ear--r {
  transition-delay: 60ms;
}

/* ---- «буп» по носі: ніс сигналить, очі збігаються, рот охкає ---- */
.bruno.is-boop .nose {
  animation: honk 620ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

.bruno.is-boop .mouth {
  animation: gasp 620ms ease;
}

.bruno.is-boop .eye {
  animation: none;
  transition: transform 200ms ease;
}

.bruno.is-boop .eyes .eye:nth-of-type(1) {
  transform: translateX(6px) scaleY(0.8);
}

.bruno.is-boop .eyes .eye:nth-of-type(2) {
  transform: translateX(-6px) scaleY(0.8);
}

/* відблиски ховаємо, поки очі зведені, — інакше «зіниця" й блиск
   роз'їжджаються в різні боки */
.bruno.is-boop .glint {
  opacity: 0;
}

/* ---- лоскотання животика ---- */
.bruno.is-giggle .bear__all {
  animation: squish 700ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

.bruno.is-giggle .cheek {
  opacity: 0.85;
}

/* ---- захват від серії швидких дотиків ---- */
.bruno.is-joy .bear__all {
  animation: hop 500ms cubic-bezier(0.28, 0.84, 0.42, 1) 2;
}

.bruno.is-joy .cheek {
  opacity: 0.9;
}

.bruno.is-joy .arm {
  transition: transform 200ms ease;
}

.bruno.is-joy .arm--l {
  transform: rotate(-30deg);
}

.bruno.is-joy .arm--r {
  transform: rotate(30deg);
}

/* ---- поторкані вушка ---- */
.bruno.is-ear-l .ear--l {
  animation: ear-wiggle 1.2s ease-in-out;
}

.bruno.is-ear-r .ear--r {
  animation: ear-wiggle 1.2s ease-in-out;
}

/* ---- сон уночі: очі приплющені, дихання повільніше ---- */
.bruno.is-sleepy .bear__all {
  animation: breathe 5.2s ease-in-out infinite;
}

.bruno.is-sleepy .eye {
  animation: none;
  transform: scaleY(0.26) translateY(1.5px);
}

.bruno.is-sleepy .glint {
  opacity: 0;
}

.bruno.is-sleepy .bear__head {
  transform: rotate(3deg) translateY(1px);
}

.bruno.is-sleepy .mouth {
  transform: scaleY(0.7);
}

/* ---- нічні «Zzz» ---- */
.bruno__zzz {
  position: absolute;
  top: 8%;
  left: 60%;
  font-size: clamp(0.9rem, 4vw, 1.35rem);
  font-weight: 700;
  color: var(--fir-soft);
  pointer-events: none;
  z-index: 3;
  animation: zzz-float 2.6s ease-out forwards;
}

@keyframes zzz-float {
  0% {
    opacity: 0;
    transform: translate(0, 0) scale(0.6) rotate(-8deg);
  }
  20% {
    opacity: 0.9;
  }
  100% {
    opacity: 0;
    transform: translate(calc(22px + var(--dx, 0px)), -48px) scale(1.15) rotate(10deg);
  }
}

@keyframes honk {
  0%,
  100% {
    transform: scale(1);
  }
  35% {
    transform: scale(1.55);
  }
  60% {
    transform: scale(0.9);
  }
}

@keyframes gasp {
  0%,
  100% {
    transform: scaleY(1);
  }
  40% {
    transform: scaleY(1.7) translateY(1px);
  }
}

@keyframes blink {
  0%,
  92%,
  100% {
    transform: scaleY(1);
  }
  95% {
    transform: scaleY(0.1);
  }
}

@keyframes breathe {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.028);
  }
}

@keyframes wave {
  0%,
  100% {
    transform: rotate(6deg);
  }
  50% {
    transform: rotate(-28deg);
  }
}

@keyframes hop {
  0%,
  100% {
    transform: translateY(0) scale(1);
  }
  40% {
    transform: translateY(-14px) scale(1.03);
  }
}

@keyframes squish {
  0% {
    transform: scale(1, 1);
  }
  30% {
    transform: scale(1.14, 0.86) rotate(-3deg);
  }
  60% {
    transform: scale(0.94, 1.08) rotate(3deg);
  }
  100% {
    transform: scale(1, 1);
  }
}

@keyframes yawn {
  0%,
  100% {
    transform: scaleY(1);
  }
  35%,
  65% {
    transform: scaleY(2.6);
  }
}

@keyframes squint {
  0%,
  100% {
    transform: scaleY(1);
  }
  35%,
  65% {
    transform: scaleY(0.25);
  }
}

@keyframes ear-wiggle {
  0%,
  100% {
    transform: rotate(0deg);
  }
  25% {
    transform: rotate(-14deg);
  }
  60% {
    transform: rotate(9deg);
  }
}

@keyframes sniff {
  0%,
  100% {
    transform: scale(1);
  }
  20%,
  60% {
    transform: scale(1.28);
  }
  40% {
    transform: scale(1.05);
  }
}

@keyframes shake {
  0%,
  100% {
    transform: rotate(0deg);
  }
  20% {
    transform: rotate(-9deg);
  }
  50% {
    transform: rotate(8deg);
  }
  75% {
    transform: rotate(-4deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .bear__all,
  .arm,
  .eye,
  .mouth,
  .ear,
  .nose,
  .bear__head {
    animation: none !important;
  }

  .head-follow,
  .eyes,
  .bear {
    transform: none;
  }

  .bruno__heart,
  .bruno__zzz {
    display: none;
  }
}
</style>

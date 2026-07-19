<script setup lang="ts">
/* Бруно — карпатський ведмідь. У Брашові вони справжні й іноді заходять
   у місто, тож він тут місцевий, а не абстрактний маскот. */

const props = withDefaults(
  defineProps<{
    pose?: 'idle' | 'wave' | 'hug' | 'happy' | 'sign'
    sign?: string
    width?: string
  }>(),
  { pose: 'idle', width: '120px' },
)

const tilted = ref(false)
</script>

<template>
  <svg
    class="bear"
    :class="[`bear--${props.pose}`, { 'is-tilted': tilted }]"
    :style="{ width: props.width }"
    viewBox="0 0 120 150"
    role="img"
    :aria-label="props.sign ? `Ведмедик Бруно тримає табличку: ${props.sign}` : 'Ведмедик Бруно'"
    @mouseenter="tilted = true"
    @mouseleave="tilted = false"
  >
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

      <g class="bear__head">
        <!-- вуха -->
        <circle class="fur" cx="32" cy="28" r="15" />
        <circle class="fur" cx="88" cy="28" r="15" />
        <circle class="ear-in" cx="32" cy="29" r="7.5" />
        <circle class="ear-in" cx="88" cy="29" r="7.5" />

        <circle class="fur" cx="60" cy="52" r="33" />

        <circle class="cheek" cx="33" cy="59" r="6.5" />
        <circle class="cheek" cx="87" cy="59" r="6.5" />

        <ellipse class="muzzle" cx="60" cy="64" rx="19" ry="14.5" />
        <ellipse class="nose" cx="60" cy="56" rx="6.5" ry="4.6" />
        <path class="mouth" d="M60 61 v4 M60 65 q-6 5 -11 1 M60 65 q6 5 11 1" />

        <ellipse class="eye" cx="46" cy="44" rx="4.2" ry="5.2" />
        <ellipse class="eye" cx="74" cy="44" rx="4.2" ry="5.2" />
        <circle class="glint" cx="47.6" cy="42" r="1.5" />
        <circle class="glint" cx="75.6" cy="42" r="1.5" />
      </g>
    </g>
  </svg>
</template>

<style scoped>
.bear {
  display: block;
  height: auto;
  overflow: visible;
}

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
}

.sign rect {
  fill: var(--plaster);
  stroke: var(--tile);
  stroke-width: 3;
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

.bear__head {
  transform-box: fill-box;
  transform-origin: bottom center;
  transition: transform 320ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

.bear.is-tilted .bear__head {
  transform: rotate(-7deg);
}

.arm {
  transform-box: fill-box;
  transform-origin: center top;
}

.bear--wave .arm--r {
  animation: wave 1.5s ease-in-out infinite;
}

.bear--hug .arm--l {
  transform: rotate(38deg);
}

.bear--hug .arm--r {
  transform: rotate(-38deg);
}

.bear--happy .bear__all {
  animation: hop 620ms cubic-bezier(0.28, 0.84, 0.42, 1) infinite;
}

.bear--happy .arm--l {
  transform: rotate(-32deg);
}

.bear--happy .arm--r {
  transform: rotate(32deg);
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

@media (prefers-reduced-motion: reduce) {
  .bear__all,
  .arm,
  .eye {
    animation: none !important;
  }
}
</style>

<script setup lang="ts">
/* Приписка на полях — ніби дописано ручкою вже після того,
   як сторінку зробили. */

const props = withDefaults(
  defineProps<{
    text: string
    rotate?: number
    arrow?: 'left' | 'right' | 'down' | 'none'
  }>(),
  { rotate: -3, arrow: 'none' },
)
</script>

<template>
  <p class="note hand" :style="{ '--rot': `${props.rotate}deg` }">
    <svg
      v-if="props.arrow === 'left'"
      class="note__arrow note__arrow--left"
      viewBox="0 0 40 24"
      aria-hidden="true"
    >
      <path d="M38 4 Q18 2 6 14" />
      <path d="M4 14 l10 -3 M4 14 l6 8" />
    </svg>

    <span>{{ props.text }}</span>

    <svg
      v-if="props.arrow === 'right'"
      class="note__arrow"
      viewBox="0 0 40 24"
      aria-hidden="true"
    >
      <path d="M2 4 Q22 2 34 14" />
      <path d="M36 14 l-10 -3 M36 14 l-6 8" />
    </svg>

    <svg
      v-if="props.arrow === 'down'"
      class="note__arrow note__arrow--down"
      viewBox="0 0 24 40"
      aria-hidden="true"
    >
      <path d="M6 2 Q22 14 14 34" />
      <path d="M14 36 l-7 -7 M14 36 l8 -4" />
    </svg>
  </p>
</template>

<style scoped>
.note {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  margin: 0;
  font-size: clamp(1.15rem, 2.4vw, 1.5rem);
  line-height: 1.25;
  color: var(--tile);
  transform: rotate(var(--rot, -3deg));
}

.note__arrow {
  width: 2.5rem;
  height: auto;
  flex: none;
  fill: none;
  stroke: var(--tile);
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
  opacity: 0.85;
}

.note__arrow--down {
  width: 1.5rem;
}
</style>

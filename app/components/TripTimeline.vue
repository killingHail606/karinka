<script setup lang="ts">
/* Справжня дорога: автобус з Уманя вночі з пересадкою, ранкова Сучава,
   зустріч, машина до Брашова.
   Порядок тут несе зміст, тому кроки пронумеровані часом, а не цифрами. */

const steps = [
  {
    icon: 'bus',
    time: '30 липня, 21:00',
    title: 'Умань. Ти сідаєш в автобус',
    text: 'Автобус до Чернівців, з пересадкою в Хмельницькому. Займай місце біля вікна, вкривайся і спи — попереду ціла ніч.',
    fill: 'var(--rose)',
  },
  {
    icon: 'moon',
    time: 'уночі, Хмельницький',
    title: 'Пересадка',
    text: 'Прокинешся ненадовго на пересадку — і можна спати далі. Найнудніша частина дороги, і вона мине швидше, ніж здається.',
    fill: 'var(--sage)',
  },
  {
    icon: 'sunrise',
    time: '31 липня, 5:30',
    title: 'Чернівці, і далі',
    text: 'О 5:30 ти в Чернівцях на світанку, а о 6:00 — останній переїзд до Сучави. Розбудять на кордоні, покажеш паспорт. О 8:30 ти на місці.',
    fill: 'var(--ochre)',
  },
  {
    icon: 'heart',
    time: '8:30, Сучава',
    title: 'Сучава. І я',
    text: 'Я вже стоятиму на парковці з кавою для тебе. Далі за кермом я, а ти можеш спокійно досипати.',
    fill: 'var(--tile)',
  },
  {
    icon: 'car',
    time: 'кілька годин',
    title: 'Через гори',
    text: 'Карпати за вікном усю дорогу. Хочеш — спи, хочеш — дивись; я час від часу тебе штовхатиму, щоб не проґавила найкрасивіше.',
    fill: 'var(--plaster-deep)',
  },
  {
    icon: 'home',
    time: 'і нарешті',
    title: 'Брашов',
    text: 'Ми вдома. Ти кидаєш валізу, я вмикаю чайник, і далі вже нікуди не поспішаємо.',
    fill: 'var(--rose)',
  },
]
</script>

<template>
  <ol class="trip">
    <li v-for="step in steps" :key="step.title" class="step">
      <span class="step__badge" :style="{ '--badge': step.fill }" aria-hidden="true">
        <svg viewBox="0 0 48 48" class="step__icon">
          <g v-if="step.icon === 'bus'">
            <rect x="9" y="11" width="30" height="24" rx="6" />
            <rect class="cut" x="13" y="16" width="9" height="8" rx="2.5" />
            <rect class="cut" x="26" y="16" width="9" height="8" rx="2.5" />
            <circle cx="16" cy="37" r="4" />
            <circle cx="32" cy="37" r="4" />
          </g>
          <g v-else-if="step.icon === 'moon'">
            <path d="M30 8 a16 16 0 1 0 10 26 A17 17 0 0 1 30 8 Z" />
            <circle cx="14" cy="12" r="2.2" />
            <circle cx="21" cy="6" r="1.5" />
          </g>
          <g v-else-if="step.icon === 'sunrise'">
            <path d="M12 32 a12 12 0 0 1 24 0 Z" />
            <rect x="6" y="34" width="36" height="4" rx="2" />
            <path class="stroke" d="M24 6 v5 M9 14 l3.5 3.5 M39 14 l-3.5 3.5" />
          </g>
          <g v-else-if="step.icon === 'heart'">
            <path d="M24 39 C10 30 8 20 14 15 c4 -3.5 8 -1.5 10 2 c2 -3.5 6 -5.5 10 -2 c6 5 4 15 -10 24 Z" />
          </g>
          <g v-else-if="step.icon === 'car'">
            <path d="M8 30 q1 -9 6 -10 l3 -6 h14 l3 6 q5 1 6 10 v3 a3 3 0 0 1 -3 3 h-26 a3 3 0 0 1 -3 -3 Z" />
            <circle class="cut" cx="16" cy="30" r="3" />
            <circle class="cut" cx="32" cy="30" r="3" />
          </g>
          <g v-else>
            <path d="M24 9 L42 25 h-5 v13 a3 3 0 0 1 -3 3 h-20 a3 3 0 0 1 -3 -3 v-13 h-5 Z" />
            <rect class="cut" x="20" y="28" width="8" height="13" rx="2.5" />
          </g>
        </svg>
      </span>

      <div class="step__body">
        <p class="step__time">{{ step.time }}</p>
        <h3 class="step__title">{{ step.title }}</h3>
        <p class="step__text">{{ step.text }}</p>
      </div>
    </li>
  </ol>
</template>

<style scoped>
.trip {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: clamp(1.6rem, 3.5vw, 2.4rem);
  max-width: 42rem;
}

.step {
  position: relative;
  display: grid;
  grid-template-columns: auto 1fr;
  gap: clamp(1rem, 2.5vw, 1.5rem);
}

/* пунктир між кроками — сама дорога */
.step:not(:last-child)::before {
  content: '';
  position: absolute;
  left: 29px;
  top: 68px;
  bottom: calc(-1 * clamp(1.6rem, 3.5vw, 2.4rem));
  border-left: 3px dashed var(--sage);
}

.step__badge {
  display: grid;
  place-items: center;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: var(--badge, var(--sage));
  flex: none;
}

.step__icon {
  width: 34px;
  height: 34px;
  fill: var(--fir);
}

.step__icon .cut {
  fill: var(--plaster);
}

.step__icon .stroke {
  fill: none;
  stroke: var(--fir);
  stroke-width: 3;
  stroke-linecap: round;
}

.step__time {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 0.72rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--tile);
}

.step__title {
  margin-top: 0.25rem;
  font-family: var(--font-hand);
  font-weight: 700;
  font-size: clamp(1.7rem, 3.2vw, 2.1rem);
  color: var(--fir);
}

.step__text {
  margin-top: 0.35rem;
  color: var(--fir-soft);
  font-size: 0.97rem;
  line-height: 1.6;
}
</style>

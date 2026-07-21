<script setup lang="ts">
onMounted(() => {
  const targets = document.querySelectorAll('[data-reveal]')
  if (!('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('is-visible'))
    return
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
          io.unobserve(entry.target)
        }
      })
    },
    { rootMargin: '0px 0px -12% 0px' },
  )

  targets.forEach((el) => io.observe(el))
})
</script>

<template>
  <div class="page">
    <ThemeToggle />

    <header class="hero">
      <!-- Спочатку сама площа з іменем на прапорцях, і тільки потім текст -->
      <div class="hero__scene">
        <TownSkyline class="scene scene--wide" name="КАРІНКА" variant="wide" />
        <TownSkyline class="scene scene--tall" name="КАРІНКА" variant="tall" />
        <div class="hero__bear">
          <BrasovBear
            pose="wave"
            width="var(--bear-w)"
            greeting="привіт!"
            :lines="['мур', 'ще погладь', 'я Бруно', 'тут гарно, чесно', 'ходімо в гори']"
          />
          <MarginNote class="hero__bear-note" text="це Бруно" :rotate="5" arrow="left" />
        </div>
      </div>

      <div class="wrap hero__text">
        <p class="eyebrow">запрошення · брашов, румунія</p>
        <h1 class="hero__head">
          <span class="visually-hidden">Карінко, </span>
          <span class="hero__verb display">приїзди до мене в</span>
          <span class="hero__city display">Брашов</span>
        </h1>
        <p class="hero__date">30 липня, 21:00 · твій автобус</p>
        <p class="prose hero__lede">
          Тут гори починаються відразу за останнім будинком, площа пахне кавою і
          мокрим камінням, а вечорами дахи стають рудими. Ти сідаєш в автобус
          тридцятого ввечері, зранку я забираю тебе в Сучаві — і до вечора ти
          вже тут.
        </p>
      </div>
    </header>

    <main>
      <!-- клас навмисне не .bruno: він збігався б із кореневим класом
           компонента ведмедика, і Vue переносить scope батька на нього -->
      <section class="meet wrap" aria-labelledby="bruno-title" data-reveal>
        <h2 id="bruno-title" class="meet__title hand">Знайомся, це Бруно</h2>
        <p class="prose meet__text">
          У Брашові ведмеді справжні. Вони спускаються з Тимпи просто у місто і
          ходять вулицями так, ніби це вони тут платять за оренду. Тому ввечері
          я триматиму тебе за руку — виключно з міркувань безпеки, ти ж
          розумієш.
        </p>
      </section>

      <div data-reveal>
        <RealBrasov />
      </div>

      <CountdownFirs />

      <section class="road wrap" aria-labelledby="road-title" data-reveal>
        <div class="road__head">
          <p class="eyebrow">дорога</p>
          <h2 id="road-title" class="section-title display">Як ти доїдеш</h2>
          <MarginNote class="road__note" text="усе вже сплановано" :rotate="-4" arrow="down" />
        </div>
        <TripTimeline />
      </section>

      <HugMeter />

      <RsvpBlock />
    </main>

    <footer class="footer wrap">
      <div class="footer__paws" aria-hidden="true">
        <svg v-for="p in 5" :key="p" class="paw" viewBox="0 0 24 24">
          <ellipse cx="12" cy="15" rx="7" ry="5.5" />
          <circle cx="5" cy="8" r="2.6" />
          <circle cx="10" cy="5" r="2.8" />
          <circle cx="16" cy="6" r="2.6" />
          <circle cx="20" cy="10" r="2.3" />
        </svg>
      </div>

      <p class="hand footer__note">зроблено для тебе</p>
      <p class="prose footer__ps">
        P.S. Бруно передає привіт і цікавиться, чи ти привезеш йому щось
        смачненьке. Я сказав, що це не обов’язково. Він засмутився.
      </p>
      <p class="footer__meta">Брашов · липень 2026</p>
    </footer>
  </div>
</template>

<style scoped>
.hero {
  padding-top: clamp(1.5rem, 4vw, 3rem);
}

/* Бруно стоїть на бруківці перед будинками */
.hero__scene {
  position: relative;
}

/* Широка сцена — за замовчуванням, вертикальна вмикається на телефоні. */
.scene--tall {
  display: none;
}

.hero__bear {
  position: absolute;
  left: clamp(0.5rem, 6vw, 5rem);
  bottom: 1.5%;
  display: flex;
  align-items: flex-end;
  gap: 0.25rem;
  --bear-w: clamp(96px, 15vw, 240px);
}

@media (max-width: 40rem) {
  .scene--wide {
    display: none;
  }

  .scene--tall {
    display: block;
  }

  /* Сцена стала вищою — Бруно росте разом із нею. */
  .hero__bear {
    left: 5vw;
    bottom: 2%;
    --bear-w: min(40vw, 190px);
  }
}

@media (max-width: 34rem) {
  .hero__bear-note {
    display: none;
  }
}

.hero__text {
  text-align: center;
  padding-top: clamp(2rem, 5vw, 3.5rem);
}

.hero__head {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.15em;
  margin-top: 0.5rem;
}

.hero__verb {
  font-size: var(--step-1);
  font-weight: 600;
  letter-spacing: 0.16em;
  color: var(--fir-soft);
}

.hero__city {
  font-size: var(--step-4);
  line-height: 0.9;
  letter-spacing: 0.01em;
  color: var(--fir);
}

.hero__date {
  margin-top: 1.2rem;
  font-family: var(--font-body);
  font-weight: 600;
  font-size: var(--step-1);
  color: var(--tile);
}

.hero__lede {
  margin: 1.1rem auto 0;
}

.meet {
  padding-top: clamp(2.5rem, 7vw, 4.5rem);
  text-align: center;
}

.meet__title {
  font-size: clamp(2rem, 5.5vw, 3rem);
  color: var(--fir);
}

.meet__text {
  margin: 0.7rem auto 0;
}

.section-title {
  margin-top: 0.6rem;
  font-size: var(--step-2);
  color: var(--fir);
}

.road {
  padding-block: clamp(1rem, 3vw, 2rem) clamp(3.5rem, 9vw, 6rem);
  display: grid;
  gap: clamp(1.5rem, 4vw, 3.5rem);
}

@media (min-width: 52rem) {
  .road {
    grid-template-columns: 18rem 1fr;
    align-items: start;
  }
}

.road__note {
  margin-top: 1rem;
}

.footer {
  padding-block: clamp(2.5rem, 6vw, 4rem);
  text-align: center;
}

.footer__paws {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  gap: 0.9rem;
  margin-bottom: 1.4rem;
}

.paw {
  width: 22px;
  height: auto;
  fill: var(--sage);
}

.paw:nth-child(even) {
  transform: translateY(9px) rotate(12deg);
}

.paw:nth-child(odd) {
  transform: rotate(-8deg);
}

.footer__note {
  font-size: 1.6rem;
  color: var(--tile);
}

.footer__ps {
  margin: 0.8rem auto 0;
  font-size: 0.92rem;
}

.footer__meta {
  margin-top: 1.2rem;
  font-size: 0.8rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--fir-soft);
}

/* Ховаємо секції тільки там, де є JS, який їх покаже назад.
   Без цієї умови сторінка без скриптів лишилась би напівпорожньою. */
@media (scripting: enabled) {
  [data-reveal] {
    opacity: 0;
    transform: translateY(22px);
    transition: opacity 700ms ease, transform 700ms cubic-bezier(0.22, 1, 0.36, 1);
  }

  [data-reveal].is-visible {
    opacity: 1;
    transform: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  [data-reveal] {
    opacity: 1;
    transform: none;
  }
}
</style>

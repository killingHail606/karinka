<script setup lang="ts">
/* Місток між мальованим містом і справжнім: ті самі площа, літери на Тимпі
   й руді дахи, але вже на фото. Рамки навмисне «полароїдні» й трохи
   перекошені — так знімки читаються як вклеєні в лист, а не як банер. */

const shots = [
  {
    src: '/photos/street.jpg',
    caption: 'тут пахне кавою і мокрим камінням',
    alt: 'Вулиця старого Брашова з теракотовими й вохряними фасадами, попереду квіти, вдалині гора Тимпа з написом BRAȘOV',
    tilt: -1.4,
  },
  {
    src: '/photos/tampa-sign.jpg',
    caption: 'ті самі літери, що й на малюнку',
    alt: 'Напис BRAȘOV на зеленому схилі гори Тимпа над пастельними будинками',
    tilt: 1.2,
  },
  {
    src: '/photos/aerial.jpg',
    caption: 'а це ті руді дахи',
    alt: 'Вид згори на червоні черепичні дахи Брашова серед лісистих гір',
    tilt: -0.8,
  },
]
</script>

<template>
  <section class="real wrap" aria-labelledby="real-title">
    <p class="eyebrow">фотографії</p>
    <h2 id="real-title" class="section-title display">І воно справді таке</h2>
    <p class="prose real__lede">
      Усе, що намальовано вище, існує насправді — площа з кольоровими
      будинками, літери на горі, руді дахи. Ось доказ.
    </p>

    <figure class="hero-shot" :style="{ '--tilt': '0.6deg' }">
      <div class="frame">
        <img
          src="/photos/square.jpg"
          alt="Площа Ради в Брашові: кольорові барокові будинки, бруківка, за ними лісиста гора Тимпа"
          width="1400"
          height="933"
          loading="lazy"
          decoding="async"
        />
      </div>
      <figcaption class="hand">площа Ради — і Тимпа одразу за нею</figcaption>
    </figure>

    <div class="grid">
      <figure
        v-for="shot in shots"
        :key="shot.src"
        class="shot"
        :style="{ '--tilt': `${shot.tilt}deg` }"
      >
        <div class="frame">
          <img :src="shot.src" :alt="shot.alt" loading="lazy" decoding="async" />
        </div>
        <figcaption class="hand">{{ shot.caption }}</figcaption>
      </figure>
    </div>

    <p class="real__credit">
      Фото: Ilie Barna, Gloria Cretu, Jack White, Maria Teneva · Unsplash.
      Свої зробимо вже разом.
    </p>
  </section>
</template>

<style scoped>
.real {
  padding-block: clamp(3rem, 8vw, 5rem) clamp(2rem, 5vw, 3rem);
  text-align: center;
}

.real__lede {
  margin: 0.9rem auto 0;
}

/* спільна рамка-полароїд */
.frame {
  background: #fff;
  padding: clamp(0.5rem, 1.4vw, 0.8rem);
  border-radius: calc(var(--radius) - 6px);
  box-shadow: 0 10px 24px -14px rgba(46, 74, 61, 0.45);
  overflow: hidden;
}

.frame img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: calc(var(--radius) - 12px);
}

.hero-shot,
.shot {
  margin: 0;
  transform: rotate(var(--tilt, 0deg));
  transition: transform 320ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

.hero-shot:hover,
.shot:hover {
  transform: rotate(0deg) translateY(-6px) scale(1.015);
}

.hero-shot {
  margin-top: clamp(2rem, 5vw, 3rem);
}

.hero-shot .frame {
  aspect-ratio: 3 / 2;
}

figcaption {
  margin-top: 0.7rem;
  font-size: clamp(1.15rem, 2.4vw, 1.5rem);
  color: var(--tile);
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 15rem), 1fr));
  gap: clamp(1.6rem, 4vw, 2.4rem);
  margin-top: clamp(2.2rem, 5vw, 3rem);
}

.shot .frame {
  aspect-ratio: 1 / 1;
}

.real__credit {
  margin-top: clamp(2rem, 5vw, 3rem);
  font-size: 0.78rem;
  color: var(--fir-soft);
  opacity: 0.85;
}

@media (prefers-reduced-motion: reduce) {
  .hero-shot,
  .shot,
  .hero-shot:hover,
  .shot:hover {
    transform: rotate(var(--tilt, 0deg));
  }
}
</style>

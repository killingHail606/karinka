export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  // Railway запускає це як звичайний Node-сервіс і сам передає PORT,
  // який Nitro підхоплює без додаткових налаштувань.
  nitro: { preset: 'node-server' },
  app: {
    head: {
      htmlAttrs: { lang: 'uk' },
      title: 'Карінко, приїзди до мене в Брашов',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content: '30 липня, 23:30 — автобус. 31-го ти вже в Брашові. Запрошення для Карінки.',
        },
        { name: 'theme-color', content: '#FDF2EC' },
        { property: 'og:title', content: 'Карінко, приїзди до мене в Брашов' },
        { property: 'og:description', content: 'Гори, пофарбовані будиночки, ведмідь Бруно і я.' },
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Caveat:wght@500;600;700&family=Onest:wght@400;500;600&family=Unbounded:wght@600;800&display=swap',
        },
      ],
    },
  },
})

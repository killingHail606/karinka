/* Перемикання світла/темряви.
   За замовчуванням завжди світла тема: жодного localStorage і жодного
   слідування за системними налаштуваннями — на кожне свіже завантаження
   сторінка світла. Тому й миготіння теми на старті бути не може.

   Перехід — коло, що розходиться від самого перемикача, через
   View Transitions API. Де його немає (або ввімкнено «менше руху») —
   тема просто змінюється, а кольори плавно перетікають через CSS. */

type Theme = 'light' | 'dark'

// Модульний стан: спільний для перемикача й будь-чого ще на сторінці.
const isDark = ref(false)

function apply(theme: Theme) {
  const el = document.documentElement
  if (theme === 'dark') el.dataset.theme = 'dark'
  else delete el.dataset.theme

  isDark.value = theme === 'dark'

  // Колір системного UI браузера (адресний рядок на мобільних).
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', theme === 'dark' ? '#18231d' : '#FDF2EC')
}

export function useTheme() {
  function toggle(event?: MouseEvent) {
    const next: Theme = isDark.value ? 'light' : 'dark'

    const reduce =
      import.meta.client &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const doc = document as any

    if (!import.meta.client || reduce || typeof doc.startViewTransition !== 'function') {
      apply(next)
      return
    }

    // Точка, з якої розходиться коло — центр перемикача (або курсор).
    const x = event?.clientX ?? window.innerWidth - 48
    const y = event?.clientY ?? 48
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    )

    const transition = doc.startViewTransition(() => apply(next))

    transition.ready.then(() => {
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${endRadius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 600,
          easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
          pseudoElement: '::view-transition-new(root)',
        },
      )
    })
  }

  return { isDark: readonly(isDark), toggle }
}

/* Спільний стан для всіх Бруно на сторінці: одна підписка на курсор
   замість чотирьох, і спільний настрій, щоб на «Так» святкували всі одразу. */

const pointerX = ref(0)
const pointerY = ref(0)
const pointerSeen = ref(false)
const celebrating = ref(false)

let bound = false
let celebrationTimer: ReturnType<typeof setTimeout> | undefined

function bindPointer() {
  if (bound || !import.meta.client) return
  bound = true

  let frame = 0
  const onMove = (e: PointerEvent) => {
    if (frame) return
    frame = requestAnimationFrame(() => {
      frame = 0
      pointerX.value = e.clientX
      pointerY.value = e.clientY
      pointerSeen.value = true
    })
  }

  window.addEventListener('pointermove', onMove, { passive: true })
}

export function useBruno() {
  bindPointer()

  function celebrate(ms = 7000) {
    celebrating.value = true
    if (celebrationTimer) clearTimeout(celebrationTimer)
    celebrationTimer = setTimeout(() => {
      celebrating.value = false
    }, ms)
  }

  return { pointerX, pointerY, pointerSeen, celebrating, celebrate }
}

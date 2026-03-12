import { useEffect, useRef } from 'react'

/**
 * Silently re-runs `callback` every `intervalMs` while the tab is visible,
 * and immediately when the tab regains focus.
 *
 * Uses a ref so the latest callback is always called without restarting the interval.
 * Safe to call in any Client Component — cleans up on unmount automatically.
 */
export function useAutoRefresh(callback: () => void, intervalMs = 30_000) {
  const cbRef = useRef(callback)
  cbRef.current = callback

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null

    function start() {
      if (timer !== null) clearInterval(timer)
      timer = setInterval(() => {
        if (document.visibilityState === 'visible') cbRef.current()
      }, intervalMs)
    }

    function stop() {
      if (timer !== null) { clearInterval(timer); timer = null }
    }

    function handleVisibility() {
      if (document.visibilityState === 'visible') {
        cbRef.current() // immediate refresh when tab comes back into focus
        start()
      } else {
        stop()
      }
    }

    start()
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      stop()
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [intervalMs])
}

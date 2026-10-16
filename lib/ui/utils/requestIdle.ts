const idleTimeoutMs = 2000
const noIdleCallbackDelayMs = 200

/** Runs `callback` once the browser is idle (at most 2 s late); returns a cancel. */
export const requestIdle = (callback: () => void) => {
  if (typeof requestIdleCallback === 'function') {
    const id = requestIdleCallback(callback, { timeout: idleTimeoutMs })

    return () => cancelIdleCallback(id)
  }

  const id = setTimeout(callback, noIdleCallbackDelayMs)

  return () => clearTimeout(id)
}

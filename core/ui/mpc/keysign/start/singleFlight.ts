type SingleFlightGate = { current: boolean }

type SingleFlightInput<T> = {
  /** Shared flag marking a run in progress, typically a ref. */
  gate: SingleFlightGate
  run: () => Promise<T>
}

/**
 * Runs `run` only when no earlier call is still in flight; a call that arrives
 * during one resolves to `null` instead of starting a second.
 *
 * Rebuilding a keysign payload takes a network round-trip, and the button that
 * triggers it gives no feedback while that happens — so a second click is
 * likely rather than hypothetical. Without this, two rebuilds race and both go
 * on to start a keysign ceremony, the later one interrupting the session the
 * earlier one already opened.
 *
 * The flag is checked and set in the same synchronous step, with no `await`
 * between them, so exactly one caller can win. It is released even when `run`
 * throws, otherwise a single failure would wedge the button for good.
 */
export const singleFlight = async <T>({
  gate,
  run,
}: SingleFlightInput<T>): Promise<T | null> => {
  if (gate.current) {
    return null
  }

  gate.current = true

  try {
    return await run()
  } finally {
    gate.current = false
  }
}

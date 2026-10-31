/**
 * A dApp request on screen, in a popup window or in the side panel.
 * `abortSignal` fires when the user takes it off screen without answering,
 * `close` takes it off screen, and `release` stops watching it once the
 * request has settled.
 */
export type PopupSurface = {
  abortSignal: AbortSignal
  close: () => void
  release: () => void
}

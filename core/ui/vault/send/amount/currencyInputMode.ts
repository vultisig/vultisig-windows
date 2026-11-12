/** The units a send amount can be typed in: the coin itself or fiat. */
export const currencyInputModes = ['base', 'fiat'] as const

/** A unit a send amount can be typed in. */
export type CurrencyInputMode = (typeof currencyInputModes)[number]

/** Width of the asset/fiat switch, matched on the amount's other side so the amount stays centred. */
export const currencySwitchWidthPx = 38

/** SwiftUI's `.spring(duration: 0.35, bounce: 0.2)`: its duration is perceptual, as framer's `visualDuration` is. */
export const currencySwapSpring = {
  type: 'spring',
  visualDuration: 0.35,
  bounce: 0.2,
} as const

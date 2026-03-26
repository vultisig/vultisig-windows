import { setupStateProvider } from '@lib/ui/state/setupStateProvider'

/**
 * Stores the original name-service label (e.g. "vitalik.eth") that was
 * typed by the user and resolved to a raw address. Empty string when no
 * label is active (user typed a raw address directly).
 */
export const [SendReceiverLabelProvider, useSendReceiverLabel] =
  setupStateProvider<string>('SendReceiverLabel', '')

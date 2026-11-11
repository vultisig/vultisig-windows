import { setupStateProvider } from '@lib/ui/state/setupStateProvider'

/**
 * The receiver as the user entered it: an address, or a name to resolve.
 * Whatever needs the address to send to reads `useSendReceiverAddress`.
 */
export const [SendReceiverProvider, useSendReceiver] =
  setupStateProvider<string>('SendReceiver')

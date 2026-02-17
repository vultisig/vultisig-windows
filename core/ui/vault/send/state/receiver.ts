import { setupStateProvider } from '@lib/ui/state/setupStateProvider'

export const [SendReceiverProvider, useSendReceiver] =
  setupStateProvider<string>('SendReceiver')

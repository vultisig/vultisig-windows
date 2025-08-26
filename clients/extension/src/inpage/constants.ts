import { Messaging } from '../utils/interfaces'

export type Callback = (
  error: Error | null,
  result?: Messaging.Chain.Response | void
) => void

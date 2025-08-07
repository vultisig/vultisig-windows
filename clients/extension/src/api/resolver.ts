import { ExtensionApiContext } from './context'
import { ExtensionApiMessage } from './index'

export type ExtensionApiResolver<T extends ExtensionApiMessage> = (input: {
  message: T
  context: ExtensionApiContext
}) => Promise<unknown>

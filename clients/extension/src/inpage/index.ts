import { shouldInjectProvider } from './utils/injectHelpers'
import { injectToWindow } from './utils/windowInjector'

if (shouldInjectProvider()) {
  injectToWindow()
}

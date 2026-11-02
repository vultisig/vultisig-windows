import { productName } from '@vultisig/core-config'
import { isOneOf } from '@vultisig/lib-utils/array/isOneOf'

const sidePanelPopupRequestSourceId =
  `${productName}-popup--side-panel` as const

/**
 * Background → extension pages: asks the side panel open in `windowId` to
 * show the popup page at `url`. The panel claims the request by connecting a
 * port named `portName` and answering `true`; the background then drives it
 * over that port with {@link SidePanelPopupCommand}s, and reads the port
 * closing as the panel going away.
 */
export type SidePanelPopupRequest = {
  sourceId: typeof sidePanelPopupRequestSourceId
  windowId: number
  url: string
  portName: string
}

/** Builds a {@link SidePanelPopupRequest} for the background to broadcast. */
export const createSidePanelPopupRequest = (
  input: Omit<SidePanelPopupRequest, 'sourceId'>
): SidePanelPopupRequest => ({
  ...input,
  sourceId: sidePanelPopupRequestSourceId,
})

/** Whether a runtime message is a {@link SidePanelPopupRequest}. */
export const isSidePanelPopupRequest = (
  message: unknown
): message is SidePanelPopupRequest =>
  typeof message === 'object' &&
  message !== null &&
  'sourceId' in message &&
  message.sourceId === sidePanelPopupRequestSourceId

const sidePanelPopupCommands = ['show', 'close'] as const

/**
 * What the background sends the side panel over a claimed port: `show` once
 * it has taken the claim, `close` when the request should leave the screen.
 * The panel waits for `show`, so a claim the background gave up on never
 * shows up next to the popup window it fell back to.
 */
export type SidePanelPopupCommand = (typeof sidePanelPopupCommands)[number]

/** Whether a port message is a {@link SidePanelPopupCommand}. */
export const isSidePanelPopupCommand = (
  message: unknown
): message is SidePanelPopupCommand => isOneOf(message, sidePanelPopupCommands)

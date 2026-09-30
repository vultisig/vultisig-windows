/**
 * Events the background pushes to dApp tabs. `accountsChanged` carries no
 * value: providers re-read their accounts, since what a site may see
 * depends on the provider's chain and the session's account access.
 */
export type BackgroundEventsInterface = {
  accountsChanged: void
  disconnect: void
  evmChainChanged: string
}

/** Name of an event the background can push to dApp tabs. */
export type BackgroundEvent = keyof BackgroundEventsInterface

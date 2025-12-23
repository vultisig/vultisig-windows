export type BackgroundEventsInterface = {
  disconnect: void
  evmChainChanged: string
}

export type BackgroundEvent = keyof BackgroundEventsInterface

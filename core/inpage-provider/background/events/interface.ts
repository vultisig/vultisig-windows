export type BackgroundEventsInterface = {
  disconnect: void
}

export type BackgroundEvent = keyof BackgroundEventsInterface

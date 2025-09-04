import { BackgroundEvent } from './interface'

export const backgroundEventSubscriptions: Record<
  string,
  Record<BackgroundEvent, string>
> = {}

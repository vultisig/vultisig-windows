import { BackgroundEvent } from './interface'

export const backgroundEventSubscriptions: Record<
  string,
  Partial<Record<BackgroundEvent, string>>
> = {}

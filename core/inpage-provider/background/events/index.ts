import { BackgroundEvent, BackgroundEventsInterface } from './interface'

export const addBackgroundEventListener = <T extends BackgroundEvent>(
  event: T,
  handler: (payload: BackgroundEventsInterface[T]) => void
) => {
  //todo
}

import { setupStateProvider } from '@lib/ui/state/setupStateProvider'

export const [MoneroBirthdayProvider, useMoneroBirthday] = setupStateProvider<
  number | null
>('MoneroBirthday')

import { setupStateProvider } from '@lib/ui/state/setupStateProvider'

export const [ZcashBirthdayProvider, useZcashBirthday] = setupStateProvider<
  number | null
>('ZcashBirthday')

import { setupStateProvider } from '@lib/ui/state/setupStateProvider'

export const [EmailProvider, useEmail] = setupStateProvider<string>('Email')

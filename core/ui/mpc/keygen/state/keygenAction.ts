import { KeygenStep } from '@core/mpc/keygen/KeygenStep'
import { Vault } from '@core/vault/Vault'
import { getValueProviderSetup } from '@lib/ui/state/getValueProviderSetup'

type KeygenActionInput = {
  onStepChange: (step: KeygenStep) => void
  peers: string[]
}

export type KeygenAction = (input: KeygenActionInput) => Promise<Vault>

export const { useValue: useKeygenAction, provider: KeygenActionProvider } =
  getValueProviderSetup<KeygenAction>('KeygenAction')

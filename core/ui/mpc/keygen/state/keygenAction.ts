import { KeygenStep } from '@core/mpc/keygen/KeygenStep'
import { Vault } from '@core/mpc/vault/Vault'
import { setupValueProvider } from '@lib/ui/state/setupValueProvider'

type KeygenActionInput = {
  onStepChange: (step: KeygenStep) => void
  signers: string[]
}

export type KeygenAction = (input: KeygenActionInput) => Promise<Vault>

export const [KeygenActionProvider, useKeygenAction] =
  setupValueProvider<KeygenAction>('KeygenAction')

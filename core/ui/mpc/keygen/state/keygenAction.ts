import { setupValueProvider } from '@lib/ui/state/setupValueProvider'
import { KeygenStep } from '@vultisig/core-mpc/keygen/KeygenStep'
import { Vault } from '@vultisig/core-mpc/vault/Vault'

type KeygenActionInput = {
  onStepChange: (step: KeygenStep) => void
  onStepStart: (step: KeygenStep) => void
  onStepComplete: (step: KeygenStep) => void
  signers: string[]
}

export type KeygenAction = (input: KeygenActionInput) => Promise<Vault>

export type ProtocolStatuses = Partial<
  Record<KeygenStep, { status: 'in_progress' | 'completed' }>
>

export const [KeygenActionProvider, useKeygenAction] =
  setupValueProvider<KeygenAction>('KeygenAction')

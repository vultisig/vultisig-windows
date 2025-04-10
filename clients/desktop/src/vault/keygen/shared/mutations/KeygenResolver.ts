import { KeygenStep } from '@core/mpc/keygen/KeygenStep'
import { Vault } from '@core/ui/vault/Vault'

type KeygenResolverInput = {
  onStepChange: (step: KeygenStep) => void
}

export type KeygenResolver = ({
  onStepChange,
}: KeygenResolverInput) => Promise<Vault>

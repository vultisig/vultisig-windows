import { hasServer, isServer } from '@core/mpc/devices/localPartyId'
import { ServerEmailStep } from '@core/ui/mpc/keygen/create/fast/server/email/ServerEmailStep'
import { ServerPasswordStep } from '@core/ui/mpc/keygen/create/fast/server/password/ServerPasswordStep'
import { SetServerPasswordStep } from '@core/ui/mpc/keygen/create/fast/server/password/SetServerPasswordStep'
import { FastKeygenFlow } from '@core/ui/mpc/keygen/fast/FastKeygenFlow'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { StepTransition } from '@lib/ui/base/StepTransition'
import { ValueTransfer } from '@lib/ui/base/ValueTransfer'

import { PasswordProvider } from '../../../../state/password'

export const FastVaultReshareFlow = () => {
  const { signers, localPartyId } = useCurrentVault()

  return (
    <StepTransition
      from={({ onFinish }) => <ServerEmailStep onFinish={onFinish} />}
      to={({ onBack }) => (
        <ValueTransfer<{ password: string }>
          from={({ onFinish }) =>
            hasServer(signers) && !isServer(localPartyId) ? (
              <ServerPasswordStep onFinish={onFinish} onBack={onBack} />
            ) : (
              <SetServerPasswordStep onFinish={onFinish} onBack={onBack} />
            )
          }
          to={({ value: { password }, onBack }) => (
            <PasswordProvider initialValue={password}>
              <FastKeygenFlow onBack={onBack} />
            </PasswordProvider>
          )}
        />
      )}
    />
  )
}

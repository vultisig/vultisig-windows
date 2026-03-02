import { hasServer } from '@core/mpc/devices/localPartyId'
import { FastKeygenFlow } from '@core/ui/mpc/keygen/fast/FastKeygenFlow'
import { KeygenFlow } from '@core/ui/mpc/keygen/flow/KeygenFlow'
import { KeygenPeerDiscoveryStep } from '@core/ui/mpc/keygen/peers/KeygenPeerDiscoveryStep'
import { ReshareVaultFlowProviders } from '@core/ui/mpc/keygen/reshare/ReshareVaultFlowProviders'
import { KeygenOperationProvider } from '@core/ui/mpc/keygen/state/currentKeygenOperationType'
import { StartMpcSessionFlow } from '@core/ui/mpc/session/StartMpcSessionFlow'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { useCoreViewState } from '@core/ui/navigation/hooks/useCoreViewState'
import { EmailProvider } from '@core/ui/state/email'
import { PasswordProvider } from '@core/ui/state/password'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { StepTransition } from '@lib/ui/base/StepTransition'

import { AddChainKeysKeygenActionProvider } from '../../../../mpc/keygen/addChainKeys/AddChainKeysKeygenActionProvider'

export const AddChainKeysPage = () => {
  const [{ keyGroup }] = useCoreViewState<'addChainKeys'>()
  const vault = useCurrentVault()
  const navigate = useCoreNavigate()
  const isFastVault = hasServer(vault.signers)

  return (
    <ReshareVaultFlowProviders>
      <KeygenOperationProvider value={{ addChainKeys: keyGroup }}>
        <AddChainKeysKeygenActionProvider>
          {isFastVault ? (
            <PasswordProvider initialValue="">
              <EmailProvider initialValue="">
                <FastKeygenFlow
                  onBack={() => navigate({ id: 'manageVaultChains' })}
                />
              </EmailProvider>
            </PasswordProvider>
          ) : (
            <StepTransition
              from={({ onFinish }) => (
                <KeygenPeerDiscoveryStep
                  onBack={() => navigate({ id: 'manageVaultChains' })}
                  onFinish={onFinish}
                />
              )}
              to={({ onBack }) => (
                <StartMpcSessionFlow
                  value="keygen"
                  render={() => <KeygenFlow onBack={onBack} />}
                />
              )}
            />
          )}
        </AddChainKeysKeygenActionProvider>
      </KeygenOperationProvider>
    </ReshareVaultFlowProviders>
  )
}

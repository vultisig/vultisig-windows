import { GeneratedHexEncryptionKeyProvider } from '@core/ui/mpc/state/currentHexEncryptionKey'
import { IsInitiatingDeviceProvider } from '@core/ui/mpc/state/isInitiatingDevice'
import { MpcLocalPartyIdProvider } from '@core/ui/mpc/state/mpcLocalPartyId'
import { MpcServerTypeProvider } from '@core/ui/mpc/state/mpcServerType'
import { GeneratedMpcServiceNameProvider } from '@core/ui/mpc/state/mpcServiceName'
import { GeneratedMpcSessionIdProvider } from '@core/ui/mpc/state/mpcSession'
import { ServerUrlDerivedFromServerTypeProvider } from '@core/ui/mpc/state/serverUrlDerivedFromServerType'
import { PasscodeAutoLockHold } from '@core/ui/passcodeEncryption/autoLock/PasscodeAutoLockHold'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { ChildrenProp } from '@lib/ui/props'

/**
 * Sets up the session a keysign started on this device runs in and, for as
 * long as it is mounted, holds the passcode auto-lock. The initiator can wait
 * minutes for its co-signers with no local interaction, and the signing step
 * then starts on its own; under the lock it would read the stored, still
 * encrypted key shares and fail.
 */
export const StartKeysignProviders = ({ children }: ChildrenProp) => {
  const { localPartyId } = useCurrentVault()

  return (
    <IsInitiatingDeviceProvider value={true}>
      <MpcLocalPartyIdProvider value={localPartyId}>
        <GeneratedMpcServiceNameProvider>
          <GeneratedMpcSessionIdProvider>
            <GeneratedHexEncryptionKeyProvider>
              <MpcServerTypeProvider initialValue="relay">
                <ServerUrlDerivedFromServerTypeProvider>
                  <PasscodeAutoLockHold />
                  {children}
                </ServerUrlDerivedFromServerTypeProvider>
              </MpcServerTypeProvider>
            </GeneratedHexEncryptionKeyProvider>
          </GeneratedMpcSessionIdProvider>
        </GeneratedMpcServiceNameProvider>
      </MpcLocalPartyIdProvider>
    </IsInitiatingDeviceProvider>
  )
}

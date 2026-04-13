import { useCurrentHexChainCode } from '@core/ui/mpc/state/currentHexChainCode'
import { useCurrentHexEncryptionKey } from '@core/ui/mpc/state/currentHexEncryptionKey'
import { useMpcSessionId } from '@core/ui/mpc/state/mpcSession'
import { ChildrenProp } from '@lib/ui/props'
import { generateLocalPartyId } from '@vultisig/core-mpc/devices/localPartyId'
import { createVaultWithServer } from '@vultisig/core-mpc/fast/api/createVaultWithServer'
import { setupVaultWithServer } from '@vultisig/core-mpc/fast/api/setupVaultWithServer'
import { toLibType } from '@vultisig/core-mpc/types/utils/libType'
import { getRecordUnionValue } from '@vultisig/lib-utils/record/union/getRecordUnionValue'

import { featureFlags } from '../../../../featureFlags'
import { useCore } from '../../../../state/core'
import { useIsMLDSAEnabled } from '../../../../storage/mldsaEnabled'
import { useIsTssBatchingEnabled } from '../../../../storage/tssBatchingEnabled'
import { FastKeygenServerActionProvider } from '../../fast/state/fastKeygenServerAction'
import { useVaultCreationInput } from '../state/vaultCreationInput'

export const CreateFastKeygenServerActionProvider = ({
  children,
}: ChildrenProp) => {
  const input = useVaultCreationInput()

  const { name, email, password } = getRecordUnionValue(input, 'fast')
  const sessionId = useMpcSessionId()
  const hexChainCode = useCurrentHexChainCode()
  const hexEncryptionKey = useCurrentHexEncryptionKey()
  const isMLDSAEnabled = useIsMLDSAEnabled()
  const isTssBatchingEnabled = useIsTssBatchingEnabled()
  const { vaultCreationMpcLib } = useCore()

  const action = async () => {
    if (isTssBatchingEnabled) {
      const protocols = ['ecdsa', 'eddsa']
      if (featureFlags.mldsaKeygen && isMLDSAEnabled) {
        protocols.push('mldsa')
      }

      await setupVaultWithServer({
        name,
        encryption_password: password,
        session_id: sessionId,
        hex_chain_code: hexChainCode,
        local_party_id: generateLocalPartyId('server'),
        email,
        hex_encryption_key: hexEncryptionKey,
        protocols,
      })
    } else {
      await createVaultWithServer({
        name,
        encryption_password: password,
        session_id: sessionId,
        hex_chain_code: hexChainCode,
        local_party_id: generateLocalPartyId('server'),
        email,
        hex_encryption_key: hexEncryptionKey,
        lib_type: toLibType(vaultCreationMpcLib),
      })
    }
  }

  return (
    <FastKeygenServerActionProvider value={action}>
      {children}
    </FastKeygenServerActionProvider>
  )
}

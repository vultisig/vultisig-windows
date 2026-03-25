import { generateLocalPartyId } from '@core/mpc/devices/localPartyId'
import { keyImportWithServer } from '@core/mpc/fast/api/keyImportWithServer'
import { sequentialKeyImportWithServer } from '@core/mpc/fast/api/sequentialKeyImportWithServer'
import { toLibType } from '@core/mpc/types/utils/libType'
import { featureFlags } from '@core/ui/featureFlags'
import { useVaultCreationInput } from '@core/ui/mpc/keygen/create/state/vaultCreationInput'
import { useCurrentHexChainCode } from '@core/ui/mpc/state/currentHexChainCode'
import { useCurrentHexEncryptionKey } from '@core/ui/mpc/state/currentHexEncryptionKey'
import { useMpcSessionId } from '@core/ui/mpc/state/mpcSession'
import { useIsMLDSAEnabled } from '@core/ui/storage/mldsaEnabled'
import { useIsTssBatchingEnabled } from '@core/ui/storage/tssBatchingEnabled'
import { ChildrenProp } from '@lib/ui/props'
import { getRecordUnionValue } from '@lib/utils/record/union/getRecordUnionValue'

import { FastKeygenServerActionProvider } from '../../fast/state/fastKeygenServerAction'
import { useKeyImportInput } from '../state/keyImportInput'

export const KeyImportFastKeygenServerActionProvider = ({
  children,
}: ChildrenProp) => {
  const input = useVaultCreationInput()

  const { name, email, password } = getRecordUnionValue(input, 'fast')
  const sessionId = useMpcSessionId()
  const hexChainCode = useCurrentHexChainCode()
  const hexEncryptionKey = useCurrentHexEncryptionKey()
  const { chains } = useKeyImportInput()
  const isTssBatchingEnabled = useIsTssBatchingEnabled()
  const isMLDSAEnabled = useIsMLDSAEnabled()

  const action = async () => {
    if (isTssBatchingEnabled) {
      await keyImportWithServer({
        name,
        encryption_password: password,
        session_id: sessionId,
        local_party_id: generateLocalPartyId('server'),
        email,
        hex_encryption_key: hexEncryptionKey,
        lib_type: toLibType('KeyImport'),
        protocols:
          featureFlags.mldsaKeygen && isMLDSAEnabled
            ? ['ecdsa', 'eddsa', 'mldsa']
            : ['ecdsa', 'eddsa'],
        chains,
      })
    } else {
      await sequentialKeyImportWithServer({
        name,
        encryption_password: password,
        session_id: sessionId,
        hex_chain_code: hexChainCode,
        local_party_id: generateLocalPartyId('server'),
        email,
        hex_encryption_key: hexEncryptionKey,
        lib_type: toLibType('KeyImport'),
        chains,
      })
    }
  }

  return (
    <FastKeygenServerActionProvider value={action}>
      {children}
    </FastKeygenServerActionProvider>
  )
}

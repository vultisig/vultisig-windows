import { useVaultCreationInput } from '@core/ui/mpc/keygen/create/state/vaultCreationInput'
import { useCurrentHexChainCode } from '@core/ui/mpc/state/currentHexChainCode'
import { useCurrentHexEncryptionKey } from '@core/ui/mpc/state/currentHexEncryptionKey'
import { useMpcSessionId } from '@core/ui/mpc/state/mpcSession'
import { useIsTssBatchingEnabled } from '@core/ui/storage/tssBatchingEnabled'
import { ChildrenProp } from '@lib/ui/props'
import { generateLocalPartyId } from '@vultisig/core-mpc/devices/localPartyId'
import { keyImportWithServer } from '@vultisig/core-mpc/fast/api/keyImportWithServer'
import { sequentialKeyImportWithServer } from '@vultisig/core-mpc/fast/api/sequentialKeyImportWithServer'
import { toLibType } from '@vultisig/core-mpc/types/utils/libType'
import { getRecordUnionValue } from '@vultisig/lib-utils/record/union/getRecordUnionValue'

import { FastKeygenServerActionProvider } from '../../fast/state/fastKeygenServerAction'
import { useKeyImportInput } from '../state/keyImportInput'
import { getKeyImportDerivationGroups } from '../utils/getKeyImportDerivationGroups'

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

  const action = async () => {
    const derivationGroups = getKeyImportDerivationGroups(chains)
    const representativeChains = derivationGroups.map(
      group => group.representativeChain
    )

    if (isTssBatchingEnabled) {
      await keyImportWithServer({
        name,
        encryption_password: password,
        session_id: sessionId,
        local_party_id: generateLocalPartyId('server'),
        email,
        hex_encryption_key: hexEncryptionKey,
        lib_type: toLibType({ libType: 'DKLS', isKeyImport: true }),
        protocols: ['ecdsa', 'eddsa'],
        chains: representativeChains,
      })
    } else {
      await sequentialKeyImportWithServer({
        name,
        encryption_password: password,
        session_id: sessionId,
        local_party_id: generateLocalPartyId('server'),
        email,
        hex_encryption_key: hexEncryptionKey,
        hex_chain_code: hexChainCode,
        lib_type: toLibType({ libType: 'DKLS', isKeyImport: true }),
        chains: representativeChains,
      })
    }
  }

  return (
    <FastKeygenServerActionProvider value={action}>
      {children}
    </FastKeygenServerActionProvider>
  )
}

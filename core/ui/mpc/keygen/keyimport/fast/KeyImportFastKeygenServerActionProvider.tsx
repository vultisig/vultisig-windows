import { useVaultCreationInput } from '@core/ui/mpc/keygen/create/state/vaultCreationInput'
import { useCurrentHexChainCode } from '@core/ui/mpc/state/currentHexChainCode'
import { useCurrentHexEncryptionKey } from '@core/ui/mpc/state/currentHexEncryptionKey'
import { useIsTssBatching } from '@core/ui/mpc/state/isTssBatching'
import { useMpcSessionId } from '@core/ui/mpc/state/mpcSession'
import { ChildrenProp } from '@lib/ui/props'
import { generateLocalPartyId } from '@vultisig/core-mpc/devices/localPartyId'
import { keyImportWithServer } from '@vultisig/core-mpc/fast/api/keyImportWithServer'
import { sequentialKeyImportWithServer } from '@vultisig/core-mpc/fast/api/sequentialKeyImportWithServer'
import { toLibType } from '@vultisig/core-mpc/types/utils/libType'
import { getRecordUnionValue } from '@vultisig/lib-utils/record/union/getRecordUnionValue'

import { FastKeygenServerActionProvider } from '../../fast/state/fastKeygenServerAction'
import {
  isStationTerraRootKeyImportInput,
  KeyImportInput,
  useKeyImportInput,
} from '../state/keyImportInput'
import { getKeyImportDerivationGroups } from '../utils/getKeyImportDerivationGroups'

export const getKeyImportServerRepresentativeChains = (
  keyImportInput: KeyImportInput
) => {
  if (isStationTerraRootKeyImportInput(keyImportInput)) return []

  return getKeyImportDerivationGroups(keyImportInput.chains).map(
    group => group.representativeChain
  )
}

export const getKeyImportServerProtocols = (keyImportInput: KeyImportInput) =>
  isStationTerraRootKeyImportInput(keyImportInput)
    ? (['ecdsa'] as const)
    : (['ecdsa', 'eddsa'] as const)

export const KeyImportFastKeygenServerActionProvider = ({
  children,
}: ChildrenProp) => {
  const input = useVaultCreationInput()

  const { name, email, password } = getRecordUnionValue(input, 'fast')
  const sessionId = useMpcSessionId()
  const hexChainCode = useCurrentHexChainCode()
  const hexEncryptionKey = useCurrentHexEncryptionKey()
  const keyImportInput = useKeyImportInput()
  const isTssBatchingEnabled = useIsTssBatching()
  const isStationTerraRoot = isStationTerraRootKeyImportInput(keyImportInput)

  const action = async () => {
    const representativeChains =
      getKeyImportServerRepresentativeChains(keyImportInput)
    const protocols = [...getKeyImportServerProtocols(keyImportInput)]

    if (isTssBatchingEnabled || isStationTerraRoot) {
      await keyImportWithServer({
        name,
        encryption_password: password,
        session_id: sessionId,
        local_party_id: generateLocalPartyId('server'),
        email,
        hex_encryption_key: hexEncryptionKey,
        lib_type: toLibType('KeyImport'),
        protocols,
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
        lib_type: toLibType('KeyImport'),
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

import { useVaultCreationInput } from '@core/ui/mpc/keygen/create/state/vaultCreationInput'
import { useCurrentHexEncryptionKey } from '@core/ui/mpc/state/currentHexEncryptionKey'
import { useMpcSessionId } from '@core/ui/mpc/state/mpcSession'
import { ChildrenProp } from '@lib/ui/props'
import { generateLocalPartyId } from '@vultisig/core-mpc/devices/localPartyId'
import { keyImportWithServer } from '@vultisig/core-mpc/fast/api/keyImportWithServer'
import { toLibType } from '@vultisig/core-mpc/types/utils/libType'
import { getRecordUnionValue } from '@vultisig/lib-utils/record/union/getRecordUnionValue'
import { useCallback } from 'react'

import { FastKeygenServerActionProvider } from '../../fast/state/fastKeygenServerAction'
import { useKeyImportInput } from '../state/keyImportInput'
import { getKeyImportDerivationGroups } from '../utils/getKeyImportDerivationGroups'

export const KeyImportFastKeygenServerActionProvider = ({
  children,
}: ChildrenProp) => {
  const input = useVaultCreationInput()

  const { name, email, password } = getRecordUnionValue(input, 'fast')
  const sessionId = useMpcSessionId()
  const hexEncryptionKey = useCurrentHexEncryptionKey()
  const { chains } = useKeyImportInput()

  const action = useCallback(async () => {
    const derivationGroups = getKeyImportDerivationGroups(chains)
    const representativeChains = derivationGroups.map(
      group => group.representativeChain
    )

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
  }, [email, hexEncryptionKey, name, password, sessionId, chains])

  return (
    <FastKeygenServerActionProvider value={action}>
      {children}
    </FastKeygenServerActionProvider>
  )
}

import { Chain } from '@core/chain/Chain'
import { groupChainsByDerivationPath } from '@core/chain/derivationPath'
import { frostOnlyChains } from '@core/chain/froztChains'
import { generateLocalPartyId } from '@core/mpc/devices/localPartyId'
import { keyImportWithServer } from '@core/mpc/fast/api/keyImportWithServer'
import { toLibType } from '@core/mpc/types/utils/libType'
import { useVaultCreationInput } from '@core/ui/mpc/keygen/create/state/vaultCreationInput'
import { useCurrentHexEncryptionKey } from '@core/ui/mpc/state/currentHexEncryptionKey'
import { useMpcSessionId } from '@core/ui/mpc/state/mpcSession'
import { ChildrenProp } from '@lib/ui/props'
import { getRecordUnionValue } from '@lib/utils/record/union/getRecordUnionValue'
import { useCallback } from 'react'

import { FastKeygenServerActionProvider } from '../../fast/state/fastKeygenServerAction'
import { useKeyImportInput } from '../state/keyImportInput'

export const KeyImportFastKeygenServerActionProvider = ({
  children,
}: ChildrenProp) => {
  const input = useVaultCreationInput()

  const { name, email, password } = getRecordUnionValue(input, 'fast')
  const sessionId = useMpcSessionId()
  const hexEncryptionKey = useCurrentHexEncryptionKey()
  const { chains } = useKeyImportInput()

  const action = useCallback(async () => {
    const nonFrostChains = chains.filter(c => !frostOnlyChains.includes(c))
    const groups = groupChainsByDerivationPath(nonFrostChains)
    const chainGroupIds = groups.map(g => g.groupId)

    const protocols = ['ecdsa', 'eddsa']
    if (chains.includes(Chain.ZcashSapling)) protocols.push('frozt')
    if (chains.includes(Chain.Monero)) protocols.push('fromt')

    await keyImportWithServer({
      name,
      encryption_password: password,
      session_id: sessionId,
      local_party_id: generateLocalPartyId('server'),
      email,
      hex_encryption_key: hexEncryptionKey,
      lib_type: toLibType('KeyImport'),
      protocols,
      chains: chainGroupIds,
    })
  }, [email, hexEncryptionKey, name, password, sessionId, chains])

  return (
    <FastKeygenServerActionProvider value={action}>
      {children}
    </FastKeygenServerActionProvider>
  )
}

import { FeeSettings } from '@core/mpc/keysign/chainSpecific/FeeSettings'
import { getVaultId } from '@core/mpc/vault/Vault'
import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import {
  useCurrentVault,
  useCurrentVaultPublicKey,
} from '@core/ui/vault/state/currentVault'
import { noRefetchQueryOptions } from '@lib/ui/query/utils/options'
import { omit } from '@lib/utils/record/omit'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import { ParsedTx } from '../core/parsedTx'
import {
  buildSendTxKeysignPayload,
  BuildSendTxKeysignPayloadInput,
} from './build'

export const useSendTxKeysignPayloadQuery = ({
  parsedTx,
  feeSettings,
}: {
  parsedTx: ParsedTx
  feeSettings?: FeeSettings
}) => {
  const vault = useCurrentVault()
  const walletCore = useAssertWalletCore()
  const publicKey = useCurrentVaultPublicKey(parsedTx.coin.chain)

  const input: BuildSendTxKeysignPayloadInput = useMemo(
    () => ({
      parsedTx,
      feeSettings,
      vault,
      walletCore,
      vaultId: getVaultId(vault),
      localPartyId: vault.localPartyId,
      publicKey,
    }),
    [feeSettings, parsedTx, publicKey, vault, walletCore]
  )

  return useQuery({
    queryKey: ['sendTxKeysignPayload', omit(input, 'walletCore', 'publicKey')],
    queryFn: () => buildSendTxKeysignPayload(input),
    ...noRefetchQueryOptions,
  })
}

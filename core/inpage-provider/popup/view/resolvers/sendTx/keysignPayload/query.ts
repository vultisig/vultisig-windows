import { usePopupContext } from '@core/inpage-provider/popup/view/state/context'
import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import {
  useCurrentVault,
  useCurrentVaultPublicKey,
} from '@core/ui/vault/state/currentVault'
import { noRefetchQueryOptions } from '@lib/ui/query/utils/options'
import { useQuery } from '@tanstack/react-query'
import { FeeSettings } from '@vultisig/core-mpc/keysign/chainSpecific/FeeSettings'
import { getVaultId } from '@vultisig/core-mpc/vault/Vault'
import { omit } from '@vultisig/lib-utils/record/omit'
import { useMemo } from 'react'

import { buildDappMetadata } from '../../../utils/buildDappMetadata'
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
  const { requestFavicon, requestName, requestOrigin } =
    usePopupContext<'sendTx'>()

  const input: BuildSendTxKeysignPayloadInput = useMemo(
    () => ({
      parsedTx,
      feeSettings,
      vault,
      walletCore,
      vaultId: getVaultId(vault),
      localPartyId: vault.localPartyId,
      publicKey,
      dappMetadata: buildDappMetadata({
        requestFavicon,
        requestName,
        requestOrigin,
      }),
    }),
    [
      feeSettings,
      parsedTx,
      publicKey,
      vault,
      walletCore,
      requestFavicon,
      requestName,
      requestOrigin,
    ]
  )

  return useQuery({
    queryKey: ['sendTxKeysignPayload', omit(input, 'walletCore', 'publicKey')],
    queryFn: () => buildSendTxKeysignPayload(input),
    ...noRefetchQueryOptions,
  })
}

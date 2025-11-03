import { FeeSettings } from '@core/chain/feeQuote/settings/core'
import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
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
  feeSettings?: FeeSettings<any> | null
}) => {
  const vault = useCurrentVault()
  const walletCore = useAssertWalletCore()

  const input: BuildSendTxKeysignPayloadInput = useMemo(
    () => ({
      parsedTx,
      feeSettings,
      vault,
      walletCore,
    }),
    [feeSettings, parsedTx, vault, walletCore]
  )

  return useQuery({
    queryKey: [
      'sendTxKeysignPayload',
      parsedTx,
      feeSettings,
      omit(input, 'walletCore', 'vault'),
    ],
    queryFn: () => buildSendTxKeysignPayload(input),
    ...noRefetchQueryOptions,
  })
}

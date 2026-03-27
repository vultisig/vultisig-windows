import { Chain } from '@core/chain/Chain'
import { getPsbtTransferInfoFromBase64 } from '@core/chain/chains/utxo/tx/getPsbtTransferInfo'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { BlockaidEvmSimulationInfo } from '@core/chain/security/blockaid/tx/simulation/core'
import { fromCommCoin } from '@core/mpc/types/utils/commCoin'
import { KeysignPayload } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { usePotentialQuery } from '@lib/ui/query/hooks/usePotentialQuery'
import { Query } from '@lib/ui/query/Query'
import { noRefetchQueryOptions } from '@lib/ui/query/utils/options'
import { assertField } from '@lib/utils/record/assertField'
import { useMemo } from 'react'

const getJoinKeysignPsbtTransferInfoQueryOptions = (input: {
  psbtBase64: string
  address: string
}) => ({
  queryKey: [
    'join-keysign-psbt-transfer-info',
    input.address,
    input.psbtBase64.length,
  ],
  queryFn: async (): Promise<BlockaidEvmSimulationInfo> => {
    try {
      const { sendAmount } = getPsbtTransferInfoFromBase64(
        input.psbtBase64,
        input.address
      )
      const fromCoin = chainFeeCoin[Chain.Bitcoin]
      return {
        transfer: {
          fromCoin,
          fromAmount: sendAmount,
        },
      }
    } catch (error) {
      throw new Error(
        `PSBT parsing failed: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  },
  ...noRefetchQueryOptions,
})

type UseJoinKeysignPsbtTransferInfoQueryInput = {
  keysignPayload: KeysignPayload
}

export const useJoinKeysignPsbtTransferInfoQuery = ({
  keysignPayload,
}: UseJoinKeysignPsbtTransferInfoQueryInput): Query<
  BlockaidEvmSimulationInfo | undefined
> => {
  const input = useMemo(() => {
    if (keysignPayload.signData?.case !== 'signPsbt') {
      return undefined
    }
    const coin = fromCommCoin(assertField(keysignPayload, 'coin'))
    return {
      psbtBase64: keysignPayload.signData.value.psbt,
      address: coin.address,
    }
  }, [keysignPayload])

  return usePotentialQuery(
    input,
    getJoinKeysignPsbtTransferInfoQueryOptions,
    undefined
  ) as Query<BlockaidEvmSimulationInfo | undefined>
}

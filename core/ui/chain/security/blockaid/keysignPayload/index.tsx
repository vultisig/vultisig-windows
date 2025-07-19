import { EvmChain } from '@core/chain/Chain'
import { isFeeCoin } from '@core/chain/coin/utils/isFeeCoin'
import { getKeysignSwapPayload } from '@core/mpc/keysign/swap/getKeysignSwapPayload'
import { getKeysignChain } from '@core/mpc/keysign/utils/getKeysignChain'
import { getKeysignCoin } from '@core/mpc/keysign/utils/getKeysignCoin'
import { KeysignPayload } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { ValueProp } from '@lib/ui/props'
import { isOneOf } from '@lib/utils/array/isOneOf'
import { bigIntToHex } from '@lib/utils/bigint/bigIntToHex'
import { useMemo } from 'react'

import { BlockaidNoTxScanStatus } from '../tx/noScanStatus'
import { BlockaidTxScanInput } from '../tx/query'
import { BlockaidTxScan } from '../tx/scan'

export const BlockaidKeysignPayloadScan = ({
  value,
}: ValueProp<KeysignPayload>) => {
  const txScanInput: BlockaidTxScanInput | null = useMemo(() => {
    const coin = getKeysignCoin(value)
    const chain = getKeysignChain(value)

    if (!isOneOf(chain, Object.values(EvmChain))) {
      return null
    }

    const swapPayload = getKeysignSwapPayload(value)

    if (swapPayload) {
      return null
    }

    if (!isFeeCoin(coin)) {
      return null
    }

    return {
      chain,
      data: {
        method: 'eth_sendTransaction',
        params: [
          {
            from: coin.address,
            to: value.toAddress,
            value: bigIntToHex(BigInt(value.toAmount)),
            data: value.memo || '0x',
          },
        ],
      },
    }
  }, [value])

  if (txScanInput === null) {
    return <BlockaidNoTxScanStatus />
  }

  return <BlockaidTxScan value={txScanInput} />
}

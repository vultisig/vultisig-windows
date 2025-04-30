import { CosmosChain } from '@core/chain/Chain'
import { cosmosFeeCoinDenom } from '@core/chain/chains/cosmos/cosmosFeeCoinDenom'

import { TransactionType } from '../../../types/vultisig/keysign/v1/blockchain_specific_pb'
import { KeysignMessagePayload } from '../../keysignPayload/KeysignMessagePayload'
import { IMsgTransfer } from './IMsgTransfer'

export const generateIbcTransaction = (
  keysignPayload: KeysignMessagePayload
): IMsgTransfer | undefined => {
  if (!('keysign' in keysignPayload)) return

  const payload = keysignPayload.keysign
  const { memo, coin, toAddress, toAmount } = payload

  if (payload.blockchainSpecific.case !== 'cosmosSpecific') {
    return
  }

  const chainSpecific = payload.blockchainSpecific.value

  if (
    !memo ||
    chainSpecific.transactionType !== TransactionType.IBC_TRANSFER ||
    !coin
  ) {
    return
  }

  const parts = memo.split(':')
  const [, channel, , userMemo] = parts

  const blockTimeoutStr =
    chainSpecific.ibcDenomTraces?.latestBlock?.split('_')?.[1]
  const timeoutTimestamp = blockTimeoutStr
    ? BigInt(blockTimeoutStr).toString()
    : '0'

  return {
    sourcePort: 'transfer',
    sourceChannel: channel,
    token: {
      denom: coin.isNativeToken
        ? cosmosFeeCoinDenom[coin.chain as CosmosChain]
        : coin.contractAddress,
      amount: toAmount,
    },
    sender: coin.address,
    receiver: toAddress,
    timeoutHeight: {
      revisionNumber: '0',
      revisionHeight: '0',
    },
    timeoutTimestamp,
    memo: userMemo ?? '',
  }
}

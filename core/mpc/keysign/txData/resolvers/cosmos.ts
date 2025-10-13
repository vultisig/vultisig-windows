import { VaultBasedCosmosChain } from '@core/chain/Chain'
import { getCosmosAccountInfo } from '@core/chain/chains/cosmos/account/getCosmosAccountInfo'
import { TransactionType } from '@core/mpc/types/vultisig/keysign/v1/blockchain_specific_pb'
import { isOneOf } from '@lib/utils/array/isOneOf'

import { KeysignTxDataResolver } from '../resolver'

export const getCosmosTxData: KeysignTxDataResolver<'cosmos'> = async ({
  coin,
  transactionType = TransactionType.UNSPECIFIED,
  timeoutTimestamp,
  isDeposit,
}) => {
  const { accountNumber, sequence, latestBlock } =
    await getCosmosAccountInfo(coin)

  const base = {
    accountNumber: BigInt(accountNumber),
    sequence: BigInt(sequence),
    transactionType,
  }

  if (isOneOf(coin.chain, Object.values(VaultBasedCosmosChain))) {
    return {
      ...base,
      isDeposit: Boolean(isDeposit),
    }
  }

  return {
    ...base,
    ibcDenomTraces: {
      latestBlock: timeoutTimestamp
        ? `${latestBlock.split('_')[0]}_${timeoutTimestamp}`
        : latestBlock,
      baseDenom: '',
      path: '',
    },
  }
}

import { Chain } from '@vultisig/core-chain/Chain'
import { isTonGaslessRequest } from '@vultisig/core-chain/chains/ton/gasless/request'
import { Tx } from '@vultisig/core-chain/tx'

type GetKeysignTxHashInput = {
  chain: Chain
  tx: Tx
  broadcastTxHash?: string
}

/**
 * The hash to show and record for a broadcast tx: the relay's reported hash
 * for gasless TON (W5), whose compiled body hash explorers don't index;
 * otherwise the compiled hash.
 */
export const getKeysignTxHash = ({
  chain,
  tx,
  broadcastTxHash,
}: GetKeysignTxHashInput): string => {
  if (!broadcastTxHash || chain !== Chain.Ton) {
    return tx.hash
  }

  const { data } = tx
  const isGasless =
    'encoded' in data &&
    typeof data.encoded === 'string' &&
    isTonGaslessRequest(data.encoded)

  return isGasless ? broadcastTxHash : tx.hash
}

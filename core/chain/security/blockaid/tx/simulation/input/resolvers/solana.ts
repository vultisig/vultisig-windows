import { assertField } from '@lib/utils/record/assertField'

import { OtherChain } from '../../../../../../Chain'
import { decodeSigningOutput } from '../../../../../../tw/signingOutput'
import { getCompiledTxsForBlockaidInput } from '../../../utils/getCompiledTxsForBlockaidInput'
import { BlockaidTxSimulationInputResolver } from '../resolver'

export const getSolanaBlockaidTxSimulationInput: BlockaidTxSimulationInputResolver<
  OtherChain.Solana
> = ({ payload, walletCore, chain, raw }) => {
  const coin = assertField(payload, 'coin')
  if (raw && raw.length > 0) {
    return {
      chain: 'mainnet',
      options: ['simulation'],
      account_address: coin.address,
      encoding: 'base58',
      transactions: raw,
      method: 'signAndSendTransaction',
      metadata: {},
    }
  }
  const transactions = getCompiledTxsForBlockaidInput({
    payload,
    walletCore,
  }).map(tx => decodeSigningOutput(chain, tx).encoded)

  return {
    chain: 'mainnet',
    options: ['simulation'],
    account_address: coin.address,
    encoding: 'base58',
    transactions,
    method: 'signAndSendTransaction',
    metadata: {},
  }
}

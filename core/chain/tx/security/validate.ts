import { productWebsite, rootApiUrl } from '@core/config'
import { attempt, withFallback } from '@lib/utils/attempt'
import { stripHexPrefix } from '@lib/utils/hex/stripHexPrefix'
import { match } from '@lib/utils/match'
import { queryUrl } from '@lib/utils/query/queryUrl'
import bs58 from 'bs58'

import { getChainKind } from '../../ChainKind'
import { BlockaidSupportedChain, BlockaidSupportedChainKind } from './chains'
import {
  blockaidBaseUrl,
  blockaidClientId,
  blockaidMainnetChain,
} from './config'

type ValidateTxSecurityInput = {
  chain: BlockaidSupportedChain
  sender: string
  value: string
}

export type TxSecurityValidationResult = 'warning' | 'malicious'

export type BlockaidScanResult = {
  validation: {
    result_type: 'Benign' | 'Warning' | 'Malicious'
  }
}

const chainSpecificScanPath: Record<BlockaidSupportedChainKind, string> = {
  evm: '/evm/json-rpc',
  utxo: '/bitcoin/transaction-raw',
  solana: '/solana/message',
  sui: '/sui/transaction',
}

export const validateTxSecurity = async ({
  chain,
  sender,
  value,
}: ValidateTxSecurityInput): Promise<TxSecurityValidationResult | void> => {
  const chainKind = getChainKind(chain)

  const chainSpecificPayload = match<
    BlockaidSupportedChainKind,
    Record<string, unknown>
  >(chainKind, {
    evm: () => ({
      chain: chain.toString().toLowerCase(),
      data: withFallback(
        attempt(() => JSON.parse(value)),
        ''
      ),
    }),
    utxo: () => ({
      chain: chain.toString().toLowerCase(),
      transaction: value,
    }),
    solana: () => ({
      encoding: 'base58',
      chain: blockaidMainnetChain,
      transactions: [bs58.encode(Buffer.from(stripHexPrefix(value), 'hex'))],
    }),
    sui: () => ({
      chain: blockaidMainnetChain,
      transaction: value,
    }),
  })

  const body = {
    ...chainSpecificPayload,
    account_address: sender,
    metadata: {
      domain: productWebsite,
    },
  }

  const url = `${blockaidBaseUrl}${chainSpecificScanPath[chainKind]}/scan`

  const {
    validation: { result_type },
  } = await queryUrl<BlockaidScanResult>(url, {
    body,
    headers: { 'client-id': blockaidClientId, origin: rootApiUrl },
  })

  if (result_type === 'Warning') {
    return 'warning'
  }

  if (result_type === 'Malicious') {
    return 'malicious'
  }
}

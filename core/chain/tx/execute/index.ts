import { ChainKind, getChainKind } from '@core/chain/ChainKind'
import { blockaid } from '@core/config/security/blockaid'
import { BlockaidResultTypes } from '@core/config/security/blockaid/constants'
import { attempt } from '@lib/utils/attempt'

import { executeCardanoTx } from './cardano'
import { executeCosmosTx } from './cosmos'
import { executeEvmTx } from './evm'
import { ExecuteTxResolver } from './ExecuteTxResolver'
import { executePolkadotTx } from './polkadot'
import { executeRippleTx } from './ripple'
import { executeSolanaTx } from './solana'
import { executeSuiTx } from './sui'
import { executeTonTx } from './ton'
import { executeTronTx } from './tron'
import { executeUtxoTx } from './utxo'

const handlers: Record<ChainKind, ExecuteTxResolver<any>> = {
  cardano: executeCardanoTx,
  cosmos: executeCosmosTx,
  evm: executeEvmTx,
  polkadot: executePolkadotTx,
  ripple: executeRippleTx,
  solana: executeSolanaTx,
  sui: executeSuiTx,
  ton: executeTonTx,
  utxo: executeUtxoTx,
  tron: executeTronTx,
}

export const executeTx: ExecuteTxResolver = async input => {
  const chainKind = getChainKind(input.chain)

  const handler = handlers[chainKind]

  // Perform Blockaid scan with graceful failure for all chains
  let scanResult

  let scanUnavailable = false
  if (input.rawTx && input.account_address && !input.skipBlockaid) {
    scanResult = await attempt(async () => {
      return await blockaid.scanTransaction({
        chain: input.chain.toString().toLowerCase(),
        account_address: input.account_address!,
        simulate_with_estimated_gas: false,
        metadata: {
          domain: 'https://vultisig.com',
        },
        data: input.rawTx!,
      })
    })
    // scanResult = MOCK_BLOCKAID_WARNING_RESPONSE
    const validation = scanResult.data?.validation
    if (validation?.status !== 'Success') {
      scanUnavailable = true
    }
    // Handle result_type
    if (
      validation?.result_type === BlockaidResultTypes.Warning ||
      validation?.result_type === BlockaidResultTypes.Malicious
    ) {
      const error: any = new Error('Security warning from Blockaid')
      error.type =
        validation.result_type === BlockaidResultTypes.Warning
          ? 'blockaid-warning'
          : 'blockaid-malicious'
      error.blockaid = scanResult.data
      throw error
    }
    // Benign: proceed as normal
  }

  const result = await handler(input)

  return {
    ...result,
    scanResult: scanResult?.data || undefined,
    scanUnavailable,
  }
}

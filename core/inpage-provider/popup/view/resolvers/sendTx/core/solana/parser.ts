import { create } from '@bufbuild/protobuf'
import { Chain, OtherChain } from '@core/chain/Chain'
import { solanaRpcUrl } from '@core/chain/chains/solana/client'
import { AccountCoin } from '@core/chain/coin/AccountCoin'
import { Coin, CoinKey } from '@core/chain/coin/Coin'
import { getSolanaFeeQuote } from '@core/chain/feeQuote/resolvers/solana'
import { getTxBlockaidSimulation } from '@core/chain/security/blockaid/tx/simulation'
import { parseBlockaidSimulation } from '@core/chain/security/blockaid/tx/simulation/api/core'
import { getBlockaidTxSimulationInput } from '@core/chain/security/blockaid/tx/simulation/input'
import { buildChainSpecific } from '@core/mpc/keysign/chainSpecific/build'
import { getKeysignTxData } from '@core/mpc/keysign/txData'
import { fromCommCoin } from '@core/mpc/types/utils/commCoin'
import {
  OneInchQuoteSchema,
  OneInchSwapPayloadSchema,
  OneInchTransactionSchema,
} from '@core/mpc/types/vultisig/keysign/v1/1inch_swap_payload_pb'
import { Coin as CommCoin } from '@core/mpc/types/vultisig/keysign/v1/coin_pb'
import { KeysignPayloadSchema } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { attempt } from '@lib/utils/attempt'
import { NATIVE_MINT } from '@solana/spl-token'
import { Connection, PublicKey } from '@solana/web3.js'
import { TW, WalletCore } from '@trustwallet/wallet-core'

import { parseProgramCall } from './parseProgramCall'
import { AddressTableLookup, SolanaTxData } from './types/types'
import { mergedKeys, resolveAddressTableKeys } from './utils'

type ParseSolanaTxInput = {
  fromCoin: CommCoin
  walletCore: WalletCore
  data: string
  getCoin: (coinKey: CoinKey) => Promise<Coin>
  swapProvider: string
}

export const parseSolanaTx = async ({
  fromCoin,
  walletCore,
  data,
  getCoin,
  swapProvider,
}: ParseSolanaTxInput): Promise<SolanaTxData> => {
  const connection = new Connection(solanaRpcUrl)
  const inputTx = Uint8Array.from(Buffer.from(data, 'base64'))
  const txInputDataArray = Object.values(inputTx)
  const txInputDataBuffer = new Uint8Array(txInputDataArray as any)
  const buffer = Buffer.from(txInputDataBuffer)
  const encodedTx = walletCore.TransactionDecoder.decode(
    walletCore.CoinType.solana,
    buffer
  )
  if (!encodedTx) throw new Error('Could not encode transaction')
  const decodedTx = TW.Solana.Proto.DecodingTransactionOutput.decode(encodedTx)

  if (!decodedTx.transaction)
    throw new Error('Invalid Solana transaction: missing v0 transaction data')

  const tx = decodedTx.transaction?.v0 ?? decodedTx.transaction?.legacy
  if (!tx)
    throw new Error('Invalid Solana transaction: missing v0 transaction data')

  const staticKeys = (tx.accountKeys ?? []).map(k => new PublicKey(k))

  const resolvedKeys = await resolveAddressTableKeys(
    ('addressTableLookups' in tx
      ? tx.addressTableLookups
      : []) as AddressTableLookup[],
    connection
  )
  const keys = mergedKeys(staticKeys, resolvedKeys)

  const { data: parsedSimulation } = await attempt(async () => {
    const coin = fromCommCoin(fromCoin) as AccountCoin<OtherChain.Solana>

    const feeQuote = await getSolanaFeeQuote({
      coin,
    })

    const txData = await getKeysignTxData({
      coin,
    })

    const blockchainSpecific = buildChainSpecific({
      chain: Chain.Solana,
      txData,
      feeQuote,
    })

    const keysignPayload = create(KeysignPayloadSchema, {
      coin: fromCoin,
      blockchainSpecific,
      swapPayload: {
        case: 'oneinchSwapPayload',
        value: create(OneInchSwapPayloadSchema, {
          fromCoin,
          toCoin: fromCoin,
          fromAmount: '0',
          toAmountDecimal: '0',
          quote: create(OneInchQuoteSchema, {
            dstAmount: '0',
            tx: create(OneInchTransactionSchema, {
              data: Buffer.from(buffer).toString('base64'),
              value: '0',
              gasPrice: '0',
              gas: BigInt(0),
            }),
          }),
          provider: '1inch',
        }),
      },
    })

    const blockaidTxSimulationInput = getBlockaidTxSimulationInput({
      payload: keysignPayload,
      walletCore,
    })

    if (!blockaidTxSimulationInput) {
      throw new Error('Error getting blockaid tx simulation input')
    }
    const sim = await getTxBlockaidSimulation({
      chain: Chain.Solana,
      data: blockaidTxSimulationInput.data,
    })

    const { fromMint, toMint, fromAmount, toAmount } =
      await parseBlockaidSimulation(sim)

    const [inputCoin, outputCoin] = await Promise.all(
      [fromMint, toMint].map(mint => {
        const id = mint === NATIVE_MINT.toBase58() ? undefined : mint
        return getCoin({ chain: Chain.Solana, id })
      })
    )

    return {
      swap: {
        authority: fromCoin.address,
        inAmount: fromAmount.toString(),
        inputCoin,
        outAmount: toAmount.toString(),
        outputCoin,
        data,
        swapProvider,
      },
    }
  })

  if (parsedSimulation) {
    return parsedSimulation
  }
  const { data: parsedTx, error } = await attempt(
    parseProgramCall({
      tx,
      keys,
      getCoin,
      swapProvider,
      data,
    })
  )

  if (!error && parsedTx) {
    return parsedTx
  }
  throw new Error('failed to parse transaction')
}

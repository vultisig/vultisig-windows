import { create } from '@bufbuild/protobuf'
import { Chain } from '@core/chain/Chain'
import { solanaRpcUrl } from '@core/chain/chains/solana/client'
import { Coin, CoinKey } from '@core/chain/coin/Coin'
import { getTxBlockaidSimulation } from '@core/chain/security/blockaid/tx/simulation'
import { parseBlockaidSolanaSimulation } from '@core/chain/security/blockaid/tx/simulation/api/core'
import { BlockaidSolanaSimulationInfo } from '@core/chain/security/blockaid/tx/simulation/core'
import { getBlockaidTxSimulationInput } from '@core/chain/security/blockaid/tx/simulation/input'
import { getChainSpecific } from '@core/mpc/keysign/chainSpecific'
import {
  OneInchQuoteSchema,
  OneInchSwapPayloadSchema,
  OneInchTransactionSchema,
} from '@core/mpc/types/vultisig/keysign/v1/1inch_swap_payload_pb'
import { Coin as CommCoin } from '@core/mpc/types/vultisig/keysign/v1/coin_pb'
import { KeysignPayloadSchema } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { attempt } from '@lib/utils/attempt'
import { matchRecordUnion } from '@lib/utils/matchRecordUnion'
import { NATIVE_MINT } from '@solana/spl-token'
import { Connection, PublicKey } from '@solana/web3.js'
import { TW, WalletCore } from '@trustwallet/wallet-core'

import { parseProgramCall } from './parseProgramCall'
import { AddressTableLookup, SolanaTxData } from './types/types'
import { mergedKeys, resolveAddressTableKeys } from './utils'

type ParseSolanaTxInput = {
  fromCoin: CommCoin
  walletCore: WalletCore
  data: string[]
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
  const inputTx = Uint8Array.from(Buffer.from(data[0], 'base64'))
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
    const keysignPayload = create(KeysignPayloadSchema, {
      coin: fromCoin,

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

    keysignPayload.blockchainSpecific = await getChainSpecific({
      keysignPayload,
      walletCore,
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

    const simulationResult = await parseBlockaidSolanaSimulation(sim)
    return await matchRecordUnion<
      BlockaidSolanaSimulationInfo,
      Promise<SolanaTxData>
    >(simulationResult, {
      swap: async ({ fromMint, toMint, fromAmount, toAmount }) => {
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
            data: data[0],
            swapProvider,
            rawTransactions: data,
          },
        } as SolanaTxData
      },
      transfer: async ({ fromAmount, fromMint }) => {
        const [inputCoin] = await Promise.all(
          [fromMint].map(mint => {
            const id = mint === NATIVE_MINT.toBase58() ? undefined : mint
            return getCoin({ chain: Chain.Solana, id })
          })
        )
        return {
          transfer: {
            authority: fromCoin.address,
            inputCoin,
            inAmount: fromAmount.toString(),
            receiverAddress: '',
            rawTransactions: data,
          },
        } as SolanaTxData
      },
    })
  })

  if (parsedSimulation) {
    return parsedSimulation
  }
  const { data: parsedTx } = await attempt(
    parseProgramCall({
      tx,
      keys,
      getCoin,
      swapProvider,
      data: data[0],
    })
  )

  if (parsedTx && 'raw' in parsedTx) {
    return {
      raw: parsedTx.raw,
    }
  }

  if (parsedTx && 'transfer' in parsedTx) {
    return {
      transfer: {
        ...parsedTx.transfer,
        rawTransactions: data,
      },
    }
  }

  if (parsedTx && 'swap' in parsedTx) {
    return {
      swap: {
        ...parsedTx.swap,
        rawTransactions: data,
      },
    }
  }

  const solanaFeeCoin = await getCoin({ chain: Chain.Solana })
  return {
    transfer: {
      authority: fromCoin.address,
      inputCoin: solanaFeeCoin,
      inAmount: '0',
      receiverAddress: '',
      rawTransactions: data,
    },
  }
}

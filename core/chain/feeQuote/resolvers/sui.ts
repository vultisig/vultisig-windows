import { create } from '@bufbuild/protobuf'
import { OtherChain } from '@core/chain/Chain'
import { getSuiClient } from '@core/chain/chains/sui/client'
import { suiGasBudget, suiMinGasBudget } from '@core/chain/chains/sui/config'
import { getCompiledTxsForBlockaidInput } from '@core/chain/security/blockaid/tx/utils/getCompiledTxsForBlockaidInput'
import { decodeSigningOutput } from '@core/chain/tw/signingOutput'
import { toCommCoin } from '@core/mpc/types/utils/commCoin'
import {
  SuiCoinSchema,
  SuiSpecificSchema,
} from '@core/mpc/types/vultisig/keysign/v1/blockchain_specific_pb'
import {
  KeysignPayload,
  KeysignPayloadSchema,
} from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { attempt, withFallback } from '@lib/utils/attempt'
import { bigIntMax } from '@lib/utils/bigint/bigIntMax'
import { memoizeAsync } from '@lib/utils/memoizeAsync'
import { initWasm } from '@trustwallet/wallet-core'

import { FeeQuoteResolver } from '../resolver'

const gasBudgetMultiplier = (value: bigint) => (value * 115n) / 100n
const getWalletCore = memoizeAsync(initWasm)

export const getSuiFeeQuote: FeeQuoteResolver<'sui'> = async ({
  coin,
  amount,
  receiver,
  hexPublicKey,
}) => {
  const client = getSuiClient()
  const gasPrice = BigInt(await client.getReferenceGasPrice())

  const getGasBudget = async () => {
    if (!hexPublicKey) throw new Error('Missing hexPublicKey for Sui dry run')

    // Gather sender coins
    const { data } = await client.getAllCoins({ owner: coin.address })
    const coins = data
      .filter(c => c.coinType === '0x2::sui::SUI')
      .map(coin =>
        create(SuiCoinSchema, {
          coinType: '0x2::sui::SUI',
          coinObjectId: coin.coinObjectId,
          version: coin.version,
          digest: coin.digest,
          balance: coin.balance.toString(),
          previousTransaction: '',
        })
      )

    const payload: KeysignPayload = create(KeysignPayloadSchema, {
      coin: toCommCoin({
        ...coin,
        hexPublicKey,
      }),
      toAddress: receiver,
      toAmount: amount.toString(),
      blockchainSpecific: {
        case: 'suicheSpecific',
        value: create(SuiSpecificSchema, {
          referenceGasPrice: gasPrice.toString(),
          coins,
          gasBudget: '3000000',
        }),
      },
    })

    const walletCore = await getWalletCore()
    const [compiled] = getCompiledTxsForBlockaidInput({ payload, walletCore })
    const unsignedTx = decodeSigningOutput(OtherChain.Sui, compiled).unsignedTx

    const {
      effects: {
        gasUsed: { computationCost, storageCost },
      },
    } = await client.dryRunTransactionBlock({ transactionBlock: unsignedTx })
    console.log({ computationCost, storageCost })

    const totalCost = BigInt(computationCost) + BigInt(storageCost)
    return bigIntMax(totalCost, suiMinGasBudget)
  }

  const gasBudget = gasBudgetMultiplier(
    await withFallback(attempt(getGasBudget()), suiGasBudget)
  )

  return { gas: gasPrice, gasBudget }
}

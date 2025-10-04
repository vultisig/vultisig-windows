import { Chain } from '@core/chain/Chain'
import { Coin, CoinKey } from '@core/chain/coin/Coin'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { NATIVE_MINT } from '@solana/spl-token'
import { PublicKey } from '@solana/web3.js'
import { TW } from '@trustwallet/wallet-core'

import { SolanaTxData } from '../../types/types'
import { readU64LE } from '../../utils'

const oneInchSwapInstructionAccountsIndexes = {
  srcMint: 2,
  dstMint: 7,
  maker: 5,
}

type Input = {
  instruction: TW.Solana.Proto.RawMessage.IInstruction
  keys: PublicKey[]
  getCoin: (coinKey: CoinKey) => Promise<Coin>
  swapProvider: string
  data: string
}

export const parseOneInchSwapInstruction = async ({
  instruction,
  keys,
  getCoin,
  swapProvider,
  data,
}: Input): Promise<SolanaTxData> => {
  if (!instruction.accounts || !instruction.programData)
    throw new Error('invalid 1inch instruction')
  const inputAmount = readU64LE(Buffer.from(instruction.programData), 12)
  const outputAmount = readU64LE(Buffer.from(instruction.programData), 20)
  const srcMint =
    keys[
      shouldBePresent(
        instruction.accounts[oneInchSwapInstructionAccountsIndexes.srcMint]
      )
    ]
  const dstMint =
    keys[
      shouldBePresent(
        instruction.accounts[oneInchSwapInstructionAccountsIndexes.dstMint]
      )
    ]
  const maker =
    keys[
      shouldBePresent(
        instruction.accounts[oneInchSwapInstructionAccountsIndexes.maker]
      )
    ]
  const [inputCoin, outputCoin] = await Promise.all(
    [srcMint, dstMint].map(mint => {
      const id =
        mint.toBase58() === NATIVE_MINT.toBase58() ? undefined : mint.toBase58()

      return getCoin({ chain: Chain.Solana, id })
    })
  )
  return {
    swap: {
      authority: maker.toBase58(),
      inAmount: inputAmount.toString(),
      inputCoin,
      outAmount: outputAmount.toString(),
      outputCoin,
      data,
      swapProvider,
    },
  }
}

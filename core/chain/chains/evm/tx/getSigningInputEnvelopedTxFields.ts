import { Chain } from '@core/chain/Chain'
import { getCoinType } from '@core/chain/coin/coinType'
import { bigIntToHex } from '@lib/utils/bigint/bigIntToHex'
import { stripHexPrefix } from '@lib/utils/hex/stripHexPrefix'
import { TW, WalletCore } from '@trustwallet/wallet-core'

type Input = {
  chain: Chain
  walletCore: WalletCore
  maxFeePerGasWei: string
  priorityFee: string
  nonce: bigint
  gasLimit: string
}

type Output = Pick<
  TW.Ethereum.Proto.SigningInput,
  | 'chainId'
  | 'nonce'
  | 'gasLimit'
  | 'maxFeePerGas'
  | 'maxInclusionFeePerGas'
  | 'txMode'
>

export const getSigningInputEnvelopedTxFields = ({
  chain,
  walletCore,
  maxFeePerGasWei,
  priorityFee,
  nonce,
  gasLimit,
}: Input): Output => {
  const coinType = getCoinType({
    walletCore,
    chain,
  })

  const chainId: bigint = BigInt(walletCore.CoinTypeExt.chainId(coinType))

  return {
    chainId: Buffer.from(
      stripHexPrefix(
        chainId.toString(16).padStart(chain === Chain.Zksync ? 4 : 2, '0')
      ),
      'hex'
    ),
    nonce: Buffer.from(
      stripHexPrefix(bigIntToHex(nonce).padStart(2, '0')),
      'hex'
    ),
    txMode: TW.Ethereum.Proto.TransactionMode.Enveloped,
    gasLimit: Buffer.from(stripHexPrefix(bigIntToHex(BigInt(gasLimit))), 'hex'),
    maxFeePerGas: Buffer.from(
      stripHexPrefix(bigIntToHex(BigInt(maxFeePerGasWei))),
      'hex'
    ),
    maxInclusionFeePerGas: Buffer.from(
      stripHexPrefix(bigIntToHex(BigInt(priorityFee))),
      'hex'
    ),
  }
}

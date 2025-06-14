import { EthereumSpecific } from '@core/mpc/types/vultisig/keysign/v1/blockchain_specific_pb'
import { KeysignPayload } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { bigIntToHex } from '@lib/utils/bigint/bigIntToHex'
import { stripHexPrefix } from '@lib/utils/hex/stripHexPrefix'
import { TW, WalletCore } from '@trustwallet/wallet-core'

import { EvmChain } from '../../../Chain'
import { getSigningInputEnvelopedTxFields } from './getSigningInputEnvelopedTxFields'
import { getEvmTwChainId } from './tw/getEvmTwChainId'
import { getEvmTwNonce } from './tw/getEvmTwNonce'

type Input = {
  keysignPayload: KeysignPayload
  walletCore: WalletCore
}

export const getErc20ApproveTxInputData = ({
  keysignPayload,
  walletCore,
}: Input) => {
  const { amount, spender } = shouldBePresent(
    keysignPayload.erc20ApprovePayload
  )

  const amountHex = Buffer.from(
    stripHexPrefix(bigIntToHex(BigInt(amount))),
    'hex'
  )

  const coin = shouldBePresent(keysignPayload.coin)
  const chain = coin.chain as EvmChain

  const { blockchainSpecific } = keysignPayload

  const { maxFeePerGasWei, priorityFee, nonce, gasLimit } =
    blockchainSpecific.value as EthereumSpecific

  const signingInput = TW.Ethereum.Proto.SigningInput.create({
    transaction: {
      erc20Approve: {
        amount: amountHex,
        spender,
      },
    },
    chainId: getEvmTwChainId({
      walletCore,
      chain,
    }),
    nonce: getEvmTwNonce(nonce),
    toAddress: shouldBePresent(keysignPayload.coin).contractAddress,
    ...getSigningInputEnvelopedTxFields({
      maxFeePerGasWei,
      priorityFee,
      gasLimit,
    }),
  })

  return TW.Ethereum.Proto.SigningInput.encode(signingInput).finish()
}

import { create } from '@bufbuild/protobuf'
import { Chain } from '@core/chain/Chain'
import { toEvmTwAmount } from '@core/chain/chains/evm/tx/tw/toEvmTwAmount'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { usdc } from '@core/chain/coin/knownTokens'
import { getChainSpecific } from '@core/mpc/keysign/chainSpecific'
import { toTwAddress } from '@core/mpc/keysign/tw/toTwAddress'
import { MpcLib } from '@core/mpc/mpcLib'
import { toCommCoin } from '@core/mpc/types/utils/commCoin'
import { KeysignPayloadSchema } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { WalletCore } from '@trustwallet/wallet-core'
import { PublicKey } from '@trustwallet/wallet-core/dist/src/wallet-core'

export type BuildCircleWithdrawKeysignPayloadInput = {
  vaultAddress: string
  mscaAddress: string
  amount: bigint
  vaultId: string
  localPartyId: string
  publicKey: PublicKey
  libType: MpcLib
  walletCore: WalletCore
}

const encodeCircleMscaWithdraw = ({
  vaultAddress,
  amount,
  walletCore,
}: {
  vaultAddress: string
  amount: bigint
  walletCore: WalletCore
}): string => {
  const transferFunction =
    walletCore.EthereumAbiFunction.createWithString('transfer')
  transferFunction.addParamAddress(
    toTwAddress({
      address: vaultAddress,
      walletCore,
      chain: Chain.Ethereum,
    }),
    false
  )
  transferFunction.addParamUInt256(toEvmTwAmount(amount), false)

  const transferData = walletCore.EthereumAbi.encode(transferFunction)

  const executeFunction =
    walletCore.EthereumAbiFunction.createWithString('execute')
  executeFunction.addParamAddress(
    toTwAddress({
      address: usdc.id,
      walletCore,
      chain: Chain.Ethereum,
    }),
    false
  )
  executeFunction.addParamUInt256(toEvmTwAmount(0n), false)
  executeFunction.addParamBytes(transferData, false)

  const executeData = walletCore.EthereumAbi.encode(executeFunction)

  return `0x${Buffer.from(executeData).toString('hex')}`
}

export const buildCircleWithdrawKeysignPayload = async ({
  vaultAddress,
  mscaAddress,
  amount,
  vaultId,
  localPartyId,
  publicKey,
  libType,
  walletCore,
}: BuildCircleWithdrawKeysignPayloadInput) => {
  const nativeCoin = {
    ...chainFeeCoin[Chain.Ethereum],
    address: vaultAddress,
  }

  const memo = encodeCircleMscaWithdraw({
    vaultAddress,
    amount,
    walletCore,
  })

  const keysignPayload = create(KeysignPayloadSchema, {
    coin: toCommCoin({
      ...nativeCoin,
      hexPublicKey: Buffer.from(publicKey.data()).toString('hex'),
    }),
    toAddress: mscaAddress,
    toAmount: '0',
    memo,
    vaultLocalPartyId: localPartyId,
    vaultPublicKeyEcdsa: vaultId,
    libType,
  })

  keysignPayload.blockchainSpecific = await getChainSpecific({
    keysignPayload,
    walletCore,
  })

  return keysignPayload
}

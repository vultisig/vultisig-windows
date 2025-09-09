import { create } from '@bufbuild/protobuf'
import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { Chain } from '@core/chain/Chain'
import { getPsbtTransferInfo } from '@core/chain/chains/utxo/tx/getPsbtTransferInfo'
import { getUtxos } from '@core/chain/chains/utxo/tx/getUtxos'
import { isFeeCoin } from '@core/chain/coin/utils/isFeeCoin'
import { getPublicKey } from '@core/chain/publicKey/getPublicKey'
import { assertChainField } from '@core/chain/utils/assertChainField'
import { storage } from '@core/extension/storage'
import { getChainSpecific } from '@core/mpc/keysign/chainSpecific'
import { CoinSchema } from '@core/mpc/types/vultisig/keysign/v1/coin_pb'
import {
  KeysignPayload,
  KeysignPayloadSchema,
} from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { FeeSettings } from '@core/ui/vault/send/fee/settings/state/feeSettings'
import { getVaultId, Vault } from '@core/ui/vault/Vault'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { areLowerCaseEqual } from '@lib/utils/string/areLowerCaseEqual'
import { WalletCore } from '@trustwallet/wallet-core'
import { Psbt } from 'bitcoinjs-lib'

import { restrictPsbtToInputs } from './restrictPsbt'
export const getPsbtKeysignPayload = async (
  psbtB64: string,
  walletCore: WalletCore,
  vault: Vault,
  gasSettings: FeeSettings | null,
  skipBroadcast?: boolean,
  params?: Record<string, any>[]
): Promise<KeysignPayload> => {
  const vaultsCoins = await storage.getCoins()
  const accountCoin = shouldBePresent(
    vaultsCoins[getVaultId(vault)].find(
      account => isFeeCoin(account) && account.chain === Chain.Bitcoin
    )
  )
  const publicKey = getPublicKey({
    chain: Chain.Bitcoin,
    walletCore,
    hexChainCode: vault.hexChainCode,
    publicKeys: vault.publicKeys,
  })

  if (params && params.length > 0) {
    const [{ signingIndexes, sigHash, address }] = params
    console.log({ signingIndexes, sigHash, address })

    if (!areLowerCaseEqual(address, accountCoin.address)) {
      throw new Error('PSBT Address does not match account address')
    }
    const limitedPsbtB64 = restrictPsbtToInputs(
      psbtB64,
      signingIndexes,
      Buffer.from(publicKey.data()),
      sigHash
    )
    psbtB64 = limitedPsbtB64
  }
  const psbt = Psbt.fromBase64(psbtB64)

  const { recipient, sendAmount } = getPsbtTransferInfo(
    psbt,
    accountCoin.address
  )

  const chainSpecific = await getChainSpecific({
    coin: accountCoin,
    amount: fromChainAmount(Number(sendAmount) || 0, accountCoin.decimals),
    feeSettings: gasSettings,
    psbt,
  })

  const coin = create(CoinSchema, {
    chain: Chain.Bitcoin,
    ticker: accountCoin.ticker,
    address: accountCoin.address,
    decimals: accountCoin.decimals,
    hexPublicKey: Buffer.from(publicKey.data()).toString('hex'),
    isNativeToken: isFeeCoin(accountCoin),
    logo: accountCoin.logo,
    priceProviderId: accountCoin.priceProviderId ?? '',
    contractAddress: accountCoin.id,
  })

  const keysignPayload = create(KeysignPayloadSchema, {
    toAddress: recipient,
    toAmount: sendAmount.toString(),
    vaultPublicKeyEcdsa: vault.publicKeys.ecdsa,
    vaultLocalPartyId: 'VultiConnect',
    coin,
    blockchainSpecific: chainSpecific,
    utxoInfo: await getUtxos(assertChainField(coin)),
    memo: '',
    skipBroadcast,
  })

  return keysignPayload
}

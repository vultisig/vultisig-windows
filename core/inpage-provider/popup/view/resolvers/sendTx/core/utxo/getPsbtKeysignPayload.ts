import { create } from '@bufbuild/protobuf'
import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { Chain } from '@core/chain/Chain'
import { getPsbtTransferInfo } from '@core/chain/chains/utxo/tx/getPsbtTransferInfo'
import { getUtxos } from '@core/chain/chains/utxo/tx/getUtxos'
import { AccountCoin } from '@core/chain/coin/AccountCoin'
import { isFeeCoin } from '@core/chain/coin/utils/isFeeCoin'
import { getPublicKey } from '@core/chain/publicKey/getPublicKey'
import { assertChainField } from '@core/chain/utils/assertChainField'
import { storage } from '@core/extension/storage'
import { getChainSpecific } from '@core/mpc/keysign/chainSpecific'
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

type GetPsbtKeysignPayloadInput = {
  psbt: Psbt
  walletCore: WalletCore
  vault: Vault
  feeSettings: FeeSettings | null
  coin: AccountCoin
  params?: Record<string, any>[]
  skipBroadcast?: boolean
}
export const getPsbtKeysignPayload = async ({
  psbt,
  walletCore,
  vault,
  feeSettings,
  coin,
  params,
  skipBroadcast,
}: GetPsbtKeysignPayloadInput): Promise<KeysignPayload> => {
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
    const currentWalletEntries = params.filter(e =>
      areLowerCaseEqual(e.address, accountCoin.address)
    )
    if (currentWalletEntries.length === 0) {
      throw new Error('No entries for wallet address')
    }
    const limitedPsbtB64 = restrictPsbtToInputs(
      psbt,
      currentWalletEntries.map(p => ({
        signingIndexes: p.signingIndexes,
        sigHash: p.sigHash,
      })),
      Buffer.from(publicKey.data())
    )
    psbt = limitedPsbtB64
  }

  const { recipient, sendAmount } = getPsbtTransferInfo(
    psbt,
    accountCoin.address
  )

  const chainSpecific = await getChainSpecific({
    coin,
    amount: fromChainAmount(Number(sendAmount) || 0, coin.decimals),
    feeSettings,
    psbt: psbt,
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

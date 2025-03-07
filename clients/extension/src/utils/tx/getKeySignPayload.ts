import { create } from '@bufbuild/protobuf'
import { getChainKind } from '@core/chain/ChainKind'
import { AccountCoin } from '@core/chain/coin/AccountCoin'
import { getCoinFromCoinKey } from '@core/chain/coin/Coin'
import { isFeeCoin } from '@core/chain/coin/utils/isFeeCoin'
import { CoinSchema } from '@core/communication/vultisig/keysign/v1/coin_pb'
import {
  KeysignPayload,
  KeysignPayloadSchema,
} from '@core/communication/vultisig/keysign/v1/keysign_message_pb'
import { getChainSpecific } from '@core/keysign/chainSpecific'
import { toUtf8String } from 'ethers'

import { checkERC20Function } from '../functions'
import { ITransaction, VaultProps } from '../interfaces'

export const getKeysignPayload = (
  transaction: ITransaction,
  vault: VaultProps
): Promise<KeysignPayload> => {
  return new Promise(resolve => {
    const localCoin = getCoinFromCoinKey({
      chain: transaction.chain.chain,
      id: transaction.transactionDetails.asset.ticker,
    })

    const accountCoin = {
      ...localCoin,
      address: transaction.transactionDetails.from,
    } as AccountCoin

    getChainSpecific({
      coin: accountCoin,
      amount: Number(transaction.transactionDetails.amount?.amount),
      isDeposit: transaction.isDeposit,
      receiver: transaction.transactionDetails.to,
    }).then(chainSpecific => {
      const coin = create(CoinSchema, {
        chain: transaction.chain.chain,
        ticker: accountCoin.ticker,
        address: transaction.transactionDetails.from,
        decimals: accountCoin.decimals,
        hexPublicKey: vault.chains.find(
          chain => chain.chain === transaction.chain.chain
        )?.derivationKey,
        isNativeToken: isFeeCoin(accountCoin),
        logo: accountCoin.logo,
        priceProviderId: localCoin?.priceProviderId ?? '',
      })
      let modifiedMemo = null
      if (getChainKind(transaction.chain.chain) === 'evm') {
        checkERC20Function(transaction.transactionDetails.data!).then(
          isMemoFunction => {
            try {
              modifiedMemo =
                isMemoFunction || transaction.transactionDetails.data === '0x'
                  ? (transaction.transactionDetails.data ?? '')
                  : toUtf8String(transaction.transactionDetails.data!)
            } catch {
              modifiedMemo = transaction.transactionDetails.data!
            }
          }
        )
      }
      const keysignPayload = create(KeysignPayloadSchema, {
        toAddress: transaction.transactionDetails.to,
        toAmount: transaction.transactionDetails.amount?.amount
          ? BigInt(
              parseInt(String(transaction.transactionDetails.amount.amount))
            ).toString()
          : '0',
        memo: modifiedMemo ?? transaction.transactionDetails.data,
        vaultPublicKeyEcdsa: vault.publicKeyEcdsa,
        vaultLocalPartyId: 'VultiConnect',
        coin,
        blockchainSpecific: chainSpecific,
      })

      resolve(keysignPayload)
    })
  })
}

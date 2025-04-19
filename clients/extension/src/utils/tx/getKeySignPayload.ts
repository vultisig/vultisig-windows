import { create } from '@bufbuild/protobuf'
import api from '@clients/extension/src/utils/api'
import { checkERC20Function } from '@clients/extension/src/utils/functions'
import { ITransaction, Vault } from '@clients/extension/src/utils/interfaces'
import { Chain, CosmosChain, UtxoChain } from '@core/chain/Chain'
import { getChainKind } from '@core/chain/ChainKind'
import { getCosmosClient } from '@core/chain/chains/cosmos/client'
import { cosmosFeeCoinDenom } from '@core/chain/chains/cosmos/cosmosFeeCoinDenom'
import { getUtxos } from '@core/chain/chains/utxo/tx/getUtxos'
import { AccountCoin } from '@core/chain/coin/AccountCoin'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { getCoinFromCoinKey } from '@core/chain/coin/Coin'
import { isFeeCoin } from '@core/chain/coin/utils/isFeeCoin'
import { assertChainField } from '@core/chain/utils/assertChainField'
import { getChainSpecific } from '@core/mpc/keysign/chainSpecific'
import {
  CosmosIbcDenomTraceSchema,
  TransactionType,
} from '@core/mpc/types/vultisig/keysign/v1/blockchain_specific_pb'
import { CoinSchema } from '@core/mpc/types/vultisig/keysign/v1/coin_pb'
import {
  KeysignPayload,
  KeysignPayloadSchema,
} from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { isOneOf } from '@lib/utils/array/isOneOf'
import { toUtf8String } from 'ethers'

export const getKeysignPayload = (
  transaction: ITransaction,
  vault: Vault
): Promise<KeysignPayload> => {
  return new Promise((resolve, reject) => {
    ;(async () => {
      try {
        let localCoin = getCoinFromCoinKey({
          chain: transaction.chain.chain,
          id: transaction.transactionDetails.asset.ticker,
        })

        if (!localCoin) {
          if (transaction.chain.chain === Chain.Solana) {
            if (!transaction.transactionDetails.asset.mint) {
              throw new Error('Mint address not provided')
            }
            const splToken = await api.solana.fetchSolanaTokenInfo(
              transaction.transactionDetails.asset.mint
            )
            localCoin = {
              chain: transaction.chain.chain,
              decimals: splToken.decimals,
              id: transaction.transactionDetails.asset.mint,
              logo: splToken.logoURI || '',
              ticker: splToken.symbol,
              priceProviderId: splToken.extensions?.coingeckoId,
            }
          } else if (
            Object.values(CosmosChain).includes(
              transaction.chain.chain as CosmosChain
            )
          ) {
            if (
              cosmosFeeCoinDenom[transaction.chain.chain as CosmosChain] ===
              transaction.transactionDetails.asset.ticker
            ) {
              localCoin = { ...chainFeeCoin[transaction.chain.chain] }
            }
          }
        }

        const accountCoin = {
          ...localCoin,
          address: transaction.transactionDetails.from,
        } as AccountCoin

        const chainSpecific = await getChainSpecific({
          coin: accountCoin,
          amount: Number(transaction.transactionDetails.amount?.amount),
          isDeposit: transaction.isDeposit,
          receiver: transaction.transactionDetails.to,
          transactionType: transaction.transactionDetails.ibcTransaction
            ? TransactionType.IBC_TRANSFER
            : TransactionType.UNSPECIFIED,
        })
        switch (chainSpecific.case) {
          case 'ethereumSpecific': {
            chainSpecific.value.maxFeePerGasWei =
              transaction.transactionDetails.gasSettings?.maxFeePerGas ??
              chainSpecific.value.maxFeePerGasWei
            chainSpecific.value.priorityFee =
              transaction.transactionDetails.gasSettings
                ?.maxPriorityFeePerGas ?? chainSpecific.value.priorityFee
            chainSpecific.value.gasLimit =
              transaction.transactionDetails.gasSettings?.gasLimit ??
              chainSpecific.value.gasLimit
            break
          }
          case 'cosmosSpecific': {
            const isIbcTransfer =
              chainSpecific.value.transactionType ===
              TransactionType.IBC_TRANSFER

            const hasTimeout =
              !!transaction.transactionDetails.ibcTransaction!.timeoutTimestamp

            if (isIbcTransfer && hasTimeout) {
              try {
                const client = await getCosmosClient(
                  accountCoin.chain as CosmosChain
                )
                const latestBlock = await client.getBlock()

                const latestBlockHeight = latestBlock.header.height
                const timeoutTimestamp =
                  transaction.transactionDetails.ibcTransaction!
                    .timeoutTimestamp

                chainSpecific.value.ibcDenomTraces = create(
                  CosmosIbcDenomTraceSchema,
                  {
                    latestBlock: `${latestBlockHeight}_${timeoutTimestamp}`,
                  }
                )
              } catch (error) {
                console.error(
                  'Failed to fetch Cosmos block or build denom trace:',
                  error
                )
              }
            }
            break
          }
        }

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
          contractAddress: localCoin?.id,
        })

        let modifiedMemo = null
        if (getChainKind(transaction.chain.chain) === 'evm') {
          try {
            const isMemoFunction = await checkERC20Function(
              transaction.transactionDetails.data!
            )
            modifiedMemo =
              isMemoFunction || transaction.transactionDetails.data === '0x'
                ? (transaction.transactionDetails.data ?? '')
                : toUtf8String(transaction.transactionDetails.data!)
          } catch {
            modifiedMemo = transaction.transactionDetails.data!
          }
        }

        const keysignPayload = create(KeysignPayloadSchema, {
          toAddress: transaction.transactionDetails.to,
          toAmount: transaction.transactionDetails.amount?.amount
            ? BigInt(
                parseInt(String(transaction.transactionDetails.amount.amount))
              ).toString()
            : '0',
          memo: modifiedMemo ?? transaction.transactionDetails.data,
          vaultPublicKeyEcdsa: vault.publicKeys.ecdsa,
          vaultLocalPartyId: 'VultiConnect',
          coin,
          blockchainSpecific: chainSpecific,
        })
        if (isOneOf(transaction.chain.chain, Object.values(UtxoChain))) {
          keysignPayload.utxoInfo = await getUtxos(assertChainField(coin))
        }
        resolve(keysignPayload)
      } catch (error) {
        reject(error)
      }
    })()
  })
}

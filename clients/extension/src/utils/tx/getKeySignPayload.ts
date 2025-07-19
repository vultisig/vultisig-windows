import { create } from '@bufbuild/protobuf'
import api from '@clients/extension/src/utils/api'
import { checkERC20Function } from '@clients/extension/src/utils/functions'
import { IKeysignTransactionPayload } from '@clients/extension/src/utils/interfaces'
import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { Chain, CosmosChain, OtherChain, UtxoChain } from '@core/chain/Chain'
import { getChainKind } from '@core/chain/ChainKind'
import { getCardanoUtxos } from '@core/chain/chains/cardano/utxo/getCardanoUtxos'
import { getCosmosClient } from '@core/chain/chains/cosmos/client'
import { cosmosFeeCoinDenom } from '@core/chain/chains/cosmos/cosmosFeeCoinDenom'
import { getUtxos } from '@core/chain/chains/utxo/tx/getUtxos'
import { AccountCoin } from '@core/chain/coin/AccountCoin'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { getCoinFromCoinKey } from '@core/chain/coin/Coin'
import { isFeeCoin } from '@core/chain/coin/utils/isFeeCoin'
import { getPublicKey } from '@core/chain/publicKey/getPublicKey'
import { assertChainField } from '@core/chain/utils/assertChainField'
import { toHexPublicKey } from '@core/chain/utils/toHexPublicKey'
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
import { WasmExecuteContractPayloadSchema } from '@core/mpc/types/vultisig/keysign/v1/wasm_execute_contract_payload_pb'
import { FeeSettings } from '@core/ui/vault/send/fee/settings/state/feeSettings'
import { Vault } from '@core/ui/vault/Vault'
import { isOneOf } from '@lib/utils/array/isOneOf'
import { WalletCore } from '@trustwallet/wallet-core'
import { toUtf8String } from 'ethers'

import { CosmosMsgType } from '../constants'

export const getKeysignPayload = (
  transaction: IKeysignTransactionPayload,
  vault: Vault,
  walletCore: WalletCore,
  feeSettings: FeeSettings | null
): Promise<KeysignPayload> => {
  return new Promise((resolve, reject) => {
    ;(async () => {
      try {
        console.log('getting keysign payload for transaction:', transaction)

        let localCoin = getCoinFromCoinKey({
          chain: transaction.chain,
          id: transaction.transactionDetails.asset.ticker,
        })

        if (!localCoin) {
          if (transaction.chain === Chain.Solana) {
            if (!transaction.transactionDetails.asset.mint) {
              throw new Error('Mint address not provided')
            }
            const splToken = await api.solana.fetchSolanaTokenInfo(
              transaction.transactionDetails.asset.mint
            )
            localCoin = {
              chain: transaction.chain,
              decimals: splToken.decimals,
              id: transaction.transactionDetails.asset.mint,
              logo: splToken.logoURI || '',
              ticker: splToken.symbol,
              priceProviderId: splToken.extensions?.coingeckoId,
            }
          } else if (
            Object.values(CosmosChain).includes(
              transaction.chain as CosmosChain
            )
          ) {
            if (
              cosmosFeeCoinDenom[transaction.chain as CosmosChain] ===
              transaction.transactionDetails.asset.ticker
            ) {
              localCoin = { ...chainFeeCoin[transaction.chain] }
            }
          }
        }

        const accountCoin = {
          ...localCoin,
          address: transaction.transactionDetails.from,
        } as AccountCoin

        // Create fee settings with gas limit from transaction details if available
        const effectiveFeeSettings = transaction.transactionDetails.gasSettings
          ?.gasLimit
          ? {
              ...feeSettings,
              gasLimit: Number(
                transaction.transactionDetails.gasSettings.gasLimit
              ),
            }
          : feeSettings

        const chainSpecific = await getChainSpecific({
          coin: accountCoin,
          amount: fromChainAmount(
            Number(transaction.transactionDetails.amount?.amount) || 0,
            accountCoin.decimals
          ),
          isDeposit: transaction.isDeposit,
          receiver: transaction.transactionDetails.to,
          transactionType: transaction.transactionDetails.ibcTransaction
            ? TransactionType.IBC_TRANSFER
            : TransactionType.UNSPECIFIED,
          feeSettings: effectiveFeeSettings,
          data: transaction.transactionDetails.data as
            | `0x${string}`
            | undefined,
        })
        switch (chainSpecific.case) {
          case 'ethereumSpecific': {
            chainSpecific.value.maxFeePerGasWei =
              transaction.transactionDetails.gasSettings?.maxFeePerGas ??
              chainSpecific.value.maxFeePerGasWei
            chainSpecific.value.priorityFee =
              transaction.transactionDetails.gasSettings
                ?.maxPriorityFeePerGas ?? chainSpecific.value.priorityFee
            break
          }
          case 'cosmosSpecific': {
            const isIbcTransfer =
              chainSpecific.value.transactionType ===
              TransactionType.IBC_TRANSFER

            const hasTimeout =
              !!transaction.transactionDetails.ibcTransaction?.timeoutTimestamp

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

        const publicKey = getPublicKey({
          chain: transaction.chain,
          walletCore,
          hexChainCode: vault.hexChainCode,
          publicKeys: vault.publicKeys,
        })

        const coin = create(CoinSchema, {
          chain: transaction.chain,
          ticker: accountCoin.ticker,
          address: transaction.transactionDetails.from,
          decimals: accountCoin.decimals,
          hexPublicKey: toHexPublicKey({
            publicKey,
            walletCore,
          }),
          isNativeToken: isFeeCoin(accountCoin),
          logo: accountCoin.logo,
          priceProviderId: localCoin?.priceProviderId ?? '',
          contractAddress: localCoin?.id,
        })

        let modifiedMemo = null
        if (getChainKind(transaction.chain) === 'evm') {
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
        let contractPayload = null
        if (
          transaction.transactionDetails.data?.startsWith(
            CosmosMsgType.MSG_EXECUTE_CONTRACT
          )
        ) {
          const msg = 
            transaction.transactionDetails.data.replace(
              `${CosmosMsgType.MSG_EXECUTE_CONTRACT}-`,
              ''
            )
          
          console.log('msg', msg)

          contractPayload = create(WasmExecuteContractPayloadSchema, {
            contractAddress: transaction.transactionDetails.to,
            executeMsg: msg,
            senderAddress: transaction.transactionDetails.from,
            coins: [coin],
          })
          console.log('contractPayload', contractPayload)
        }
        const keysignPayload = create(KeysignPayloadSchema, {
          toAddress: transaction.transactionDetails.to,
          toAmount: BigInt(
            parseInt(transaction.transactionDetails.amount?.amount ?? '0')
          ).toString(),
          memo: contractPayload
            ? undefined
            : (modifiedMemo ?? transaction.transactionDetails.data),
          vaultPublicKeyEcdsa: vault.publicKeys.ecdsa,
          vaultLocalPartyId: 'VultiConnect',
          coin,
          blockchainSpecific: chainSpecific,
          contractPayload: contractPayload
            ? { case: 'wasmExecuteContractPayload', value: contractPayload }
            : undefined,
        })
        console.log('keysignPayload', keysignPayload)

        if (isOneOf(transaction.chain, Object.values(UtxoChain))) {
          keysignPayload.utxoInfo = await getUtxos(assertChainField(coin))
        } else if (transaction.chain === OtherChain.Cardano) {
          keysignPayload.utxoInfo = await getCardanoUtxos(coin.address)
        }
        resolve(keysignPayload)
      } catch (error) {
        reject(error)
      }
    })()
  })
}

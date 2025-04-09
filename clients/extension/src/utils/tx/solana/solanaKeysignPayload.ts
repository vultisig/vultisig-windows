import { create } from '@bufbuild/protobuf'
import api from '@clients/extension/src/utils/api'
import { checkERC20Function } from '@clients/extension/src/utils/functions'
import {
  ITransaction,
  VaultProps,
} from '@clients/extension/src/utils/interfaces'
import { Chain, CosmosChain, UtxoChain } from '@core/chain/Chain'
import { getChainKind } from '@core/chain/ChainKind'
import { cosmosFeeCoinDenom } from '@core/chain/chains/cosmos/cosmosFeeCoinDenom'
import { getUtxos } from '@core/chain/chains/utxo/tx/getUtxos'
import { AccountCoin } from '@core/chain/coin/AccountCoin'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { getCoinFromCoinKey } from '@core/chain/coin/Coin'
import { isFeeCoin } from '@core/chain/coin/utils/isFeeCoin'
import { assertChainField } from '@core/chain/utils/assertChainField'
import { getChainSpecific } from '@core/mpc/keysign/chainSpecific'
import { CoinSchema } from '@core/mpc/types/vultisig/keysign/v1/coin_pb'
import {
  KeysignPayload,
  KeysignPayloadSchema,
} from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { isOneOf } from '@lib/utils/array/isOneOf'
import { toUtf8String } from 'ethers'
import { ParsedSolanaSwapParams } from './solanaSwap'
import { OneInchSwapPayloadSchema } from '@core/mpc/types/vultisig/keysign/v1/1inch_swap_payload_pb'

export const getSolanaSwapKeysignPayload = (
  parsedSwapParams: ParsedSolanaSwapParams,
  transaction: ITransaction,
  vault: VaultProps
): Promise<KeysignPayload> => {
  return new Promise((resolve, reject) => {
    ;(async () => {
      try {
        console.log('transaction:', transaction)

        const accountCoin = {
          chain: transaction.chain.chain,
          decimals: parsedSwapParams.inputToken.decimals,
          id: parsedSwapParams.inputToken.address,
          logo: parsedSwapParams.inputToken.logoURI || '',
          ticker: parsedSwapParams.inputToken.symbol,
          priceProviderId: parsedSwapParams.inputToken.extensions?.coingeckoId,
          address: parsedSwapParams.authority,
        } as AccountCoin

        const chainSpecific = await getChainSpecific({
          coin: accountCoin,
          amount: Number(0),
          isDeposit: transaction.isDeposit,
          receiver: '',
        })
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
          priceProviderId: accountCoin?.priceProviderId ?? '',
          contractAddress: accountCoin?.id,
        })
        const swapPayload = create(OneInchSwapPayloadSchema, {
          fromCoin: {
            address: transaction.transactionDetails.from,
            chain: transaction.chain.chain,
            contractAddress: parsedSwapParams.inputToken.address,
            decimals: parsedSwapParams.inputToken.decimals,
            hexPublicKey: vault.publicKeyEcdsa,
            priceProviderId:
              parsedSwapParams.inputToken.extensions?.coingeckoId,
            logo: parsedSwapParams.inputToken.symbol.toLowerCase(),
            isNativeToken: parsedSwapParams.inputToken.symbol === 'SOL',
            ticker: parsedSwapParams.inputToken.symbol,
          },
          toCoin: {
            address: transaction.transactionDetails.from,
            chain: transaction.chain.chain,
            contractAddress: parsedSwapParams.outputToken.address,
            decimals: parsedSwapParams.outputToken.decimals,
            hexPublicKey: vault.publicKeyEcdsa,
            priceProviderId:
              parsedSwapParams.outputToken.extensions?.coingeckoId,
            logo: parsedSwapParams.outputToken.symbol.toLowerCase(),
            isNativeToken: parsedSwapParams.outputToken.symbol === 'SOL',
            ticker: parsedSwapParams.outputToken.symbol,
          },
          fromAmount: String(parsedSwapParams.inAmount),
        })
        const keysignPayload = create(KeysignPayloadSchema, {
          toAddress: '',
          toAmount: '0',
          memo: '',
          vaultPublicKeyEcdsa: vault.publicKeyEcdsa,
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

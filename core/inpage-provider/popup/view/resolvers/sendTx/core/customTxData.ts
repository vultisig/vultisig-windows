import type { PolkadotSignerPayloadJSON } from '@core/ui/polkadot/dapp/PolkadotSignerPayload'
import type { WalletCore } from '@trustwallet/wallet-core'
import { Chain, OtherChain } from '@vultisig/core-chain/Chain'
import { isChainOfKind } from '@vultisig/core-chain/ChainKind'
import { cosmosFeeCoinDenom } from '@vultisig/core-chain/chains/cosmos/cosmosFeeCoinDenom'
import { getEvmContractCallHexSignature } from '@vultisig/core-chain/chains/evm/contract/call/hexSignature'
import { getEvmContractCallSignatures } from '@vultisig/core-chain/chains/evm/contract/call/signatures'
import { chainFeeCoin } from '@vultisig/core-chain/coin/chainFeeCoin'
import type { Coin, CoinKey } from '@vultisig/core-chain/coin/Coin'
import type { Vault } from '@vultisig/core-mpc/vault/Vault'
import { attempt } from '@vultisig/lib-utils/attempt'
import { matchRecordUnion } from '@vultisig/lib-utils/matchRecordUnion'
import { areLowerCaseEqual } from '@vultisig/lib-utils/string/areLowerCaseEqual'
import { getUrlBaseDomain } from '@vultisig/lib-utils/url/baseDomain'
import { Psbt } from 'bitcoinjs-lib'

import type {
  IKeysignTransactionPayload,
  ITransactionPayload,
} from '../interfaces'
import type { SolanaTxData } from './solana/types/types'
import { restrictPsbtToInputs } from './utxo/restrictPsbt'

type RegularTxData = IKeysignTransactionPayload & {
  isEvmContractCall?: boolean
  coin: Coin
}

type SubstrateChain = OtherChain.Polkadot | OtherChain.Bittensor

const bittensorGenesisHash =
  '0x2f0555cc76fc2840a25a6ea3b9637146806f1f44b090c175ffde2a7e5ab36c03'
const polkadotGenesisHash =
  '0x91b171bb158e2d3848fa23a9f1c25182fb8e20313b2c1eb49219da7a70ce90c3'

const substrateChainByGenesisHash: Record<string, SubstrateChain> = {
  [bittensorGenesisHash]: OtherChain.Bittensor,
  [polkadotGenesisHash]: OtherChain.Polkadot,
}

const getSubstrateChain = (genesisHash: unknown): SubstrateChain => {
  if (typeof genesisHash !== 'string') {
    throw new Error('Missing Substrate genesis hash')
  }

  const chain = substrateChainByGenesisHash[genesisHash.toLowerCase()]

  if (!chain) {
    throw new Error('Unsupported Substrate genesis hash')
  }

  return chain
}

/** Substrate dApp transaction data whose chain is derived from its genesis hash. */
export type PolkadotDappTxData = {
  chain: SubstrateChain
  signerPayload: PolkadotSignerPayloadJSON
}

export type CustomTxData =
  | {
      regular: RegularTxData
    }
  | {
      solana: SolanaTxData
    }
  | {
      psbt: Psbt
    }
  | {
      polkadot: PolkadotDappTxData
    }

type GetCustomTxDataInput = {
  walletCore: WalletCore
  vault: Vault
  transactionPayload: ITransactionPayload
  getCoin: (coinKey: CoinKey) => Promise<Coin>
  requestOrigin: string
}

export const getCustomTxData = ({
  walletCore,
  vault,
  transactionPayload,
  getCoin,
  requestOrigin,
}: GetCustomTxDataInput) =>
  matchRecordUnion<ITransactionPayload, Promise<CustomTxData>>(
    transactionPayload,
    {
      keysign: async tx => {
        const getIsEvmContractCall = async () => {
          if (!isChainOfKind(tx.chain, 'evm')) return false

          const { data } = tx.transactionDetails

          if (!data || data === '0x') return false

          const result = await attempt(
            getEvmContractCallSignatures(getEvmContractCallHexSignature(data))
          )

          if ('error' in result) return false

          const { data: potentialData } = result

          return potentialData && potentialData.count > 0
        }

        const getCoinKey = (): CoinKey => {
          const { ticker, mint, contractAddress } = tx.transactionDetails.asset
          if (mint) {
            return { chain: Chain.Solana, id: mint }
          }

          const { chain } = tx

          const feeCoin = chainFeeCoin[chain]

          if (areLowerCaseEqual(ticker, feeCoin.ticker)) {
            return { chain }
          }

          if (contractAddress) {
            return { chain, id: contractAddress }
          }

          if (
            isChainOfKind(chain, 'cosmos') &&
            areLowerCaseEqual(ticker, cosmosFeeCoinDenom[chain])
          ) {
            return { chain }
          }

          return { chain, id: ticker }
        }

        const coin = await getCoin(getCoinKey())

        return {
          regular: {
            ...tx,
            isEvmContractCall: await getIsEvmContractCall(),
            coin,
          },
        }
      },
      serialized: async ({ data, chain, params }) => {
        if (chain === OtherChain.Polkadot || chain === OtherChain.Bittensor) {
          const signerPayload = JSON.parse(data[0]) as PolkadotSignerPayloadJSON
          return {
            polkadot: {
              chain: getSubstrateChain(signerPayload.genesisHash),
              signerPayload,
            },
          }
        }

        const [{ getPublicKey }, { deriveAddress }] = await Promise.all([
          import('@vultisig/core-chain/publicKey/getPublicKey'),
          import('@vultisig/core-chain/publicKey/address/deriveAddress'),
        ])

        const publicKey = getPublicKey({
          chain,
          walletCore,
          hexChainCode: vault.hexChainCode,
          publicKeys: vault.publicKeys,
          chainPublicKeys: vault.chainPublicKeys,
        })
        const address = deriveAddress({
          chain,
          publicKey,
          walletCore,
        })

        if (chain === Chain.Bitcoin) {
          const dataBuffer = Buffer.from(data[0], 'base64')
          let psbt = Psbt.fromBuffer(Buffer.from(dataBuffer))
          if (params && params.length > 0) {
            const currentWalletEntries = params.filter(e =>
              areLowerCaseEqual(e.address, address)
            )
            if (currentWalletEntries.length === 0) {
              throw new Error('No entries for wallet address')
            }
            psbt = restrictPsbtToInputs(
              psbt,
              currentWalletEntries.map(p => ({
                signingIndexes: p.signingIndexes,
                sigHash: p.sigHash,
              })),
              Buffer.from(publicKey.data())
            )
          }
          return { psbt }
        }

        const [{ toCommCoin }, { parseSolanaTx }] = await Promise.all([
          import('@vultisig/core-mpc/types/utils/commCoin'),
          import('./solana/parser'),
        ])

        return {
          solana: await parseSolanaTx({
            fromCoin: toCommCoin({
              ...(await getCoin({ chain: Chain.Solana })),
              hexPublicKey: Buffer.from(publicKey.data()).toString('hex'),
              address,
            }),
            walletCore,
            data: data,
            getCoin,
            swapProvider: getUrlBaseDomain(requestOrigin),
          }),
        }
      },
    }
  )

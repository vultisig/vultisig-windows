import { Chain } from '@core/chain/Chain'
import { getChainKind } from '@core/chain/ChainKind'
import { Coin, CoinKey } from '@core/chain/coin/Coin'
import {
  BlockaidEvmSimulationInfo,
  BlockaidSolanaSimulationInfo,
} from '@core/chain/security/blockaid/tx/simulation/core'
import { BlockaidSwapDisplay } from '@core/inpage-provider/popup/view/resolvers/sendTx/blockaid/BlockaidSwapDisplay'
import { BlockaidTransferDisplay } from '@core/inpage-provider/popup/view/resolvers/sendTx/blockaid/BlockaidTransferDisplay'
import { MemoSection } from '@core/inpage-provider/popup/view/resolvers/sendTx/components/MemoSection'
import {
  NetworkFeeSection,
  NetworkFeeSectionProps,
} from '@core/inpage-provider/popup/view/resolvers/sendTx/components/NetworkFeeSection'
import { getKeysignChain } from '@core/mpc/keysign/utils/getKeysignChain'
import { KeysignPayload } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { List } from '@lib/ui/list'
import { ListItem } from '@lib/ui/list/item'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { useQueryDependentQuery } from '@lib/ui/query/hooks/useQueryDependentQuery'
import { Query } from '@lib/ui/query/Query'
import { matchRecordUnion } from '@lib/utils/matchRecordUnion'
import { NATIVE_MINT } from '@solana/spl-token'
import { formatUnits } from 'ethers'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

type BlockaidSimulationContentProps = {
  blockaidSimulationQuery: Query<
    BlockaidEvmSimulationInfo | BlockaidSolanaSimulationInfo,
    unknown
  >
  keysignPayload: KeysignPayload
  address: string
  chain: Chain
  networkFeeProps: NetworkFeeSectionProps
  getCoin: (coinKey: CoinKey) => Promise<Coin>
}

type EnrichedSolanaSimulationInfo =
  | {
      swap: {
        fromAmount: number
        fromMint: string
        toAmount: number
        toAssetDecimal: number
        toMint: string
        fromCoin: Coin
        toCoin: Coin
      }
    }
  | {
      transfer: {
        fromAmount: number
        fromMint: string
        fromCoin: Coin
      }
    }

const enrichSolanaSimulationInfo = async (
  simulationInfo: BlockaidSolanaSimulationInfo,
  getCoin: (coinKey: CoinKey) => Promise<Coin>
): Promise<EnrichedSolanaSimulationInfo> => {
  return matchRecordUnion(simulationInfo, {
    swap: async ({
      fromAmount,
      fromMint,
      toAmount,
      toAssetDecimal,
      toMint,
    }) => {
      const [fromCoin, toCoin] = await Promise.all(
        [fromMint, toMint].map(mint => {
          const id = mint === NATIVE_MINT.toBase58() ? undefined : mint
          return getCoin({ chain: Chain.Solana, id })
        })
      )

      return {
        swap: {
          fromAmount,
          fromMint,
          toAmount,
          toAssetDecimal,
          toMint,
          fromCoin,
          toCoin,
        },
      }
    },
    transfer: async ({ fromAmount, fromMint }) => {
      const id = fromMint === NATIVE_MINT.toBase58() ? undefined : fromMint
      const fromCoin = await getCoin({ chain: Chain.Solana, id })

      return {
        transfer: {
          fromAmount,
          fromMint,
          fromCoin,
        },
      }
    },
  })
}

export const BlockaidSimulationContent = ({
  blockaidSimulationQuery,
  keysignPayload,
  address,
  chain,
  networkFeeProps,
  getCoin,
}: BlockaidSimulationContentProps) => {
  const { t } = useTranslation()

  const enrichedSolanaSimulationQuery = useQueryDependentQuery(
    blockaidSimulationQuery,
    useCallback(
      simulationInfo => {
        if (getChainKind(chain) !== 'solana') {
          return {
            queryKey: ['blockaid-solana-simulation-enriched', 'skip'],
            queryFn: async () => null,
          }
        }

        const solanaSimulationInfo =
          simulationInfo as BlockaidSolanaSimulationInfo

        return {
          queryKey: [
            'blockaid-solana-simulation-enriched',
            solanaSimulationInfo,
          ],
          queryFn: async () =>
            enrichSolanaSimulationInfo(solanaSimulationInfo, getCoin),
        }
      },
      [chain, getCoin]
    )
  )

  return (
    <MatchQuery
      value={blockaidSimulationQuery}
      success={blockaidSimulationInfo => {
        if (getChainKind(chain) === 'evm') {
          const blockaidEvmSimulationInfo =
            blockaidSimulationInfo as BlockaidEvmSimulationInfo
          if (!blockaidEvmSimulationInfo) {
            return (
              <>
                <List>
                  <ListItem description={address} title={t('from')} />
                  {keysignPayload.toAddress && (
                    <ListItem
                      description={keysignPayload.toAddress}
                      title={t('to')}
                    />
                  )}
                  {keysignPayload.toAmount && (
                    <ListItem
                      description={`${formatUnits(
                        keysignPayload.toAmount,
                        keysignPayload.coin?.decimals
                      )} ${keysignPayload.coin?.ticker}`}
                      title={t('amount')}
                    />
                  )}
                  <ListItem
                    description={getKeysignChain(keysignPayload)}
                    title={t('network')}
                  />
                </List>
                <MemoSection memo={keysignPayload.memo} chain={chain} />
                <NetworkFeeSection {...networkFeeProps} />
              </>
            )
          }

          return matchRecordUnion(blockaidEvmSimulationInfo, {
            swap: swap => (
              <BlockaidSwapDisplay
                swap={swap}
                memo={keysignPayload.memo}
                chain={chain}
                networkFeeProps={networkFeeProps}
              />
            ),
            transfer: transfer => (
              <BlockaidTransferDisplay
                transfer={transfer}
                fromAddress={address}
                toAddress={keysignPayload.toAddress}
                memo={keysignPayload.memo}
                chain={chain}
                networkFeeProps={networkFeeProps}
              />
            ),
          })
        } else {
          return (
            <MatchQuery
              value={enrichedSolanaSimulationQuery}
              success={enrichedInfo => {
                if (!enrichedInfo) {
                  return null
                }

                return matchRecordUnion(enrichedInfo, {
                  swap: swap => (
                    <BlockaidSwapDisplay
                      swap={{
                        fromAmount: BigInt(swap.fromAmount),
                        fromCoin: swap.fromCoin,
                        toAmount: BigInt(swap.toAmount),
                        toCoin: swap.toCoin,
                      }}
                      memo={keysignPayload.memo}
                      chain={chain}
                      networkFeeProps={networkFeeProps}
                    />
                  ),
                  transfer: transfer => (
                    <BlockaidTransferDisplay
                      transfer={{
                        fromAmount: BigInt(transfer.fromAmount),
                        fromCoin: transfer.fromCoin,
                      }}
                      fromAddress={address}
                      toAddress={keysignPayload.toAddress}
                      memo={keysignPayload.memo}
                      chain={chain}
                      networkFeeProps={networkFeeProps}
                    />
                  ),
                })
              }}
              pending={() => null}
              error={() => null}
              inactive={() => null}
            />
          )
        }
      }}
      error={() => null}
      pending={() => null}
      inactive={() => null}
    />
  )
}

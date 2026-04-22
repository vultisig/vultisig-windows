import { BlockaidSwapDisplay } from '@core/inpage-provider/popup/view/resolvers/sendTx/blockaid/BlockaidSwapDisplay'
import { BlockaidTransferDisplay } from '@core/inpage-provider/popup/view/resolvers/sendTx/blockaid/BlockaidTransferDisplay'
import {
  NetworkFeeSection,
  NetworkFeeSectionProps,
} from '@core/inpage-provider/popup/view/resolvers/sendTx/components/NetworkFeeSection'
import { Collapse } from '@core/inpage-provider/popup/view/resolvers/signMessage/components/Collapse'
import { CoinIcon } from '@core/ui/chain/coin/icon/CoinIcon'
import { extractTokenAndAmount } from '@core/ui/chain/tx/utils/extractTokenAndAmount'
import { formatTokenAmount } from '@core/ui/chain/tx/utils/formatTokenAmount'
import { useUniversalRouterSwap } from '@core/ui/chain/tx/utils/useUniversalRouterSwap'
import { TriangleAlertIcon } from '@lib/ui/icons/TriangleAlertIcon'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { List } from '@lib/ui/list'
import { ListItem } from '@lib/ui/list/item'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { useQueryDependentQuery } from '@lib/ui/query/hooks/useQueryDependentQuery'
import { Query } from '@lib/ui/query/Query'
import { Text } from '@lib/ui/text'
import { NATIVE_MINT } from '@solana/spl-token'
import { useQuery } from '@tanstack/react-query'
import { Chain, EvmChain } from '@vultisig/core-chain/Chain'
import { getEvmContractCallInfo } from '@vultisig/core-chain/chains/evm/contract/call/info'
import { Coin, CoinKey } from '@vultisig/core-chain/coin/Coin'
import {
  BlockaidEvmSimulationInfo,
  BlockaidSolanaSimulationInfo,
} from '@vultisig/core-chain/security/blockaid/tx/simulation/core'
import { getKeysignChain } from '@vultisig/core-mpc/keysign/utils/getKeysignChain'
import { KeysignPayload } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { capitalizeFirstLetter } from '@vultisig/lib-utils/capitalizeFirstLetter'
import { matchRecordUnion } from '@vultisig/lib-utils/matchRecordUnion'
import { formatUnits } from 'ethers'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

type BlockaidSimulationContentProps =
  | {
      chain: EvmChain
      blockaidSimulationQuery: Query<BlockaidEvmSimulationInfo, unknown>
      keysignPayload: KeysignPayload
      address: string
      networkFeeProps: NetworkFeeSectionProps
      getCoin: (coinKey: CoinKey) => Promise<Coin>
    }
  | {
      chain: typeof Chain.Solana
      blockaidSimulationQuery: Query<
        BlockaidSolanaSimulationInfo | null,
        unknown
      >
      keysignPayload: KeysignPayload
      address: string
      networkFeeProps: NetworkFeeSectionProps
      getCoin: (coinKey: CoinKey) => Promise<Coin>
    }

type EnrichedSolanaSimulationInfo =
  | {
      swap: {
        fromAmount: bigint
        fromMint: string
        toAmount: bigint
        toAssetDecimal: number
        toMint: string
        fromCoin: Coin
        toCoin: Coin
      }
    }
  | {
      transfer: {
        fromAmount: bigint
        fromMint: string
        fromCoin: Coin
      }
    }

const enrichSolanaSimulationInfo = async ({
  simulationInfo,
  getCoin,
}: {
  simulationInfo: BlockaidSolanaSimulationInfo
  getCoin: (coinKey: CoinKey) => Promise<Coin>
}): Promise<EnrichedSolanaSimulationInfo> => {
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

export const BlockaidSimulationContent = (
  props: BlockaidSimulationContentProps
) => {
  if (props.chain === Chain.Solana) {
    return <BlockaidSolanaSimulationContent {...props} />
  }
  return <BlockaidEvmSimulationContent {...props} />
}

const BlockaidSolanaSimulationContent = ({
  blockaidSimulationQuery,
  keysignPayload,
  address,
  chain,
  networkFeeProps,
  getCoin,
}: Extract<BlockaidSimulationContentProps, { chain: typeof Chain.Solana }>) => {
  const enrichedSolanaSimulationQuery = useQueryDependentQuery(
    blockaidSimulationQuery,
    useCallback(
      (simulationInfo: BlockaidSolanaSimulationInfo | null) => {
        return {
          queryKey: ['blockaid-solana-simulation-enriched', simulationInfo],
          queryFn: async () => {
            if (!simulationInfo) return null
            return enrichSolanaSimulationInfo({
              simulationInfo,
              getCoin,
            })
          },
        }
      },
      [getCoin]
    )
  )

  return (
    <MatchQuery
      value={blockaidSimulationQuery}
      success={(
        _blockaidSimulationInfo: BlockaidSolanaSimulationInfo | null
      ) => {
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
                      fromAmount: swap.fromAmount,
                      fromCoin: swap.fromCoin,
                      toAmount: swap.toAmount,
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
                      fromAmount: transfer.fromAmount,
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
      }}
      error={() => null}
      pending={() => null}
      inactive={() => null}
    />
  )
}

const BlockaidEvmSimulationContent = ({
  blockaidSimulationQuery,
  keysignPayload,
  address,
  chain,
  networkFeeProps,
  getCoin,
}: Extract<BlockaidSimulationContentProps, { chain: EvmChain }>) => {
  const fallback = (
    <EvmCalldataFallback
      keysignPayload={keysignPayload}
      address={address}
      chain={chain}
      networkFeeProps={networkFeeProps}
      getCoin={getCoin}
    />
  )

  return (
    <MatchQuery
      value={blockaidSimulationQuery}
      success={(blockaidSimulationInfo: BlockaidEvmSimulationInfo) => {
        if (!blockaidSimulationInfo) {
          return fallback
        }
        return matchRecordUnion(blockaidSimulationInfo, {
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
      }}
      error={() => fallback}
      pending={() => null}
      inactive={() => null}
    />
  )
}

type EvmCalldataFallbackProps = {
  keysignPayload: KeysignPayload
  address: string
  chain: EvmChain
  networkFeeProps: NetworkFeeSectionProps
  getCoin: (coinKey: CoinKey) => Promise<Coin>
}

const EvmCalldataFallback = ({
  keysignPayload,
  address,
  chain,
  networkFeeProps,
  getCoin,
}: EvmCalldataFallbackProps) => {
  const { t } = useTranslation()
  const memo = keysignPayload.memo

  const { data: universalRouterSwap, isPending: isUniversalRouterPending } =
    useUniversalRouterSwap({ memo, chain })

  const contractCallQuery = useQuery({
    queryKey: ['evmContractCallInfo', memo],
    queryFn: () => getEvmContractCallInfo(memo!),
    enabled:
      !isUniversalRouterPending &&
      !universalRouterSwap &&
      !!memo &&
      memo.startsWith('0x') &&
      memo.length > 2,
    staleTime: Infinity,
  })

  const tokenPair = contractCallQuery.data
    ? extractTokenAndAmount(
        contractCallQuery.data.functionSignature,
        contractCallQuery.data.functionArguments,
        keysignPayload.toAddress
      )
    : null

  const tokenQuery = useQuery({
    queryKey: ['resolveToken', tokenPair?.tokenAddress, chain],
    queryFn: () => getCoin({ id: tokenPair!.tokenAddress, chain }),
    enabled: !!tokenPair,
    staleTime: Infinity,
  })

  const rawFunctionName =
    contractCallQuery.data?.functionSignature.split('(')[0]
  const functionName = rawFunctionName
    ? capitalizeFirstLetter(rawFunctionName)
    : undefined

  const amountItem =
    keysignPayload.toAmount && keysignPayload.coin ? (
      <ListItem
        description={`${formatUnits(
          keysignPayload.toAmount,
          keysignPayload.coin.decimals
        )} ${keysignPayload.coin.ticker}`}
        title={t('amount')}
      />
    ) : null

  if (universalRouterSwap) {
    return (
      <BlockaidSwapDisplay
        swap={{
          fromCoin: universalRouterSwap.fromCoin,
          fromAmount: universalRouterSwap.fromAmount,
          toCoin: universalRouterSwap.toCoin,
          toAmount: universalRouterSwap.toAmount,
        }}
        memo={memo}
        chain={chain}
        networkFeeProps={networkFeeProps}
      />
    )
  }

  return (
    <>
      <List>
        <ListItem description={address} title={t('from')} />
        {keysignPayload.toAddress && (
          <ListItem description={keysignPayload.toAddress} title={t('to')} />
        )}
        {tokenQuery.data && tokenPair ? (
          (() => {
            const fmt = formatTokenAmount({
              rawAmount: BigInt(tokenPair.rawAmount),
              decimals: tokenQuery.data.decimals,
              functionName: rawFunctionName,
            })
            const ticker = tokenQuery.data.ticker
            const isUnlimited = fmt.isSentinel && !!fmt.display
            return (
              <ListItem
                icon={
                  <CoinIcon coin={tokenQuery.data} style={{ fontSize: 24 }} />
                }
                title={functionName || t('contract_execution')}
                status={isUnlimited ? 'warning' : 'default'}
                description={
                  isUnlimited ? (
                    <HStack alignItems="center" gap={6}>
                      <Text as={TriangleAlertIcon} color="warning" size={14} />
                      <Text color="warning" size={12} weight={500}>
                        {`${fmt.display} ${ticker}`}
                      </Text>
                    </HStack>
                  ) : fmt.display ? (
                    `${fmt.display} ${ticker}`
                  ) : (
                    ticker
                  )
                }
              />
            )
          })()
        ) : contractCallQuery.data ? (
          <ListItem
            title={functionName || t('contract_execution')}
            description={keysignPayload.toAddress}
          />
        ) : (
          amountItem
        )}
        <ListItem
          description={getKeysignChain(keysignPayload)}
          title={t('network')}
        />
      </List>
      <MatchQuery
        value={contractCallQuery}
        success={info =>
          info ? (
            <Collapse title={t('transaction_details')} transparent>
              <VStack gap={4}>
                <Text color="shy" size={12}>
                  {t('function_signature')}
                </Text>
                <Text color="primary" family="mono" size={14} weight="700">
                  {info.functionSignature}
                </Text>
              </VStack>
              <VStack gap={4}>
                <Text color="shy" size={12}>
                  {t('function_arguments')}
                </Text>
                <Text
                  color="primary"
                  family="mono"
                  size={14}
                  weight="700"
                  style={{ wordBreak: 'break-all' }}
                >
                  {info.functionArguments}
                </Text>
              </VStack>
            </Collapse>
          ) : null
        }
        error={() => null}
        pending={() => null}
        inactive={() => null}
      />
      <NetworkFeeSection {...networkFeeProps} />
    </>
  )
}

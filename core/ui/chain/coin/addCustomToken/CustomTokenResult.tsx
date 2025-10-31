import { coinKeyToString } from '@core/chain/coin/Coin'
import { ChainEntityIcon } from '@core/ui/chain/coin/icon/ChainEntityIcon'
import { getCoinLogoSrc } from '@core/ui/chain/coin/icon/utils/getCoinLogoSrc'
import {
  useCreateCoinMutation,
  useDeleteCoinMutation,
} from '@core/ui/storage/coins'
import { Button } from '@lib/ui/buttons/Button'
import { CircleHelpIcon } from '@lib/ui/icons/CircleHelpIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { EmptyState } from '@lib/ui/status/EmptyState'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useCoreViewState } from '../../../navigation/hooks/useCoreViewState'
import { useCurrentVaultChainCoins } from '../../../vault/state/currentVaultCoins'
import { useTokenMetadataQuery } from './queries/tokenMetadata'

export const CustomTokenResult = ({ id }: { id: string }) => {
  const [{ chain }] = useCoreViewState<'addCustomToken'>()
  const key = { chain, id } as const

  const query = useTokenMetadataQuery(key)
  const currentCoins = useCurrentVaultChainCoins(chain)
  const createCoin = useCreateCoinMutation()
  const deleteCoin = useDeleteCoinMutation()
  const { t } = useTranslation()
  const isLoading = createCoin.isPending || deleteCoin.isPending

  return (
    <MatchQuery
      value={query}
      error={() => (
        <ErrorStateWrapper>
          <EmptyState
            icon={
              <IconWrapper size={48} color="primary">
                <CircleHelpIcon />
              </IconWrapper>
            }
            title={t('no_token_found')}
            description={t('token_not_found_description')}
          />
          <Button
            kind="primary"
            onClick={() => query.refetch()}
            style={{ marginTop: 8 }}
          >
            {t('retry')}
          </Button>
        </ErrorStateWrapper>
      )}
      pending={() => (
        <LoadingWrapper>
          <VStack gap={16} alignItems="center">
            <Spinner />
            <Text color="shy">{t('loading')}</Text>
          </VStack>
        </LoadingWrapper>
      )}
      success={metadata => {
        const coin = { ...key, ...metadata }
        const isAdded = currentCoins.some(
          c => coinKeyToString(c) === coinKeyToString(coin)
        )

        const handleToggle = () => {
          if (isLoading) return
          const currentCoin = currentCoins.find(
            c => coinKeyToString(c) === coinKeyToString(coin)
          )
          if (currentCoin) {
            deleteCoin.mutate(currentCoin)
          } else {
            createCoin.mutate(coin)
          }
        }

        return (
          <TokenResultCard>
            <HStack gap={12} alignItems="center">
              <ChainEntityIcon
                value={coin.logo ? getCoinLogoSrc(coin.logo) : undefined}
                style={{ fontSize: 32 }}
              />
              <VStack gap={4}>
                <Text color="contrast" size={14} weight={500}>
                  {coin.ticker}
                </Text>
                <Text color="shy" size={12} cropped>
                  {coin.chain}
                </Text>
              </VStack>
            </HStack>
            <Text color="shy" size={12} cropped style={{ marginTop: 8 }}>
              {id}
            </Text>
            <Button
              kind="primary"
              onClick={handleToggle}
              disabled={isLoading}
              style={{ marginTop: 16 }}
            >
              {isAdded
                ? t('remove_token')
                : t('add_token', { ticker: coin.ticker })}
            </Button>
            {isLoading && (
              <LoadingOverlay>
                <Spinner />
                <Text color="shy" size={13}>
                  {t('adding_token')}
                </Text>
              </LoadingOverlay>
            )}
          </TokenResultCard>
        )
      }}
    />
  )
}

const ErrorStateWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 20px;
  max-width: 450px;
  margin-inline: auto;
`

const LoadingWrapper = styled.div`
  padding: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
`

const TokenResultCard = styled.div`
  position: relative;
  padding: 20px;
  border-radius: 16px;
  background: ${getColor('foreground')};
`

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  justify-content: center;
  align-items: center;
  background: ${getColor('foreground')};
  border-radius: 16px;
`

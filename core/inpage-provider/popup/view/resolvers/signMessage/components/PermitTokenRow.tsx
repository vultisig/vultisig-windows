import { PermitToken } from '@core/inpage-provider/popup/view/resolvers/signMessage/components/Eip712PermitDisplay'
import {
  Divider,
  RowValue,
} from '@core/inpage-provider/popup/view/resolvers/signMessage/styles'
import { formatPermitAmount } from '@core/inpage-provider/popup/view/resolvers/signMessage/utils/formatPermitAmount'
import { isUnlimitedPermitAmount } from '@core/inpage-provider/popup/view/resolvers/signMessage/utils/isUnlimitedPermitAmount'
import { useTokenMetadataQuery } from '@core/ui/chain/coin/addCustomToken/queries/tokenMetadata'
import { ChainEntityIcon } from '@core/ui/chain/coin/icon/ChainEntityIcon'
import { getCoinLogoSrc } from '@core/ui/chain/coin/icon/utils/getCoinLogoSrc'
import { TriangleAlertIcon } from '@lib/ui/icons/TriangleAlertIcon'
import { HStack } from '@lib/ui/layout/Stack'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Text } from '@lib/ui/text'
import { MiddleTruncate } from '@lib/ui/truncate'
import { EvmChain } from '@vultisig/core-chain/Chain'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'

type PermitTokenRowProps = {
  chain: EvmChain
  token: PermitToken
  primaryType: string
}

/**
 * Token and approval amount rows for one token of a permit. An unlimited
 * approval is flagged straight away. A finite amount waits for the token's
 * decimals so base units never pass for token units, shows every digit, and
 * falls back to base units only when the metadata lookup fails.
 */
export const PermitTokenRow: FC<PermitTokenRowProps> = ({
  chain,
  token,
  primaryType,
}) => {
  const { t } = useTranslation()
  const { amount } = token
  const metadataQuery = useTokenMetadataQuery({ chain, id: token.address })
  const metadata = metadataQuery.data

  const withTicker = (value: string) =>
    metadata?.ticker ? `${value} ${metadata.ticker}` : value

  return (
    <>
      <HStack
        alignItems="center"
        gap={8}
        justifyContent="space-between"
        wrap="nowrap"
      >
        <Text as="span" color="shy" size={14} weight={500} nowrap>
          {t('token')}
        </Text>
        <HStack
          alignItems="center"
          gap={8}
          justifyContent="end"
          wrap="nowrap"
          overflow="hidden"
          flexGrow
        >
          <ChainEntityIcon
            value={metadata?.logo ? getCoinLogoSrc(metadata.logo) : undefined}
            style={{ fontSize: 20 }}
          />
          {metadata?.ticker ? (
            <Text as="span" size={14} weight={500}>
              {metadata.ticker}
            </Text>
          ) : (
            <MiddleTruncate
              justifyContent="end"
              size={14}
              text={token.address}
              weight={500}
              flexGrow
            />
          )}
        </HStack>
      </HStack>
      <Divider />
      <HStack
        alignItems="center"
        gap={8}
        justifyContent="space-between"
        wrap="nowrap"
      >
        <Text as="span" color="shy" size={14} weight={500} nowrap>
          {t('approval_amount')}
        </Text>
        {isUnlimitedPermitAmount({ amount, primaryType }) ? (
          <HStack alignItems="center" gap={6} wrap="nowrap">
            <Text as={TriangleAlertIcon} color="warning" size={14} />
            <Text as="span" color="warning" size={14} weight={500} nowrap>
              {withTicker(t('unlimited'))}
            </Text>
          </HStack>
        ) : (
          <MatchQuery
            value={metadataQuery}
            pending={() => <Spinner role="status" aria-label={t('loading')} />}
            error={() => (
              <RowValue as="span" size={14} weight={500}>
                {amount.toString()}
              </RowValue>
            )}
            success={({ decimals }) => (
              <RowValue as="span" size={14} weight={500}>
                {withTicker(formatPermitAmount({ amount, decimals }))}
              </RowValue>
            )}
          />
        )}
      </HStack>
    </>
  )
}

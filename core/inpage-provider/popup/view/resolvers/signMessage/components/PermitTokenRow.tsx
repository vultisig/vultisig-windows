import { PermitToken } from '@core/inpage-provider/popup/view/resolvers/signMessage/components/Eip712PermitDisplay'
import { Divider } from '@core/inpage-provider/popup/view/resolvers/signMessage/styles'
import { useTokenMetadataQuery } from '@core/ui/chain/coin/addCustomToken/queries/tokenMetadata'
import { ChainEntityIcon } from '@core/ui/chain/coin/icon/ChainEntityIcon'
import { getCoinLogoSrc } from '@core/ui/chain/coin/icon/utils/getCoinLogoSrc'
import { formatTokenAmount } from '@core/ui/chain/tx/utils/formatTokenAmount'
import { TriangleAlertIcon } from '@lib/ui/icons/TriangleAlertIcon'
import { HStack } from '@lib/ui/layout/Stack'
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

const primaryTypeToFunctionName: Record<string, string> = {
  Permit: 'permit',
  PermitSingle: 'permitSingle',
  PermitBatch: 'permitBatch',
}

export const PermitTokenRow: FC<PermitTokenRowProps> = ({
  chain,
  token,
  primaryType,
}) => {
  const { t } = useTranslation()
  const metadataQuery = useTokenMetadataQuery({ chain, id: token.address })
  const metadata = metadataQuery.data

  const functionName = primaryTypeToFunctionName[primaryType]
  const formatted = metadata
    ? formatTokenAmount({
        rawAmount: token.amount,
        decimals: metadata.decimals,
        functionName,
      })
    : null

  const ticker = metadata?.ticker ?? ''
  const isUnlimited = !!formatted?.isSentinel && !!formatted.display
  const numericLabel = formatted?.display
    ? `${formatted.display}${ticker ? ` ${ticker}` : ''}`
    : `${token.amount.toString()}${ticker ? ` ${ticker}` : ''}`

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
        <HStack alignItems="center" gap={8} wrap="nowrap">
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
        {isUnlimited ? (
          <HStack alignItems="center" gap={6} wrap="nowrap">
            <Text as={TriangleAlertIcon} color="warning" size={14} />
            <Text as="span" color="warning" size={14} weight={500} nowrap>
              {`${t('unlimited')}${ticker ? ` ${ticker}` : ''}`}
            </Text>
          </HStack>
        ) : (
          <MiddleTruncate
            justifyContent="end"
            size={14}
            text={numericLabel}
            weight={500}
          />
        )}
      </HStack>
    </>
  )
}

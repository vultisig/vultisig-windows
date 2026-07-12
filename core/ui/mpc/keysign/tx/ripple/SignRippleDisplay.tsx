import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Panel } from '@lib/ui/panel/Panel'
import { Text } from '@lib/ui/text'
import { MiddleTruncate } from '@lib/ui/truncate'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'

import { RippleAmount, RippleTxData } from './parseRippleTx'

const formatAmount = (amount: RippleAmount): string =>
  amount.kind === 'native'
    ? `${amount.xrp} XRP`
    : `${amount.value} ${amount.currency}`

type SignRippleDisplayProps = { data: RippleTxData }

/**
 * Decoded view of a dApp-supplied XRPL transaction, rendered above the standard
 * from / network / fee rows in the keysign confirmation. Surfaces the
 * transaction type and its value-bearing fields (destination, amounts, offer
 * sides, trust limit) so the user approves what the tx actually does rather
 * than opaque JSON. Issued-currency amounts also show their issuer.
 */
export const SignRippleDisplay: FC<SignRippleDisplayProps> = ({ data }) => {
  const { t } = useTranslation()

  return (
    <Panel>
      <VStack gap={12}>
        <Text size={14} weight={500} color="contrast">
          {t('ripple_transaction_summary')}
        </Text>
        <HStack alignItems="center" justifyContent="space-between" gap={8}>
          <Text size={13} color="shy">
            {t('ripple_field_type')}
          </Text>
          <Text size={13} color="contrast">
            {data.transactionType}
          </Text>
        </HStack>
        {data.fields.map((field, index) => (
          <VStack key={index} gap={4}>
            <HStack alignItems="center" justifyContent="space-between" gap={8}>
              <Text size={13} color="shy">
                {t(field.labelKey)}
              </Text>
              {field.amount ? (
                <Text size={13} color="contrast">
                  {formatAmount(field.amount)}
                </Text>
              ) : (
                <MiddleTruncate
                  text={field.text ?? ''}
                  size={13}
                  justifyContent="end"
                  flexGrow
                />
              )}
            </HStack>
            {field.amount?.kind === 'issued' && (
              <HStack
                alignItems="center"
                justifyContent="space-between"
                gap={8}
              >
                <Text size={12} color="shy">
                  {t('ripple_field_issuer')}
                </Text>
                <MiddleTruncate
                  text={field.amount.issuer}
                  size={12}
                  justifyContent="end"
                  flexGrow
                />
              </HStack>
            )}
          </VStack>
        ))}
      </VStack>
    </Panel>
  )
}

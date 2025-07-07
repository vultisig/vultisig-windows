import { hStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

export const Fees = () => {
  const { t } = useTranslation()

  return (
    <VStack gap={14}>
      <RowWrapper>
        <Text size={13} color="supporting">
          {t('referral_reg_fee')}
        </Text>
        <VStack alignItems="flecx-end">
          <Text size={14}>10 RUNE</Text>
          <Text size={14} color="supporting">
            $12.304
          </Text>
        </VStack>
      </RowWrapper>
      <RowWrapper>
        <Text size={13} color="supporting">
          {t('referral_costs')}
        </Text>
        <VStack alignItems="flecx-end">
          <Text size={14}>2 x 1 RUNE</Text>
          <Text size={14} color="supporting">
            $$2.30
          </Text>
        </VStack>
      </RowWrapper>
    </VStack>
  )
}

const RowWrapper = styled.div`
  ${hStack({
    justifyContent: 'space-between',
    alignItems: 'center',
  })}
`

import {
  HorizontalLine,
  IconWrapper,
} from '@core/ui/vault/swap/verify/SwapVerify/SwapVerify.styled'
import { ArrowDownIcon } from '@lib/ui/icons/ArrowDownIcon'
import { HStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

/** Separates the two sides of the trade and names the receiving side. */
export const SwapVerifyToDivider = () => {
  const { t } = useTranslation()

  return (
    <HStack alignItems="center" gap={10}>
      <IconWrapper>
        <ArrowDownIcon />
      </IconWrapper>
      <Text color="shy" size={14}>
        {t('to')}
      </Text>
      <HorizontalLine />
    </HStack>
  )
}

import { ClockIcon } from '@lib/ui/icons/ClockIcon'
import { VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

import { SecondaryActionWrapper } from '../../components/PrimaryActions.styled'

type ZcashSyncPromptProps = {
  onClick: () => void
}

export const ZcashSyncPrompt = ({ onClick }: ZcashSyncPromptProps) => {
  const { t } = useTranslation()

  return (
    <VStack alignItems="center" gap={8}>
      <SecondaryActionWrapper onClick={onClick}>
        <ClockIcon />
      </SecondaryActionWrapper>
      <Text color="shyExtra" size={12}>
        {t('sync')}
      </Text>
    </VStack>
  )
}

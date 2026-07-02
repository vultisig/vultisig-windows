import { ArrowWallDownIcon } from '@lib/ui/icons/ArrowWallDownIcon'
import { StationArrowDownFromLineIcon } from '@lib/ui/icons/StationFigmaIcons'
import { VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'
import { useTheme } from 'styled-components'

import { SecondaryActionWrapper } from './PrimaryActions.styled'

type ReceivePromptProps = {
  onClick: () => void
}

export const ReceivePrompt = ({ onClick }: ReceivePromptProps) => {
  const { t } = useTranslation()
  const { iconStyle } = useTheme()

  return (
    <VStack alignItems="center" gap={8}>
      <SecondaryActionWrapper
        data-testid="vault-action-receive"
        onClick={onClick}
      >
        {iconStyle === 'station' ? (
          <StationArrowDownFromLineIcon />
        ) : (
          <ArrowWallDownIcon />
        )}
      </SecondaryActionWrapper>
      <Text color="shyExtra" size={12}>
        {t('receive')}
      </Text>
    </VStack>
  )
}

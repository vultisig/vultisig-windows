import { useCore } from '@core/ui/state/core'
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
  const { client } = useCore()
  const { iconStyle } = useTheme()
  const isExtension = client === 'extension'

  return (
    <VStack alignItems="center" gap={8}>
      <SecondaryActionWrapper
        $isExtension={isExtension}
        data-testid="vault-action-receive"
        onClick={onClick}
      >
        {isExtension || iconStyle === 'station' ? (
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

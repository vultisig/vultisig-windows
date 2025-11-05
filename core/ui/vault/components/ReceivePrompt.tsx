import { CoinKey } from '@core/chain/coin/Coin'
import { ArrowWallDownIcon } from '@lib/ui/icons/ArrowWallDownIcon'
import { VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

import { SecondaryActionWrapper } from './PrimaryActions.styled'

type ReceivePromptProps = {
  coin: CoinKey
  onClick: () => void
}

export const ReceivePrompt = ({ onClick }: ReceivePromptProps) => {
  const { t } = useTranslation()

  return (
    <VStack alignItems="center" gap={8}>
      <SecondaryActionWrapper onClick={onClick}>
        <ArrowWallDownIcon />
      </SecondaryActionWrapper>
      <Text color="shyExtra" size={12}>
        {t('receive')}
      </Text>
    </VStack>
  )
}

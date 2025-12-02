import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { Button } from '@lib/ui/buttons/Button'
import { CryptoIcon } from '@lib/ui/icons/CryptoIcon'
import { CryptoWalletPenIcon } from '@lib/ui/icons/CryptoWalletPenIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useCurrentDefiChain } from '../useCurrentDefiChain'

export const DefiPositionEmptyState = () => {
  const { t } = useTranslation()
  const navigate = useCoreNavigate()
  const chain = useCurrentDefiChain()

  return (
    <EmptyWrapper>
      <VStack gap={12} alignItems="center">
        <IconCircle>
          <CryptoIcon />
        </IconCircle>
        <VStack gap={8}>
          <Text centerHorizontally size={17} weight="600">
            {t('no_positions_selected')}
          </Text>
          <Text size={13} color="shy" centerHorizontally>
            {t('no_positions_selected_description')}
          </Text>
        </VStack>
      </VStack>
      <Button
        onClick={() =>
          navigate({ id: 'manageDefiPositions', state: { chain } })
        }
        style={{
          maxWidth: 'fit-content',
          maxHeight: 32,
        }}
        icon={
          <IconWrapper size={16}>
            <CryptoWalletPenIcon />
          </IconWrapper>
        }
      >
        <Text size={12}>{t('customize_positions')}</Text>
      </Button>
    </EmptyWrapper>
  )
}

const EmptyWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 40px 20px;
  background-color: ${getColor('foreground')};
  border-radius: 12px;
`

const IconCircle = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: ${getColor('primaryAccent')};
  border: 1.5px solid ${getColor('primaryAccent')};
`

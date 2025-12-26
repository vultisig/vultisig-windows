import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { Button } from '@lib/ui/buttons/Button'
import { CircleIcon } from '@lib/ui/icons/CircleIcon'
import { CryptoWalletPenIcon } from '@lib/ui/icons/CryptoWalletPenIcon'
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
          <CircleIcon />
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
        icon={<CryptoWalletPenIcon />}
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
  width: 56px;
  height: 56px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: ${getColor('info')};
  border: 1.5px solid ${getColor('info')};
  background: ${getColor('foregroundExtra')};
`

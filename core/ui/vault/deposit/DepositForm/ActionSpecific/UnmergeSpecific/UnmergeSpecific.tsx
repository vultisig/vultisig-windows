import { Opener } from '@lib/ui/base/Opener'
import { ChevronRightIcon } from '@lib/ui/icons/ChevronRightIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

import { useDepositCoin } from '../../../providers/DepositCoinProvider'
import { Container } from '../../DepositForm.styled'
import { useUnmergeOptions } from './hooks/useUnmergeOptions'
import { UnmergeTokenExplorer } from './UnmergeTokenExplorer'

export const UnmergeSpecific = () => {
  const [selectedCoin] = useDepositCoin()
  const { t } = useTranslation()
  const tokens = useUnmergeOptions()

  return (
    <VStack gap={12}>
      <Opener
        renderOpener={({ onOpen }) => (
          <Container onClick={onOpen}>
            <HStack alignItems="center" gap={4}>
              <Text weight="400" family="mono" size={16}>
                {selectedCoin.ticker || t('select_token')}
              </Text>
              {!selectedCoin && (
                <Text as="span" color="danger" size={14}>
                  *
                </Text>
              )}
            </HStack>
            <IconWrapper style={{ fontSize: 20 }}>
              <ChevronRightIcon />
            </IconWrapper>
          </Container>
        )}
        renderContent={({ onClose }) => (
          <UnmergeTokenExplorer value={tokens} onClose={onClose} />
        )}
      />
    </VStack>
  )
}

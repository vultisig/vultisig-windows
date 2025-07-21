import { Coin } from '@core/chain/coin/Coin'
import { Opener } from '@lib/ui/base/Opener'
import { ChevronRightIcon } from '@lib/ui/icons/ChevronRightIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

import { useDepositFormHandlers } from '../../../providers/DepositFormHandlersProvider'
import { Container } from '../../DepositForm.styled'
import { UnmergeTokenExplorer } from './UnmergeTokenExplorer'

type Props = {
  selectedCoin: Coin | null
}

export const UnmergeSpecific = ({ selectedCoin }: Props) => {
  const { t } = useTranslation()
  const [{ setValue, watch }] = useDepositFormHandlers()

  return (
    <VStack gap={12}>
      <Opener
        renderOpener={({ onOpen }) => (
          <Container onClick={onOpen}>
            <HStack alignItems="center" gap={4}>
              <Text weight="400" family="mono" size={16}>
                {selectedCoin?.ticker || t('select_token')}
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
          <UnmergeTokenExplorer
            setValue={setValue}
            activeOption={watch('selectedCoin')}
            onOptionClick={(token: Coin) => {
              setValue('selectedCoin', token, {
                shouldValidate: true,
              })
              onClose()
            }}
            onClose={onClose}
          />
        )}
      />
    </VStack>
  )
}

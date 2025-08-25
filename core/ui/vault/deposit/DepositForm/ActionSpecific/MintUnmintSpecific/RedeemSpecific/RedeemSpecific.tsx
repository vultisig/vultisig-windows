import { Opener } from '@lib/ui/base/Opener'
import { ChevronRightIcon } from '@lib/ui/icons/ChevronRightIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { HStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

import { useRedeemOptions } from '../../../../hooks/useRedeemOptions'
import { useDepositCoin } from '../../../../providers/DepositCoinProvider'
import { AssetRequiredLabel, Container } from '../../../DepositForm.styled'
import { RedeemTokenExplorer } from './RedeemTokenExplorer'

export const RedeemSpecific = () => {
  const { t } = useTranslation()
  const tokens = useRedeemOptions()
  const [selectedCoin, setSelectedCoin] = useDepositCoin()

  return (
    <Opener
      renderOpener={({ onOpen }) => (
        <Container onClick={onOpen}>
          <HStack alignItems="center" gap={4}>
            <Text weight="400" family="mono" size={16}>
              {selectedCoin.ticker || t('select_token')}
            </Text>
            {!selectedCoin && (
              <AssetRequiredLabel as="span" color="danger" size={14}>
                *
              </AssetRequiredLabel>
            )}
          </HStack>
          <IconWrapper style={{ fontSize: 20 }}>
            <ChevronRightIcon />
          </IconWrapper>
        </Container>
      )}
      renderContent={({ onClose }) => (
        <RedeemTokenExplorer
          options={tokens}
          onOptionClick={token => {
            setSelectedCoin(token)
            onClose()
          }}
          onClose={onClose}
        />
      )}
    />
  )
}

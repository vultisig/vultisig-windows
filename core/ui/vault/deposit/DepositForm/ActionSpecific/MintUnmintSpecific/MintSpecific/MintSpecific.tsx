import { Opener } from '@lib/ui/base/Opener'
import { ChevronRightIcon } from '@lib/ui/icons/ChevronRightIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { HStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

import { useMintOptions } from '../../../../hooks/useMintOptions'
import { useDepositCoin } from '../../../../providers/DepositCoinProvider'
import { AssetRequiredLabel, Container } from '../../../DepositForm.styled'
import { MintTokenExplorer } from './MintTokenExplorer'

export const MintSpecific = () => {
  const [selectedCoin, setSelectedCoin] = useDepositCoin()
  const { t } = useTranslation()
  const options = useMintOptions()

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
        <MintTokenExplorer
          options={options}
          activeOption={selectedCoin}
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

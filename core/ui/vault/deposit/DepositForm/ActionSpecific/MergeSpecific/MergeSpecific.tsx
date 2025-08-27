import { Opener } from '@lib/ui/base/Opener'
import { ChevronRightIcon } from '@lib/ui/icons/ChevronRightIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { HStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

import { useDepositCoin } from '../../../providers/DepositCoinProvider'
import { AssetRequiredLabel, Container } from '../../DepositForm.styled'
import { MergeTokenExplorer } from './MergeTokenExplorer'

export const MergeSpecific = () => {
  const { t } = useTranslation()
  const [depositCoin, setDepositCoin] = useDepositCoin()

  return (
    <Opener
      renderOpener={({ onOpen }) => (
        <Container onClick={onOpen}>
          <HStack alignItems="center" gap={4}>
            <Text weight="400" family="mono" size={16}>
              {depositCoin.ticker || t('select_token')}
            </Text>
            {!depositCoin && (
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
        <MergeTokenExplorer
          activeOption={depositCoin}
          onOptionClick={token => setDepositCoin(token)}
          onClose={onClose}
        />
      )}
    />
  )
}

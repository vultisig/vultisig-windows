import { Coin } from '@core/chain/coin/Coin'
import { Opener } from '@lib/ui/base/Opener'
import { ChevronRightIcon } from '@lib/ui/icons/ChevronRightIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { HStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

import { useDepositFormHandlers } from '../../../providers/DepositFormHandlersProvider'
import { AssetRequiredLabel, Container } from '../../DepositForm.styled'
import { MergeTokenExplorer } from './MergeTokenExplorer'

type MergeSpecificProps = {
  selectedCoin: Coin | null
}

export const MergeSpecific = ({ selectedCoin }: MergeSpecificProps) => {
  const { t } = useTranslation()
  const [{ setValue, watch }] = useDepositFormHandlers()

  return (
    <Opener
      renderOpener={({ onOpen }) => (
        <Container onClick={onOpen}>
          <HStack alignItems="center" gap={4}>
            <Text weight="400" family="mono" size={16}>
              {selectedCoin?.ticker || t('select_token')}
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
        <MergeTokenExplorer
          setValue={setValue}
          activeOption={watch('selectedCoin')}
          onOptionClick={token =>
            setValue('selectedCoin', token, {
              shouldValidate: true,
            })
          }
          onClose={onClose}
        />
      )}
    />
  )
}

import { Coin } from '@core/chain/coin/Coin'
import { Match } from '@lib/ui/base/Match'
import { Opener } from '@lib/ui/base/Opener'
import { ChevronRightIcon } from '@lib/ui/icons/ChevronRightIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { HStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

import { StakeableChain } from '../../../constants'
import { useDepositFormHandlers } from '../../../providers/DepositFormHandlersProvider'
import { AssetRequiredLabel, Container } from '../../DepositForm.styled'
import { StakeTokenExplorer } from './StakeTokenExplorer'

export const StakeSpecific = () => {
  const [{ setValue, watch, getValues, chain }] = useDepositFormHandlers()
  const { t } = useTranslation()
  const selectedCoin = getValues('selectedCoin') as Coin | null

  return (
    <Match
      value={chain as StakeableChain}
      THORChain={() => (
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
            <StakeTokenExplorer
              setValue={setValue}
              activeOption={watch('selectedCoin')}
              onOptionClick={token => {
                setValue('selectedCoin', token, {
                  shouldValidate: true,
                })
                onClose()
              }}
              onClose={onClose}
            />
          )}
        />
      )}
      Ton={() => null}
    />
  )
}

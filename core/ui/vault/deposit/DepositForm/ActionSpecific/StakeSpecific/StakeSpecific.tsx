import { tcyAutoCompounderConfig } from '@core/chain/chains/cosmos/thor/tcy-autocompound/config'
import { Match } from '@lib/ui/base/Match'
import { Opener } from '@lib/ui/base/Opener'
import { ChevronRightIcon } from '@lib/ui/icons/ChevronRightIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { Checkbox } from '@lib/ui/inputs/checkbox/Checkbox'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { Controller } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { StakeableChain } from '../../../config'
import { useDepositCoin } from '../../../providers/DepositCoinProvider'
import { useDepositFormHandlers } from '../../../providers/DepositFormHandlersProvider'
import { AssetRequiredLabel, Container } from '../../DepositForm.styled'
import { StakeTokenExplorer } from './StakeTokenExplorer'

export const StakeSpecific = () => {
  const [{ chain, control }] = useDepositFormHandlers()
  const { t } = useTranslation()
  const [selectedCoin, setSelectedCoin] = useDepositCoin()

  return (
    <Match
      value={chain as StakeableChain}
      THORChain={() => (
        <Opener
          renderOpener={({ onOpen }) => (
            <VStack gap={8}>
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
              {selectedCoin?.id === tcyAutoCompounderConfig.depositDenom && (
                <Controller
                  name="autoCompound"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <Checkbox
                      value={value}
                      onChange={onChange}
                      label={t('auto_compound_into_label', {
                        ticker: tcyAutoCompounderConfig.shareTicker,
                      })}
                    />
                  )}
                />
              )}
            </VStack>
          )}
          renderContent={({ onClose }) => (
            <StakeTokenExplorer
              activeOption={selectedCoin}
              onOptionClick={token => {
                setSelectedCoin(token)
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

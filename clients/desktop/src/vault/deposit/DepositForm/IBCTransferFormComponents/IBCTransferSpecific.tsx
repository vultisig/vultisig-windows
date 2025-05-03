import { Chain } from '@core/chain/Chain'
import { Coin } from '@core/chain/coin/Coin'
import { Opener } from '@lib/ui/base/Opener'
import { ChevronRightIcon } from '@lib/ui/icons/ChevronRightIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import {
  UseFormGetValues,
  UseFormSetValue,
  UseFormWatch,
} from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { FormData } from '..'
import { getIbcDropdownOptions } from '../chainOptionsConfig'
import { AssetRequiredLabel, Container } from '../DepositForm.styled'
import { TokenExplorer } from '../TokenExplorer'
import { IBCTransferExplorer } from './IBCTransferExplorer'

export const IBCTransferSpecific = ({
  watch,
  setValue,
  getValues,
  chain,
}: {
  watch: UseFormWatch<FormData>
  getValues: UseFormGetValues<FormData>
  setValue: UseFormSetValue<FormData>
  chain: Chain
}) => {
  const { t } = useTranslation()
  const selectedDestinationChain = getValues('destinationChain')
  const selectedCoin = getValues('selectedCoin') as Coin

  return (
    <VStack gap={28}>
      <Opener
        renderOpener={({ onOpen }) => (
          <Container onClick={onOpen}>
            <HStack alignItems="center" gap={4}>
              <Text weight="400" family="mono" size={16}>
                {selectedDestinationChain || t('select_destination_chain')}
              </Text>
              {!selectedDestinationChain && (
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
          <IBCTransferExplorer
            onClose={onClose}
            activeOption={watch('destinationChain')}
            onOptionClick={selectedChain => {
              setValue('destinationChain', selectedChain, {
                shouldValidate: true,
              })
              onClose()
            }}
            options={getIbcDropdownOptions(chain)}
          />
        )}
      />
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
          <TokenExplorer
            onClose={onClose}
            activeOption={watch('selectedCoin')}
            onOptionClick={selectedCoin => {
              setValue('selectedCoin', selectedCoin, {
                shouldValidate: true,
              })
              onClose()
            }}
          />
        )}
      />
    </VStack>
  )
}

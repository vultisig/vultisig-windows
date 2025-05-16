import { Chain } from '@core/chain/Chain'
import { Coin } from '@core/chain/coin/Coin'
import { isNativeCoin } from '@core/chain/coin/utils/isNativeCoin'
import { useCurrentVaultCoins } from '@core/ui/vault/state/currentVaultCoins'
import { Opener } from '@lib/ui/base/Opener'
import { ChevronRightIcon } from '@lib/ui/icons/ChevronRightIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { InputContainer } from '@lib/ui/inputs/InputContainer'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { useIBCAcceptedTokens } from '../../../hooks/useIBCAcceptedTokens'
import { useDepositFormHandlers } from '../../../providers/DepositFormHandlersProvider'
import { getIbcDropdownOptions } from '../../chainOptionsConfig'
import {
  AssetRequiredLabel,
  Container,
  InputFieldWrapper,
} from '../../DepositForm.styled'
import { TokenExplorer } from '../../TokenExplorer'
import { IBCTransferExplorer } from './IBCTransferExplorer'

export const IBCTransferSpecific = () => {
  const [{ setValue, watch, getValues, chain }] = useDepositFormHandlers()
  const { t } = useTranslation()
  const selectedDestinationChain = getValues('destinationChain')
  const tokens = useIBCAcceptedTokens(selectedDestinationChain)
  const filteredTokens = tokens.filter(
    token =>
      selectedDestinationChain === Chain.Osmosis || token.ticker !== 'LVN'
  )
  const selectedCoin = getValues('selectedCoin') as Coin
  const vaultCoins = useCurrentVaultCoins()
  const selectedAddress = getValues('nodeAddress') as string
  const ibcOptions = useMemo(() => getIbcDropdownOptions(chain), [chain])

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

              const newNodeAddress =
                vaultCoins.find(
                  coin => coin.chain === selectedChain && isNativeCoin(coin)
                )?.address || ''

              setValue('nodeAddress', newNodeAddress, {
                shouldValidate: true,
              })
            }}
            options={ibcOptions}
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
            options={filteredTokens}
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
      <InputContainer>
        <Text size={15} weight="400" color="contrast">
          {t('destination_address')}{' '}
          <Text as="span" color="danger" size={14}>
            *
          </Text>
        </Text>
        <InputFieldWrapper
          as="input"
          readOnly
          value={
            selectedAddress
              ? selectedAddress
              : selectedDestinationChain
                ? t('missing_destination_address')
                : ''
          }
        />
      </InputContainer>
    </VStack>
  )
}

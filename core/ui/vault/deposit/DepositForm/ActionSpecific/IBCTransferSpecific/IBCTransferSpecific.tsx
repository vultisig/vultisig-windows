import { useCurrentVaultCoins } from '@core/ui/vault/state/currentVaultCoins'
import { Opener } from '@lib/ui/base/Opener'
import { ChevronRightIcon } from '@lib/ui/icons/ChevronRightIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { InputContainer } from '@lib/ui/inputs/InputContainer'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { Chain } from '@vultisig/core-chain/Chain'
import { isFeeCoin } from '@vultisig/core-chain/coin/utils/isFeeCoin'
import { useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { useIBCAcceptedTokens } from '../../../hooks/useIBCAcceptedTokens'
import { useDepositCoin } from '../../../providers/DepositCoinProvider'
import { useDepositFormHandlers } from '../../../providers/DepositFormHandlersProvider'
import { getIbcDropdownOptions } from '../../../utils/getDepositFormConfig'
import {
  AssetRequiredLabel,
  Container,
  InputFieldWrapper,
} from '../../DepositForm.styled'
import { TokenExplorer } from '../../TokenExplorer'
import { IBCTransferExplorer } from './IBCTransferExplorer'

/**
 * IBC transfer fields of the deposit form: destination chain, token and the
 * vault's address on the destination chain. Reads the form through
 * `useWatch` because nothing above it re-renders after `setValue`.
 */
export const IBCTransferSpecific = () => {
  const [{ setValue, control, chain }] = useDepositFormHandlers()
  const { t } = useTranslation()
  const selectedDestinationChain = useWatch({
    control,
    name: 'destinationChain',
  })
  const tokens = useIBCAcceptedTokens(selectedDestinationChain)
  const filteredTokens = tokens.filter(
    token =>
      selectedDestinationChain === Chain.Osmosis || token.ticker !== 'LVN'
  )
  const [selectedCoin, setDepositCoin] = useDepositCoin()
  const vaultCoins = useCurrentVaultCoins()
  const selectedAddress = useWatch({ control, name: 'nodeAddress' })
  const ibcOptions = getIbcDropdownOptions(chain)

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
            activeOption={selectedDestinationChain}
            onOptionClick={selectedChain => {
              setValue('destinationChain', selectedChain, {
                shouldValidate: true,
              })

              const newNodeAddress =
                vaultCoins.find(
                  coin => coin.chain === selectedChain && isFeeCoin(coin)
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
          <TokenExplorer
            options={filteredTokens}
            onClose={onClose}
            activeOption={selectedCoin}
            onOptionClick={selectedCoin => {
              setDepositCoin(selectedCoin)
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

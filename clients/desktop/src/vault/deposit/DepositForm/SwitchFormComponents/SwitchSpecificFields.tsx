import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { coinKeyFromString } from '@core/chain/coin/Coin'
import { useCorePathParams } from '@core/ui/navigation/hooks/useCorePathParams'
import { useCurrentVaultCoins } from '@core/ui/vault/state/currentVaultCoins'
import { Opener } from '@lib/ui/base/Opener'
import { ChevronRightIcon } from '@lib/ui/icons/ChevronRightIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { InputContainer } from '@lib/ui/inputs/InputContainer'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { extractErrorMsg } from '@lib/utils/error/extractErrorMsg'
import { useEffect } from 'react'
import {
  UseFormGetValues,
  UseFormSetValue,
  UseFormWatch,
} from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { useIBCAcceptedTokens } from '../../hooks/useIBCAcceptedTokens'
import { useSwitchTransferTargetQuery } from '../../hooks/useSwitchTransferTarget'
import { FormData } from '..'
import {
  AssetRequiredLabel,
  Container,
  InputFieldWrapper,
} from '../DepositForm.styled'
import { TokenExplorer } from '../TokenExplorer'

export const SwitchSpecificFields = ({
  watch,
  getValues,
  setValue,
}: {
  watch: UseFormWatch<FormData>
  getValues: UseFormGetValues<FormData>
  setValue: UseFormSetValue<FormData>
}) => {
  const { t } = useTranslation()

  const {
    data: destinationAddress,
    isPending,
    error,
  } = useSwitchTransferTargetQuery()
  const throchainCoin = useCurrentVaultCoins().find(
    coin => coin.ticker === chainFeeCoin.THORChain.ticker
  )

  const [{ coin }] = useCorePathParams<'deposit'>()
  const tokens = useIBCAcceptedTokens(coinKeyFromString(coin).chain)

  useEffect(() => {
    if (destinationAddress) {
      setValue('nodeAddress', destinationAddress, {
        shouldValidate: true,
      })
    }
  }, [destinationAddress, setValue])

  useEffect(() => {
    if (throchainCoin) {
      setValue('thorchainAddress', throchainCoin.address, {
        shouldValidate: true,
      })
    }
  }, [setValue, throchainCoin])

  const selectedCoin = getValues('selectedCoin')

  return (
    <>
      <VStack gap={28}>
        <InputContainer>
          <Text size={15} weight="400" color="contrast">
            {t('destination_address')}{' '}
            <Text as="span" color="danger" size={14}>
              *
            </Text>
          </Text>

          <InputFieldWrapper
            as="input"
            value={
              isPending
                ? t('loading')
                : destinationAddress
                  ? destinationAddress
                  : extractErrorMsg(error)
            }
          />
        </InputContainer>
        <InputContainer>
          <Text size={15} weight="400" color="contrast">
            {t('thorchain_address')}{' '}
            <Text as="span" color="danger" size={14}>
              *
            </Text>
          </Text>
          <InputFieldWrapper
            as="input"
            readOnly
            value={throchainCoin?.address ?? t('missing_thorchain_address')}
          />
        </InputContainer>
      </VStack>
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
            options={tokens}
            activeOption={watch('selectedCoin')}
            onOptionClick={token =>
              setValue('selectedCoin', token, { shouldValidate: true })
            }
            onClose={onClose}
          />
        )}
      />
    </>
  )
}

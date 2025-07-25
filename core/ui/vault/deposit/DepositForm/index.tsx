import { Chain } from '@core/chain/Chain'
import { Coin, getCoinFromCoinKey } from '@core/chain/coin/Coin'
import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import { useCoreViewState } from '@core/ui/navigation/hooks/useCoreViewState'
import { ChainAction } from '@core/ui/vault/deposit/ChainAction'
import { DepositActionSpecific } from '@core/ui/vault/deposit/DepositForm/ActionSpecific/DepositActionSpecific'
import { DepositActionItemExplorer } from '@core/ui/vault/deposit/DepositForm/DepositActionItemExplorer'
import {
  Container,
  ErrorText,
  InputFieldWrapper,
} from '@core/ui/vault/deposit/DepositForm/DepositForm.styled'
import { useGetTotalAmountAvailableForChain } from '@core/ui/vault/deposit/hooks/useGetAmountTotalBalance'
import { DepositFormHandlersProvider } from '@core/ui/vault/deposit/providers/DepositFormHandlersProvider'
import {
  getChainActionSchema,
  getFieldsForChainAction,
  resolveSchema,
} from '@core/ui/vault/deposit/utils/schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { Opener } from '@lib/ui/base/Opener'
import { Button } from '@lib/ui/buttons/Button'
import { WithProgressIndicator } from '@lib/ui/flow/WithProgressIndicator'
import { ChevronRightIcon } from '@lib/ui/icons/ChevronRightIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { InputContainer } from '@lib/ui/inputs/InputContainer'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { PageHeaderBackButton } from '@lib/ui/page/PageHeaderBackButton'
import { Text } from '@lib/ui/text'
import { FC, useEffect, useState } from 'react'
import { FieldValues, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { useSelectedCoinBalance } from '../hooks/useSelectedCoinBance'

export type FormData = Record<string, any>
type DepositFormProps = {
  onSubmit: (data: FieldValues, selectedChainAction: ChainAction) => void
  selectedChainAction: ChainAction
  onSelectChainAction: (action: ChainAction) => void
  chainActionOptions: ChainAction[]
  chain: Chain
}

export const DepositForm: FC<DepositFormProps> = ({
  onSubmit,
  selectedChainAction,
  onSelectChainAction,
  chainActionOptions,
  chain,
}) => {
  const walletCore = useAssertWalletCore()
  const { t } = useTranslation()
  const { data: totalAmountAvailableForChainData } =
    useGetTotalAmountAvailableForChain(chain)
  const [localSelectedCoin, setLocalSelectedCoin] = useState<Coin | null>(null)

  const isTCYAction =
    selectedChainAction === 'stake' || selectedChainAction === 'unstake'

  const selectedCoinBalance = useSelectedCoinBalance({
    action: selectedChainAction,
    selectedCoin: localSelectedCoin,
    chain,
  })

  const totalTokenAmount = localSelectedCoin
    ? selectedCoinBalance
    : (totalAmountAvailableForChainData?.totalTokenAmount ?? 0)

  const chainActionSchema = getChainActionSchema(chain, selectedChainAction, t)
  const fieldsForChainAction = getFieldsForChainAction(
    chain,
    selectedChainAction,
    t
  )
  const [{ coin: coinKey }] = useCoreViewState<'deposit'>()
  const coin = getCoinFromCoinKey(coinKey)

  const schemaForChainAction = resolveSchema(
    chainActionSchema,
    chain,
    walletCore,
    totalTokenAmount
  )

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors, isValid },
  } = useForm<FormData>({
    resolver: schemaForChainAction
      ? zodResolver(schemaForChainAction)
      : undefined,
    mode: 'onSubmit',
  })

  const selectedCoin = getValues('selectedCoin') as Coin | undefined

  const handleFormSubmit = (data: FieldValues) => {
    onSubmit(data, selectedChainAction as ChainAction)
  }

  // @tony: This duplication is needed because we can only derive the selectedCoin from the form data and for the form data, we need to first pass the schema
  useEffect(() => {
    if (selectedCoin) {
      setLocalSelectedCoin(selectedCoin)
    }
  }, [selectedCoin])

  return (
    <DepositFormHandlersProvider
      initialValue={{ setValue, getValues, watch, chain, register }}
    >
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        title={t('deposit')}
        hasBorder
      />
      <PageContent as="form" gap={40} onSubmit={handleSubmit(handleFormSubmit)}>
        <WithProgressIndicator value={0.2}>
          <InputContainer>
            <InputFieldWrapper>
              {t('chain_message_deposit', {
                chain,
              })}
            </InputFieldWrapper>
          </InputContainer>
          <Opener
            renderOpener={({ onOpen }) => (
              <Container onClick={onOpen}>
                <HStack alignItems="center" gap={8}>
                  <Text weight="400" family="mono" size={16}>
                    {t(selectedChainAction)}
                  </Text>
                </HStack>
                <IconWrapper style={{ fontSize: 20 }}>
                  <ChevronRightIcon />
                </IconWrapper>
              </Container>
            )}
            renderContent={({ onClose }) => (
              <DepositActionItemExplorer
                onClose={onClose}
                activeOption={selectedChainAction}
                options={chainActionOptions}
                onOptionClick={option => {
                  onClose()
                  onSelectChainAction(option)
                }}
              />
            )}
          />

          <DepositActionSpecific action={selectedChainAction} />

          {selectedChainAction && fieldsForChainAction.length > 0 && (
            <VStack gap={12}>
              {fieldsForChainAction.map(field => {
                const showBalance =
                  field.name === 'amount' &&
                  [
                    'bond',
                    'ibc_transfer',
                    'switch',
                    'merge',
                    'stake',
                    'unmerge',
                  ].includes(selectedChainAction)

                const balance = selectedCoin
                  ? selectedCoinBalance
                  : isTCYAction
                    ? 0
                    : totalTokenAmount.toFixed(2)

                const ticker =
                  selectedChainAction !== 'ibc_transfer' &&
                  selectedChainAction !== 'merge' &&
                  !isTCYAction
                    ? selectedCoin?.ticker || coin?.ticker
                    : ''

                return (
                  <InputContainer key={field.name}>
                    <Text size={15} weight="400">
                      {field.label}{' '}
                      {showBalance && (
                        <>
                          (
                          {selectedChainAction === 'unmerge' ? (
                            <>
                              {t('shares')}: {balance}
                            </>
                          ) : (
                            <>
                              {t('balance')}: {balance} {ticker && ` ${ticker}`}
                            </>
                          )}
                          )
                        </>
                      )}
                      {field.required ? (
                        <Text as="span" color="danger" size={14}>
                          *
                        </Text>
                      ) : (
                        <Text as="span" size={14}>
                          ({t('chainFunctions.optional_validation')})
                        </Text>
                      )}
                    </Text>

                    <InputFieldWrapper
                      as="input"
                      onWheel={e => e.currentTarget.blur()}
                      type={field.type}
                      step="0.0001"
                      min={0}
                      {...register(field.name)}
                      required={field.required}
                    />

                    {errors[field.name] && (
                      <ErrorText color="danger" size={13} className="error">
                        {t(errors[field.name]?.message as string, {
                          defaultValue: t('chainFunctions.default_validation'),
                        })}
                      </ErrorText>
                    )}
                  </InputContainer>
                )
              })}
            </VStack>
          )}
        </WithProgressIndicator>
        <Button disabled={!isValid} type="submit">
          {t('continue')}
        </Button>
      </PageContent>
    </DepositFormHandlersProvider>
  )
}

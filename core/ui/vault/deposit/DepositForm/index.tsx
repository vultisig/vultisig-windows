import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { DepositActionSpecific } from '@core/ui/vault/deposit/DepositForm/ActionSpecific/DepositActionSpecific'
import { DepositActionItemExplorer } from '@core/ui/vault/deposit/DepositForm/DepositActionItemExplorer'
import {
  Container,
  ErrorText,
  InputFieldWrapper,
} from '@core/ui/vault/deposit/DepositForm/DepositForm.styled'
import { DepositFormHandlersProvider } from '@core/ui/vault/deposit/providers/DepositFormHandlersProvider'
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
import { Text } from '@lib/ui/text'
import { FC } from 'react'
import { FieldValues, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { useAvailableChainActions } from '../hooks/useAvailableChainActions'
import { useDepositBalance } from '../hooks/useDepositBalance'
import { useDepositFormConfig } from '../hooks/useDepositFormConfig'
import { useDepositAction } from '../providers/DepositActionProvider'
import { useDepositCoin } from '../providers/DepositCoinProvider'
import {
  getBalanceDisplayConfig,
  shouldShowBalance,
  shouldShowTicker,
} from '../utils/chainActionConfig'
import { stepFromDecimals } from '../utils/stepFromDecimals'

export type FormData = Record<string, any>
type DepositFormProps = {
  onSubmit: (data: FieldValues) => void
}

export const DepositForm: FC<DepositFormProps> = ({ onSubmit }) => {
  const [selectedChainAction, setSelectedChainAction] = useDepositAction()

  const { t } = useTranslation()
  const [coin] = useDepositCoin()
  const availableActions = useAvailableChainActions(coin.chain)

  const { balance } = useDepositBalance({
    selectedChainAction,
  })

  const { fields, schema } = useDepositFormConfig()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    control,
    formState: { errors, isValid },
  } = useForm<FormData>({
    resolver: zodResolver(schema as any),
    mode: 'onSubmit',
    defaultValues: { autoCompound: false },
  })

  const handleFormSubmit = (data: FieldValues) => {
    onSubmit(data)
  }

  return (
    <DepositFormHandlersProvider
      initialValue={{
        setValue,
        getValues,
        watch,
        chain: coin.chain,
        register,
        control,
      }}
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
                chain: coin.chain,
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
                options={availableActions}
                onOptionClick={option => {
                  onClose()
                  setSelectedChainAction(option)
                }}
              />
            )}
          />

          <DepositActionSpecific value={selectedChainAction} />

          {selectedChainAction && fields.length > 0 && (
            <VStack gap={12}>
              {fields
                .filter(field => !field.hidden)
                .map(field => {
                  const config = getBalanceDisplayConfig({
                    chainAction: selectedChainAction,
                    chain: coin.chain,
                  })
                  const showBalance = shouldShowBalance({
                    fieldName: field.name,
                    chainAction: selectedChainAction,
                  })
                  const showTickerWithBalance = shouldShowTicker({
                    fieldName: field.name,
                    chainAction: selectedChainAction,
                    chain: coin.chain,
                  })

                  return (
                    <InputContainer key={field.name}>
                      <Text size={15} weight="400">
                        {field.label}{' '}
                        {showBalance && (
                          <>
                            (
                            {config.balanceLabel === 'shares' ? (
                              <>
                                {t('shares')}: {balance}
                              </>
                            ) : (
                              <>
                                {t('balance')}: {balance}
                                {showTickerWithBalance &&
                                  coin.ticker &&
                                  ` ${coin.ticker}`}
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
                        step={
                          field.name === 'amount'
                            ? stepFromDecimals(coin.decimals)
                            : undefined
                        }
                        min={0}
                        {...register(field.name)}
                        required={field.required}
                      />

                      {errors[field.name] && (
                        <ErrorText color="danger" size={13} className="error">
                          {t(errors[field.name]?.message as string, {
                            defaultValue: t(
                              'chainFunctions.default_validation'
                            ),
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

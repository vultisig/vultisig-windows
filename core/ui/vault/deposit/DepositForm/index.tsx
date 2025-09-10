import { Chain } from '@core/chain/Chain'
import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { ChainAction } from '@core/ui/vault/deposit/ChainAction'
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

import { useDepositBalance } from '../hooks/useDepositBalance'
import { useDepositFormFieldsAndSchema } from '../hooks/useDepositFormFieldsAndSchema'
import { useDepositAction } from '../providers/DepositActionProvider'
import { useDepositCoin } from '../providers/DepositCoinProvider'

export type FormData = Record<string, any>
type DepositFormProps = {
  onSubmit: (data: FieldValues, selectedChainAction: ChainAction) => void
  chainActionOptions: ChainAction[]
  chain: Chain
}

export const DepositForm: FC<DepositFormProps> = ({
  onSubmit,
  chainActionOptions,
  chain,
}) => {
  const [selectedChainAction, setSelectedChainAction] = useDepositAction()
  const { t } = useTranslation()
  const [coin] = useDepositCoin()

  const { balanceFormatted } = useDepositBalance({
    selectedChainAction,
  })

  const { fields, schema } = useDepositFormFieldsAndSchema()

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
    onSubmit(data, selectedChainAction as ChainAction)
  }

  return (
    <DepositFormHandlersProvider
      initialValue={{ setValue, getValues, watch, chain, register, control }}
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
                  setSelectedChainAction(option)
                }}
              />
            )}
          />

          <DepositActionSpecific value={selectedChainAction} />

          {selectedChainAction && fields.length > 0 && (
            <VStack gap={12}>
              {fields.map(field => {
                const showBalance =
                  field.name === 'amount' &&
                  [
                    'bond',
                    'ibc_transfer',
                    'switch',
                    'merge',
                    'stake',
                    'unmerge',
                    'unstake',
                    'mint',
                    'redeem',
                    'withdraw_ruji_rewards',
                  ].includes(selectedChainAction)

                const ticker =
                  selectedChainAction !== 'ibc_transfer' &&
                  selectedChainAction !== 'merge' &&
                  !(
                    selectedChainAction === 'stake' ||
                    selectedChainAction === 'unstake'
                  ) &&
                  coin.ticker

                return (
                  <InputContainer key={field.name}>
                    <Text size={15} weight="400">
                      {field.label}{' '}
                      {showBalance && (
                        <>
                          (
                          {selectedChainAction === 'unmerge' ? (
                            <>
                              {t('shares')}: {balanceFormatted}
                            </>
                          ) : (
                            <>
                              {t('balance')}: {balanceFormatted}{' '}
                              {ticker && ` ${ticker}`}
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

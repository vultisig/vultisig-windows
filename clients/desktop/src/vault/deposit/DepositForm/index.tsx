import { Chain } from '@core/chain/Chain'
import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
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
import { PageHeaderTitle } from '@lib/ui/page/PageHeaderTitle'
import { Text } from '@lib/ui/text'
import { FC } from 'react'
import { FieldValues, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { useAppPathParams } from '../../../navigation/hooks/useAppPathParams'
import { ChainAction } from '../ChainAction'
import { useGetTotalAmountAvailableForChain } from '../hooks/useGetAmountTotalBalance'
import { useGetMayaChainBondableAssetsQuery } from '../hooks/useGetMayaChainBondableAssetsQuery'
import {
  getChainActionSchema,
  getFieldsForChainAction,
  resolveSchema,
} from '../utils/schema'
import { DepositActionItemExplorer } from './DepositActionItemExplorer'
import {
  AssetRequiredLabel,
  Container,
  ErrorText,
  InputFieldWrapper,
} from './DepositForm.styled'
import { MayaChainAssetExplorer } from './MayaChainAssetExplorer'

type FormData = Record<string, any>
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
  const { data: bondableAssets = [] } = useGetMayaChainBondableAssetsQuery()
  const walletCore = useAssertWalletCore()
  const { t } = useTranslation()
  const { data: totalAmountAvailableForChainData } =
    useGetTotalAmountAvailableForChain(chain)
  const totalTokenAmount =
    totalAmountAvailableForChainData?.totalTokenAmount ?? 0
  const chainActionSchema = getChainActionSchema(chain, selectedChainAction, t)
  const fieldsForChainAction = getFieldsForChainAction(
    chain,
    selectedChainAction,
    t
  )
  const [{ coin: chainCoinString }] = useAppPathParams<'deposit'>()
  const coin = chainCoinString.split(':')[1]

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

  const handleFormSubmit = (data: FieldValues) => {
    onSubmit(data, selectedChainAction as ChainAction)
  }

  const selectedBondableAsset = getValues('bondableAsset')

  return (
    <>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        title={<PageHeaderTitle>{t('deposit')}</PageHeaderTitle>}
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
                    {t(`${selectedChainAction}`)}
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
                onOptionClick={option =>
                  onSelectChainAction(option as ChainAction)
                }
              />
            )}
          />
          {(selectedChainAction === 'bond_with_lp' ||
            selectedChainAction === 'unbond_with_lp') &&
            bondableAssets.length > 0 && (
              <Opener
                renderOpener={({ onOpen }) => (
                  <Container onClick={onOpen}>
                    <HStack alignItems="center" gap={4}>
                      <Text weight="400" family="mono" size={16}>
                        {selectedBondableAsset || t('asset')}
                      </Text>
                      {!selectedBondableAsset && (
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
                  <MayaChainAssetExplorer
                    onClose={onClose}
                    activeOption={watch('bondableAsset')}
                    onOptionClick={selectedAsset => {
                      setValue('bondableAsset', selectedAsset, {
                        shouldValidate: true,
                      })
                      onClose()
                    }}
                    options={bondableAssets}
                  />
                )}
              />
            )}
          {selectedChainAction && fieldsForChainAction.length > 0 && (
            <VStack gap={12}>
              {fieldsForChainAction.map(field => (
                <InputContainer key={field.name}>
                  <Text size={15} weight="400">
                    {field.label}{' '}
                    {field.name === 'amount' &&
                      selectedChainAction === 'bond' &&
                      `(Balance: ${totalTokenAmount.toFixed(2)} ${coin}) `}
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
                    step="0.01"
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
              ))}
            </VStack>
          )}
        </WithProgressIndicator>
        <Button type="submit" isDisabled={!isValid}>
          {t('continue')}
        </Button>
      </PageContent>
    </>
  )
}

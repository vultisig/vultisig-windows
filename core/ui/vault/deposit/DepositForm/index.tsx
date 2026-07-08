import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { useCoreViewState } from '@core/ui/navigation/hooks/useCoreViewState'
import { ActionForm } from '@core/ui/vault/components/action-form/ActionForm'
import { BondForm } from '@core/ui/vault/deposit/DepositForm/ActionSpecific/BondSpecific/BondForm'
import { CosmosStakingFooterButton } from '@core/ui/vault/deposit/DepositForm/ActionSpecific/CosmosStakingSpecific/CosmosStakingFooterButton'
import { DepositActionSpecific } from '@core/ui/vault/deposit/DepositForm/ActionSpecific/DepositActionSpecific'
import { SolanaStakingFooterButton } from '@core/ui/vault/deposit/DepositForm/ActionSpecific/SolanaStakingSpecific/SolanaStakingFooterButton'
import { StakeForm } from '@core/ui/vault/deposit/DepositForm/ActionSpecific/StakeSpecific/StakeForm'
import { UnbondForm } from '@core/ui/vault/deposit/DepositForm/ActionSpecific/UnbondSpecific/UnbondForm'
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
import { PageFooter } from '@lib/ui/page/PageFooter'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { Text } from '@lib/ui/text'
import { TronResourceType } from '@vultisig/core-chain/chains/tron/resources'
import { isOneOf } from '@vultisig/lib-utils/array/isOneOf'
import { ChangeEvent, FC, useEffect, useRef, useState } from 'react'
import { FieldValues, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { TextInputWithPasteAction } from '../../../components/TextInputWithPasteAction'
import { cosmosStakingActions, solanaStakingActions } from '../ChainAction'
import { useAvailableChainActions } from '../hooks/useAvailableChainActions'
import { useDepositBalance } from '../hooks/useDepositBalance'
import { useDepositFormConfig } from '../hooks/useDepositFormConfig'
import { useDepositAction } from '../providers/DepositActionProvider'
import { useDepositCoin } from '../providers/DepositCoinProvider'
import { DepositDataProvider } from '../state/data'
import {
  getBalanceDisplayConfig,
  shouldShowBalance,
  shouldShowTicker,
} from '../utils/chainActionConfig'
import { stepFromDecimals } from '../utils/stepFromDecimals'
import { FormData } from './types'

type DepositFormProps = {
  onSubmit: (data: FieldValues) => void
}

export const DepositForm: FC<DepositFormProps> = ({ onSubmit }) => {
  const [selectedChainAction, setSelectedChainAction] = useDepositAction()
  const [{ form: formDefaults, entryPoint }] = useCoreViewState<'deposit'>()

  const { t } = useTranslation()
  const [coin] = useDepositCoin()
  const availableActions = useAvailableChainActions(coin.chain)

  const [tronResourceType, setTronResourceType] =
    useState<TronResourceType>('BANDWIDTH')

  // Tracks the last accepted text per number-typed field so we can revert the
  // DOM when the user types/pastes something that does not match a single-dot
  // decimal (e.g. `0-2`, `0.0.0.01`). Uncontrolled `register()` inputs offer
  // no other way to undo an invalid keystroke without re-rendering the form.
  const lastValidNumberInputs = useRef<Record<string, string>>({})

  const { balance } = useDepositBalance({
    selectedChainAction,
    tronResourceType,
  })

  const { fields, schema } = useDepositFormConfig(tronResourceType)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    control,
    trigger,
    formState: { errors, isValid, touchedFields, dirtyFields },
  } = useForm<FormData>({
    resolver: zodResolver(schema as any),
    mode: 'onChange',
    defaultValues: {
      autoCompound: false,
      ...(selectedChainAction === 'redeem' ? { slippage: 1 } : {}),
      ...(formDefaults ?? {}),
    },
  })

  // Re-validate when the selected coin or its balance changes — the resolver
  // schema rebuilds with the new max, but react-hook-form only re-runs
  // validation on field changes, so switching coins would otherwise leave
  // a stale "valid" amount that exceeds the new balance.
  useEffect(() => {
    trigger()
  }, [coin.id, balance, trigger])

  const handleFormSubmit = (data: FieldValues) => {
    onSubmit(data)
  }

  const isBondAction = selectedChainAction === 'bond'
  const isUnbondAction = selectedChainAction === 'unbond'
  const isStakeAction = selectedChainAction === 'stake'
  const isUnstakeAction = selectedChainAction === 'unstake'
  const isMintAction = selectedChainAction === 'mint'
  const isRedeemAction = selectedChainAction === 'redeem'
  const isCosmosStakingAction = isOneOf(
    selectedChainAction,
    cosmosStakingActions
  )
  const isSolanaStakingAction = isOneOf(
    selectedChainAction,
    solanaStakingActions
  )
  const formValues = watch()
  const shouldUseBondRedesign = isBondAction && entryPoint === 'defi'
  const shouldUseUnbondRedesign = isUnbondAction && entryPoint === 'defi'
  const shouldUseStakeRedesign =
    (isStakeAction || isUnstakeAction || isMintAction || isRedeemAction) &&
    entryPoint === 'defi'
  // Cosmos staking actions ALWAYS use the redesigned form — entering via
  // the Wallet "Function" picker (entryPoint !== 'defi') would otherwise
  // fall back to the legacy renderer and double-render fields alongside
  // `DepositActionSpecific`. The form shape (amount + pills + validator
  // picker) is the same regardless of where the user came from.
  const shouldUseCosmosStakingRedesign = isCosmosStakingAction
  // Solana native staking actions always use their bespoke read-only screens.
  const shouldUseSolanaStakingRedesign = isSolanaStakingAction
  const shouldUseActionForm =
    shouldUseBondRedesign ||
    shouldUseUnbondRedesign ||
    shouldUseStakeRedesign ||
    shouldUseCosmosStakingRedesign ||
    shouldUseSolanaStakingRedesign

  // Cosmos staking actions display under "Stake / Unstake / Move / Claim"
  // in the page header, matching Figma — the underlying ChainAction values
  // (delegate / undelegate / redelegate / claim_rewards) stay protocol-correct.
  const defiActionPageTitle: Record<string, string> = {
    bond: t('bond'),
    unbond: t('unbond'),
    stake: t('stake'),
    unstake: t('unstake'),
    mint: t('mint'),
    redeem: t('redeem'),
    delegate: t('stake'),
    undelegate: t('unstake'),
    redelegate: t('move'),
    claim_rewards: t('claim_rewards'),
    solana_delegate: t('stake'),
    solana_unstake: t('unstake'),
    solana_withdraw: t('solana_withdraw'),
    solana_move_stake: t('solana_move_stake'),
    solana_finish_move: t('solana_finish_move'),
  }

  const getPageTitle = () => {
    // Cosmos staking actions get a typed title regardless of entry point
    // (Wallet's Function picker hits this path too) — falling back to
    // "Deposit" would mislabel a clearly-staking screen.
    if (isCosmosStakingAction || isSolanaStakingAction) {
      const label = defiActionPageTitle[selectedChainAction]
      if (label) return `${label} ${coin.ticker ?? ''}`.trim()
    }

    const defiLabel =
      entryPoint === 'defi'
        ? defiActionPageTitle[selectedChainAction]
        : undefined

    if (defiLabel) {
      return `${defiLabel} ${coin.ticker ?? ''}`.trim()
    }

    return t('deposit')
  }

  const pageTitle = getPageTitle()

  return (
    <DepositFormHandlersProvider
      initialValue={{
        setValue,
        getValues,
        watch,
        chain: coin.chain,
        register,
        control,
        tronResourceType,
        setTronResourceType,
      }}
    >
      <VStack as="form" fullHeight onSubmit={handleSubmit(handleFormSubmit)}>
        <PageHeader
          primaryControls={<PageHeaderBackButton />}
          title={pageTitle}
          hasBorder
        />
        {shouldUseActionForm ? (
          <ActionForm flexGrow scrollable>
            {shouldUseBondRedesign ? (
              <DepositDataProvider value={formValues}>
                <BondForm
                  balance={balance}
                  errors={errors}
                  formValues={formValues}
                />
              </DepositDataProvider>
            ) : shouldUseUnbondRedesign ? (
              <DepositDataProvider value={formValues}>
                <UnbondForm
                  balance={balance}
                  errors={errors}
                  isValid={isValid}
                  formValues={formValues}
                />
              </DepositDataProvider>
            ) : shouldUseCosmosStakingRedesign ||
              shouldUseSolanaStakingRedesign ? (
              <DepositDataProvider value={formValues}>
                <DepositActionSpecific value={selectedChainAction} />
              </DepositDataProvider>
            ) : (
              <DepositDataProvider value={formValues}>
                <StakeForm
                  balance={balance}
                  errors={errors}
                  formValues={formValues}
                  isUnstake={isUnstakeAction || isRedeemAction}
                />
              </DepositDataProvider>
            )}
          </ActionForm>
        ) : (
          <PageContent flexGrow scrollable>
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

                          {(() => {
                            const fieldRegister = register(field.name)
                            const isNumberField = field.type === 'number'
                            const handleNumberChange = (
                              e: ChangeEvent<HTMLInputElement>
                            ) => {
                              // Strip only a leading `-` (matches the Send
                              // page's lenient negative-stripping for
                              // positive-only fields). Embedded `-` (e.g.
                              // `0-2`, `5-`, `--5`) falls through to the
                              // regex below and is rejected — silently
                              // collapsing `0-2` into `02` would change user
                              // intent.
                              const rawValue = e.target.value
                              let value = rawValue.startsWith('-')
                                ? rawValue.slice(1)
                                : rawValue
                              if (value.startsWith('.')) {
                                value = `0${value}`
                              }
                              if (value !== '' && !/^\d*\.?\d*$/.test(value)) {
                                // Prefer the current form value over the
                                // cached last-valid input. A programmatic
                                // `setValue()` from elsewhere keeps the form
                                // state fresh but leaves `lastValidNumberInputs`
                                // stale, and the cache also covers the case
                                // where the user has not typed yet so a
                                // prefilled default survives the first
                                // invalid keystroke/paste.
                                e.target.value = String(
                                  getValues(field.name) ??
                                    lastValidNumberInputs.current[field.name] ??
                                    ''
                                )
                                return
                              }
                              lastValidNumberInputs.current[field.name] = value
                              e.target.value = value
                              fieldRegister.onChange(e)
                            }

                            return (
                              <TextInputWithPasteAction
                                onWheel={e => e.currentTarget.blur()}
                                // Number fields use `type="text"` + decimal
                                // inputMode so onChange fires on every key
                                // (the native `type="number"` swallows
                                // intermediate invalid characters like `-`
                                // before our sanitizer sees them).
                                type={isNumberField ? 'text' : field.type}
                                inputMode={
                                  isNumberField ? 'decimal' : undefined
                                }
                                step={
                                  field.name === 'amount'
                                    ? stepFromDecimals(coin.decimals)
                                    : undefined
                                }
                                min={0}
                                {...fieldRegister}
                                onChange={
                                  isNumberField
                                    ? handleNumberChange
                                    : fieldRegister.onChange
                                }
                                required={field.required}
                              />
                            )
                          })()}

                          {(touchedFields[field.name] ||
                            dirtyFields[field.name]) &&
                            errors[field.name] && (
                              <ErrorText
                                color="danger"
                                size={13}
                                className="error"
                              >
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
          </PageContent>
        )}
        {/*
         * Delegate and Redelegate use a tri-state footer button (Enter
         * Amount → Select Validator → Continue) rendered at the page
         * footer so it stays pinned to the screen bottom outside the
         * scrollable action area. Other actions keep the default Continue.
         */}
        {selectedChainAction === 'delegate' ||
        selectedChainAction === 'redelegate' ? (
          <PageFooter>
            <CosmosStakingFooterButton action={selectedChainAction} />
          </PageFooter>
        ) : selectedChainAction === 'solana_delegate' ? (
          // Solana delegate uses the tri-state CTA (amount → validator →
          // continue). The account-scoped solana ops keep the default Continue.
          <PageFooter>
            <SolanaStakingFooterButton />
          </PageFooter>
        ) : (
          <PageFooter>
            <Button disabled={!isValid} type="submit">
              {t('continue')}
            </Button>
          </PageFooter>
        )}
      </VStack>
    </DepositFormHandlersProvider>
  )
}

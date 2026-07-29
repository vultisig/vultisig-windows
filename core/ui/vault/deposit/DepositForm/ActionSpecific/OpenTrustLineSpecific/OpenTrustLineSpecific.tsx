import { TextInputWithPasteAction } from '@core/ui/components/TextInputWithPasteAction'
import { useCoreViewState } from '@core/ui/navigation/hooks/useCoreViewState'
import { InputContainer } from '@lib/ui/inputs/InputContainer'
import { RadioInput } from '@lib/ui/inputs/RadioInput'
import { VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import {
  parseRippleTokenId,
  rippleKnownIssuedTokens,
  toXrplCurrencyCode,
} from '@vultisig/core-chain/chains/ripple/issuedCurrency'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'
import { attempt } from '@vultisig/lib-utils/attempt'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useDepositFormHandlers } from '../../../providers/DepositFormHandlersProvider'
import { TrustLineAffordabilityWarning } from './TrustLineAffordabilityWarning'
import { TrustLineReserveWarning } from './TrustLineReserveWarning'

const customOption = 'custom'
type TokenSelection = string

/**
 * Which radio option a prefilled issuer/currency pair corresponds to, so a token
 * handed in from the asset list (its trust line missing) lands on this form with
 * its own entry already picked instead of an empty picker.
 */
const asNonEmptyString = (value: unknown): string | undefined =>
  typeof value === 'string' && value ? value : undefined

const selectionFor = ({
  issuer,
  currency,
}: {
  issuer?: string
  currency?: string
}): TokenSelection | null => {
  if (!issuer || !currency) {
    return null
  }

  const known = rippleKnownIssuedTokens.find(token => {
    const match = attempt(() => {
      const parsed = parseRippleTokenId(shouldBePresent(token.id))

      return (
        parsed.issuer === issuer &&
        toXrplCurrencyCode(parsed.currency) === toXrplCurrencyCode(currency)
      )
    })

    return 'data' in match && match.data
  })

  return known ? known.ticker : customOption
}

export const OpenTrustLineSpecific = () => {
  const { t } = useTranslation()
  const [{ setValue, register }] = useDepositFormHandlers()
  const [{ form: formDefaults }] = useCoreViewState<'deposit'>()
  const [selection, setSelection] = useState<TokenSelection | null>(() =>
    selectionFor({
      issuer: asNonEmptyString(formDefaults?.issuer),
      currency: asNonEmptyString(formDefaults?.currency),
    })
  )

  const options: TokenSelection[] = [
    ...rippleKnownIssuedTokens.map(token => token.ticker),
    customOption,
  ]

  const isCustom = selection === customOption

  const handleSelect = (value: TokenSelection) => {
    setSelection(value)

    if (value === customOption) {
      setValue('issuer', '', { shouldValidate: true })
      setValue('currency', '', { shouldValidate: true })
      setValue('logo', undefined)
      return
    }

    const token = rippleKnownIssuedTokens.find(item => item.ticker === value)
    if (token) {
      const { issuer } = parseRippleTokenId(shouldBePresent(token.id))
      setValue('issuer', issuer, { shouldValidate: true })
      setValue('currency', token.ticker, { shouldValidate: true })
      setValue('logo', token.logo)
    }
  }

  return (
    <VStack gap={16}>
      <RadioInput
        value={selection}
        onChange={handleSelect}
        options={options}
        renderOption={option =>
          option === customOption ? t('trust_line_custom_token') : option
        }
      />

      {isCustom ? (
        <VStack gap={12}>
          <InputContainer>
            <Text size={15} weight="400">
              {t('trust_line_issuer')}
            </Text>
            <TextInputWithPasteAction
              placeholder={t('trust_line_issuer_placeholder')}
              {...register('issuer')}
            />
          </InputContainer>
          <InputContainer>
            <Text size={15} weight="400">
              {t('trust_line_currency')}
            </Text>
            <TextInputWithPasteAction
              placeholder={t('trust_line_currency_placeholder')}
              {...register('currency')}
            />
          </InputContainer>
        </VStack>
      ) : null}

      <TrustLineReserveWarning />
      <TrustLineAffordabilityWarning />
    </VStack>
  )
}

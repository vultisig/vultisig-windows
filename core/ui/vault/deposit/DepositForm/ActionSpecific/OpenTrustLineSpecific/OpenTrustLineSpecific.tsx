import { TextInputWithPasteAction } from '@core/ui/components/TextInputWithPasteAction'
import { InputContainer } from '@lib/ui/inputs/InputContainer'
import { RadioInput } from '@lib/ui/inputs/RadioInput'
import { VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import {
  parseRippleTokenId,
  rippleKnownIssuedTokens,
} from '@vultisig/core-chain/chains/ripple/issuedCurrency'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useDepositFormHandlers } from '../../../providers/DepositFormHandlersProvider'
import { TrustLineReserveWarning } from './TrustLineReserveWarning'

const customOption = 'custom'
type TokenSelection = string

export const OpenTrustLineSpecific = () => {
  const { t } = useTranslation()
  const [{ setValue, register }] = useDepositFormHandlers()
  const [selection, setSelection] = useState<TokenSelection | null>(null)

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
    </VStack>
  )
}

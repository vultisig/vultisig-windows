import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import { useVaults } from '@core/ui/storage/vaults'
import { Button } from '@lib/ui/buttons/Button'
import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { getFormProps } from '@lib/ui/form/utils/getFormProps'
import { TextArea } from '@lib/ui/inputs/TextArea'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { seedphraseWordCounts } from './config'
import { EnterSeedphraseHeader } from './EnterSeedphraseHeader'
import { useMnemonic } from './state/mnemonic'
import { useImportSeedphraseStep } from './state/step'
import { checkDuplicateMnemonicVault } from './utils/checkDuplicateMnemonicVault'
import { cleanMnemonic, validateMnemonic } from './utils/validateMnemonic'

export const EnterSeedphraseStep = () => {
  const { t } = useTranslation()
  const [mnemonic, setMnemonic] = useMnemonic()
  const [, setStep] = useImportSeedphraseStep()
  const walletCore = useAssertWalletCore()
  const vaults = useVaults()
  const [validationSkipped, setValidationSkipped] = useState(false)

  const cleanedMnemonic = cleanMnemonic(mnemonic)
  const validation = validateMnemonic({
    mnemonic: cleanedMnemonic,
    walletCore,
    t,
  })

  const basicError =
    validation.isSkippable && validationSkipped ? null : validation.error

  const duplicateVault = useMemo(() => {
    if (validation.error) return null
    return checkDuplicateMnemonicVault({
      mnemonic: cleanedMnemonic,
      existingVaults: vaults,
      walletCore,
    })
  }, [cleanedMnemonic, validation.error, vaults, walletCore])

  const duplicateError = duplicateVault
    ? t('seedphrase_duplicate_vault_error', { vaultName: duplicateVault.name })
    : null

  const error = basicError || duplicateError
  const isValid = cleanedMnemonic !== '' && !error

  const words = cleanedMnemonic.split(' ')
  const wordsCount = cleanedMnemonic === '' ? 0 : words.length
  const [minWordCount, maxWordCount] = seedphraseWordCounts
  const maxWords = wordsCount > minWordCount ? maxWordCount : minWordCount
  const accessory = `${wordsCount}/${maxWords}`

  return (
    <VStack
      as="form"
      gap={32}
      flexGrow
      {...getFormProps({
        onSubmit: () => {
          setMnemonic(cleanedMnemonic)
          setStep(validationSkipped ? 'chains' : 'scan')
        },
        isDisabled: !isValid,
      })}
    >
      <EnterSeedphraseHeader />

      <VStack gap={8}>
        <TextArea
          autoFocus
          value={mnemonic}
          onValueChange={value => {
            setMnemonic(value)
            setValidationSkipped(false)
          }}
          accessory={accessory}
          validation={isValid ? 'valid' : error ? 'invalid' : undefined}
          placeholder={t('mnemonic_placeholder')}
        />

        {error && (
          <HStack alignItems="center" gap={8}>
            <Text size={13} color="danger">
              {error}
            </Text>
            {validation.isSkippable && !validationSkipped && (
              <SkipButton
                onClick={() => setValidationSkipped(true)}
                type="button"
              >
                {t('seedphrase_skip_validation')}
              </SkipButton>
            )}
          </HStack>
        )}
      </VStack>

      <VStack flexGrow justifyContent="flex-end" fullWidth>
        <Button type="submit" disabled={!isValid}>
          {t('import')}
        </Button>
      </VStack>
    </VStack>
  )
}

const SkipButton = styled(UnstyledButton)`
  color: ${getColor('primary')};
  font-size: 13px;
  white-space: nowrap;
  text-decoration: underline;

  &:hover {
    opacity: 0.8;
  }
`

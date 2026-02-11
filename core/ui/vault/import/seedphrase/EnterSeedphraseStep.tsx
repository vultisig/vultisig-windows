import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import { useVaults } from '@core/ui/storage/vaults'
import { Button } from '@lib/ui/buttons/Button'
import { getFormProps } from '@lib/ui/form/utils/getFormProps'
import { TextArea } from '@lib/ui/inputs/TextArea'
import { VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

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

  const [isTouched, setIsTouched] = useState(false)

  const cleanedMnemonic = cleanMnemonic(mnemonic)
  const basicError = validateMnemonic({
    mnemonic: cleanedMnemonic,
    walletCore,
    t,
  })

  const duplicateVault = useMemo(() => {
    if (basicError) return null
    return checkDuplicateMnemonicVault({
      mnemonic: cleanedMnemonic,
      existingVaults: vaults,
      walletCore,
    })
  }, [cleanedMnemonic, basicError, vaults, walletCore])

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
          setStep('scan')
        },
        isDisabled: !isValid,
      })}
    >
      <EnterSeedphraseHeader />

      <VStack gap={8}>
        <TextArea
          autoFocus
          value={mnemonic}
          onValueChange={setMnemonic}
          onBlur={() => setIsTouched(true)}
          accessory={accessory}
          validation={
            isValid ? 'valid' : isTouched && error ? 'invalid' : undefined
          }
          placeholder={t('mnemonic_placeholder')}
        />

        {isTouched && error && (
          <Text size={13} color="danger">
            {error}
          </Text>
        )}
      </VStack>

      <VStack flexGrow justifyContent="flex-end" fullWidth>
        <Button type="submit" disabled={error || undefined}>
          {t('import')}
        </Button>
      </VStack>
    </VStack>
  )
}

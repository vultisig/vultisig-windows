import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import { useVaults } from '@core/ui/storage/vaults'
import { Button } from '@lib/ui/buttons/Button'
import { getFormProps } from '@lib/ui/form/utils/getFormProps'
import { TextArea } from '@lib/ui/inputs/TextArea'
import { VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { EnterSeedphraseHeader } from './EnterSeedphraseHeader'
import { useMnemonic } from './state/mnemonic'
import { useImportSeedphraseStep } from './state/step'
import { checkDuplicateMnemonicVault } from './utils/checkDuplicateMnemonicVault'
import { getSeedphraseTargetWordCount } from './utils/getSeedphraseTargetWordCount'
import { cleanMnemonic, validateMnemonic } from './utils/validateMnemonic'

/**
 * Step where the user enters the seedphrase to import. Import stays disabled
 * until the phrase is a valid mnemonic of a supported length that no existing
 * vault already holds.
 */
export const EnterSeedphraseStep = () => {
  const { t } = useTranslation()
  const [mnemonic, setMnemonic] = useMnemonic()
  const [, setStep] = useImportSeedphraseStep()
  const walletCore = useAssertWalletCore()
  const vaults = useVaults()

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
  const accessory = `${wordsCount}/${getSeedphraseTargetWordCount(wordsCount)}`

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
          accessory={accessory}
          validation={isValid ? 'valid' : error ? 'invalid' : undefined}
          placeholder={t('mnemonic_placeholder')}
        />

        {error && (
          <Text size={13} color="danger">
            {error}
          </Text>
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

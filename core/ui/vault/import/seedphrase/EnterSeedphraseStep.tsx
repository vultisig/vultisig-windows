import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import { Button } from '@lib/ui/buttons/Button'
import { GlowIcon } from '@lib/ui/icons/GlowIcon'
import { SeedphraseIcon } from '@lib/ui/icons/SeedphraseIcon'
import { VStack } from '@lib/ui/layout/Stack'
import { OnFinishProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { useEffect, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'

import { SeedphraseTextArea } from './components/SeedphraseTextArea'
import { useMnemonic } from './state/mnemonic'

const cleanMnemonic = (text: string) =>
  text.split(/\s+/).filter(Boolean).join(' ')

export const EnterSeedphraseStep = ({ onFinish }: OnFinishProp) => {
  const { t } = useTranslation()
  const [mnemonic, setMnemonic] = useMnemonic()
  const walletCore = useAssertWalletCore()

  const [validMnemonic, setValidMnemonic] = useState<boolean | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | undefined>()

  const words = cleanMnemonic(mnemonic).split(' ')
  const wordsCount = mnemonic.trim() === '' ? 0 : words.length
  const maxWords = wordsCount > 12 ? 24 : 12
  const wordCountAccessory = `${wordsCount}/${maxWords}`

  useEffect(() => {
    const cleaned = cleanMnemonic(mnemonic)

    if (cleaned === '') {
      setValidMnemonic(null)
      setErrorMessage(undefined)
      return
    }

    const words = cleaned.split(' ')
    const count = words.length

    setValidMnemonic(false)
    setErrorMessage(undefined)

    const timeoutId = setTimeout(() => {
      if (![12, 24].includes(count)) {
        setErrorMessage(t('seedphrase_word_count_error', { count }))
        return
      }

      if (!walletCore.Mnemonic.isValid(cleaned)) {
        setErrorMessage(t('seedphrase_invalid_error'))
        return
      }

      setValidMnemonic(true)
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [mnemonic, t, walletCore])

  return (
    <VStack gap={32} alignItems="center" flexGrow>
      <VStack gap={24} alignItems="center">
        <GlowIcon icon={<SeedphraseIcon />} />
        <VStack gap={8} alignItems="center">
          <Text size={22} weight={500} color="contrast">
            {t('enter_your_seedphrase')}
          </Text>
          <Text
            size={14}
            weight={500}
            color="shy"
            centerHorizontally
            style={{ maxWidth: 300 }}
          >
            <Trans
              i18nKey="enter_seedphrase_subtitle"
              components={{ h: <Text color="contrast" as="span" /> }}
            />
          </Text>
        </VStack>
      </VStack>

      {validMnemonic === true ? (
        <SeedphraseTextArea
          value={mnemonic}
          onChange={setMnemonic}
          wordCount={wordCountAccessory}
          isValid
        />
      ) : validMnemonic === false && errorMessage ? (
        <SeedphraseTextArea
          value={mnemonic}
          onChange={setMnemonic}
          wordCount={wordCountAccessory}
          error={errorMessage}
        />
      ) : (
        <SeedphraseTextArea
          value={mnemonic}
          onChange={setMnemonic}
          wordCount={wordCountAccessory}
        />
      )}

      <VStack flexGrow justifyContent="flex-end" fullWidth>
        <Button onClick={onFinish} disabled={!validMnemonic}>
          {t('import')}
        </Button>
      </VStack>
    </VStack>
  )
}

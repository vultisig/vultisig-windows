import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import { Button } from '@lib/ui/buttons/Button'
import { TextArea } from '@lib/ui/inputs/TextArea'
import { VStack } from '@lib/ui/layout/Stack'
import { OnFinishProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { seedphraseWordCounts } from './config'
import { EnterSeedphraseHeader } from './EnterSeedphraseHeader'
import { useMnemonic } from './state/mnemonic'
import { cleanMnemonic, validateMnemonic } from './validateMnemonic'

export const EnterSeedphraseStep = ({ onFinish }: OnFinishProp) => {
  const { t } = useTranslation()
  const [mnemonic, setMnemonic] = useMnemonic()
  const walletCore = useAssertWalletCore()

  const [isTouched, setIsTouched] = useState(false)

  const error = validateMnemonic({ mnemonic, walletCore, t })
  const isValid = mnemonic.trim() !== '' && !error

  const words = cleanMnemonic(mnemonic).split(' ')
  const wordsCount = mnemonic.trim() === '' ? 0 : words.length
  const [minWordCount, maxWordCount] = seedphraseWordCounts
  const maxWords = wordsCount > minWordCount ? maxWordCount : minWordCount
  const accessory = `${wordsCount}/${maxWords}`

  return (
    <VStack gap={32} flexGrow>
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
        <Button onClick={onFinish} disabled={!isValid}>
          {t('import')}
        </Button>
      </VStack>
    </VStack>
  )
}

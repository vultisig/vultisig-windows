import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import { Button } from '@lib/ui/buttons/Button'
import { GlowIcon } from '@lib/ui/icons/GlowIcon'
import { SeedphraseIcon } from '@lib/ui/icons/SeedphraseIcon'
import { TextArea } from '@lib/ui/inputs/TextArea'
import { VStack } from '@lib/ui/layout/Stack'
import { OnFinishProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'

import { seedphraseWordCounts } from './config'
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

      <VStack gap={8}>
        <TextArea
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

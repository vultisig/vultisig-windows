import { Button } from '@lib/ui/buttons/Button'
import { VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

import { useImportSeedphraseStep } from '../state/step'
import { ScanResultHeader } from './ScanResultHeader'

export const NoChainsFoundContent = () => {
  const { t } = useTranslation()
  const [, setStep] = useImportSeedphraseStep()

  return (
    <VStack alignItems="center" justifyContent="center" gap={32} flexGrow>
      <VStack alignItems="center" gap={24}>
        <ScanResultHeader
          kind="negative"
          title={t('no_active_chains_found')}
          description={t('no_active_chains_found_description')}
        />
        <Text centerHorizontally color="supporting" size={13}>
          {t('active_chains_warning')}
        </Text>
      </VStack>
      <Button onClick={() => setStep('chains')}>{t('next')}</Button>
    </VStack>
  )
}

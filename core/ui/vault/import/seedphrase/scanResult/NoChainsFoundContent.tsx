import { Button } from '@lib/ui/buttons/Button'
import { VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

import { useImportSeedphraseStep } from '../state/step'
import { useUnscannedChains } from '../state/unscannedChains'
import { ScanResultHeader } from './ScanResultHeader'
import { UnscannedChainsWarning } from './UnscannedChainsWarning'

/**
 * Scan result when no chain has a balance. When some chains could not be
 * checked, it says so instead of claiming the seed phrase is empty.
 */
export const NoChainsFoundContent = () => {
  const { t } = useTranslation()
  const [, setStep] = useImportSeedphraseStep()
  const [unscannedChains] = useUnscannedChains()

  return (
    <VStack alignItems="center" justifyContent="center" gap={32} flexGrow>
      <VStack alignItems="center" gap={24}>
        <ScanResultHeader
          kind="negative"
          title={t('no_active_chains_found')}
          description={t(
            unscannedChains.length === 0
              ? 'no_active_chains_found_description'
              : 'no_active_chains_found_partial_description'
          )}
        />
        <Text centerHorizontally color="supporting" size={13}>
          {t('active_chains_warning')}
        </Text>
        <UnscannedChainsWarning />
      </VStack>
      <Button onClick={() => setStep('chains')}>{t('next')}</Button>
    </VStack>
  )
}

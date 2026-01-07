import { Button } from '@lib/ui/buttons/Button'
import { SparkledPenIcon } from '@lib/ui/icons/SparkledPenIcon'
import { VStack } from '@lib/ui/layout/Stack'
import { useTranslation } from 'react-i18next'

import { useSelectedChains } from '../state/selectedChains'
import { useImportSeedphraseStep } from '../state/step'
import { useFinishSeedphraseImport } from '../utils/useFinishSeedphraseImport'
import { ScanResultChainItem } from './ScanResultChainItem'
import { ScanResultHeader } from './ScanResultHeader'

export const ActiveChainsFoundContent = () => {
  const { t } = useTranslation()
  const [selectedChains] = useSelectedChains()
  const [, setStep] = useImportSeedphraseStep()
  const handleFinish = useFinishSeedphraseImport()

  return (
    <VStack alignItems="center" gap={32} flexGrow>
      <ScanResultHeader
        kind="positive"
        title={t('active_chains_found', { count: selectedChains.length })}
        description={t('active_chains_warning')}
      />

      <VStack fullWidth gap={12}>
        {selectedChains.map(chain => (
          <ScanResultChainItem key={chain} value={chain} />
        ))}
      </VStack>

      <VStack fullWidth gap={20} style={{ marginTop: 'auto' }}>
        <Button onClick={handleFinish}>{t('next')}</Button>
        <Button
          kind="link"
          status="success"
          onClick={() => setStep('chains')}
          icon={<SparkledPenIcon />}
        >
          {t('customize_chains')}
        </Button>
      </VStack>
    </VStack>
  )
}

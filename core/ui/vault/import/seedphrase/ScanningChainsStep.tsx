import { Button } from '@lib/ui/buttons/Button'
import { VStack } from '@lib/ui/layout/Stack'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { PageContent } from '@lib/ui/page/PageContent'
import { Text } from '@lib/ui/text'
import { useEffect } from 'react'
import { Trans, useTranslation } from 'react-i18next'

import { useScanChainsWithBalanceQuery } from './queries/useScanChainsWithBalanceQuery'
import { useSelectedChains } from './state/selectedChains'
import { useImportSeedphraseStep } from './state/step'

export const ScanningChainsStep = () => {
  const { t } = useTranslation()
  const [, setSelectedChains] = useSelectedChains()
  const [, setStep] = useImportSeedphraseStep()

  const { data: chainsWithBalance } = useScanChainsWithBalanceQuery()

  useEffect(() => {
    if (chainsWithBalance) {
      setSelectedChains(chainsWithBalance)
      setStep('scanResult')
    }
  }, [chainsWithBalance, setSelectedChains, setStep])

  const handleSelectManually = () => {
    setSelectedChains([])
    setStep('chains')
  }

  return (
    <PageContent alignItems="center" justifyContent="center" gap={24} flexGrow>
      <Spinner size={24} />
      <VStack alignItems="center" gap={12}>
        <Text centerHorizontally color="contrast" size={22} weight={600}>
          {t('scanning_for_chains')}
        </Text>
        <Text centerHorizontally color="supporting" size={14}>
          <Trans
            i18nKey="scanning_for_chains_subtitle"
            components={{
              highlight: <Text as="span" color="regular" />,
            }}
          />
        </Text>
      </VStack>
      <VStack style={{ marginTop: 'auto' }} fullWidth>
        <Button kind="outlined" onClick={handleSelectManually}>
          {t('select_chains_manually')}
        </Button>
      </VStack>
    </PageContent>
  )
}

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
import { useUnscannedChains } from './state/unscannedChains'
import { useUsePhantomSolanaPath } from './state/usePhantomSolanaPath'

/**
 * Runs the balance scan and hands its suggested and unchecked chains to the
 * scan result step. Shows a failure only when no balance could be read.
 */
export const ScanningChainsStep = () => {
  const { t } = useTranslation()
  const [, setSelectedChains] = useSelectedChains()
  const [, setStep] = useImportSeedphraseStep()
  const [, setUsePhantomSolanaPath] = useUsePhantomSolanaPath()
  const [, setUnscannedChains] = useUnscannedChains()

  const { data, errors, isPending } = useScanChainsWithBalanceQuery()
  const hasFailed = !isPending && errors.length > 0 && !data

  useEffect(() => {
    if (data) {
      const { chains, unscannedChains, usePhantomSolanaPath } = data
      setSelectedChains(chains)
      setUnscannedChains(unscannedChains)
      setUsePhantomSolanaPath(usePhantomSolanaPath)
      setStep('scanResult')
    }
  }, [
    data,
    setSelectedChains,
    setStep,
    setUnscannedChains,
    setUsePhantomSolanaPath,
  ])

  const handleSelectManually = () => {
    setSelectedChains([])
    setStep('chains')
  }

  return (
    <PageContent alignItems="center" justifyContent="center" gap={24} flexGrow>
      {hasFailed ? (
        <Text centerHorizontally color="danger" size={22} weight={600}>
          {t('failed_to_load')}
        </Text>
      ) : (
        <>
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
        </>
      )}
      <VStack style={{ marginTop: 'auto' }} fullWidth>
        <Button kind="outlined" onClick={handleSelectManually}>
          {t('select_chains_manually')}
        </Button>
      </VStack>
    </PageContent>
  )
}

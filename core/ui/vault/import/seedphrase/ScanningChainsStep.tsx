import { Button } from '@lib/ui/buttons/Button'
import { VStack } from '@lib/ui/layout/Stack'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { PageContent } from '@lib/ui/page/PageContent'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useScanChainsWithBalanceMutation } from './mutations/useScanChainsWithBalanceMutation'
import { useSelectedChains } from './state/selectedChains'
import { useImportSeedphraseStep } from './state/step'

const HighlightedText = styled.span`
  color: ${getColor('contrast')};
`

export const ScanningChainsStep = () => {
  const { t } = useTranslation()
  const [, setSelectedChains] = useSelectedChains()
  const [, setStep] = useImportSeedphraseStep()

  const {
    mutate: startScanning,
    data: chainsWithBalance,
    isSuccess,
  } = useScanChainsWithBalanceMutation()

  useEffect(() => {
    startScanning()
  }, [startScanning])

  useEffect(() => {
    if (isSuccess && chainsWithBalance) {
      setSelectedChains(chainsWithBalance)
      setStep('chains')
    }
  }, [isSuccess, chainsWithBalance, setSelectedChains, setStep])

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
          {t('scanning_for_chains_subtitle')}{' '}
          <HighlightedText>
            {t('scanning_for_chains_highlight')}
          </HighlightedText>
        </Text>
      </VStack>
      <VStack style={{ marginTop: 'auto' }} fullWidth>
        <Button kind="secondary" onClick={handleSelectManually}>
          {t('select_chains_manually')}
        </Button>
      </VStack>
    </PageContent>
  )
}

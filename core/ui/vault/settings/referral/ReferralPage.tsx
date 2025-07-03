import { Match } from '@lib/ui/base/Match'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { useStepNavigation } from '@lib/ui/hooks/useStepNavigation'
import { InfoIcon } from '@lib/ui/icons/InfoIcon'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { PageHeaderBackButton } from '@lib/ui/page/PageHeaderBackButton'
import { Text } from '@lib/ui/text'
import { Tooltip } from '@lib/ui/tooltips/Tooltip'
import { useTranslation } from 'react-i18next'

import { ReferralLanding } from './components/ReferralLanding'

const steps = ['landing', 'how-it-works', 'create-or-save-referral']

export const ReferralPage = () => {
  const { t } = useTranslation()
  const { step, toNextStep, toFirstStep } = useStepNavigation({ steps })

  return (
    <>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        secondaryControls={
          <Tooltip
            renderOpener={() => (
              <IconButton size="sm">
                <InfoIcon />
              </IconButton>
            )}
            content={
              <VStack>
                <Text size={16}>Referral Program</Text>
                <Text color="supporting" size={13}>
                  The referral programm is applied on THORChain swaps and is on
                  a best effort basis. You need to register a THORName to use
                  the Vultisig referral. The registration fee is 10 RUNE and 1
                  RUNE for each year, which is paid to the THORChain network.
                </Text>
              </VStack>
            }
          />
        }
        title={t('referral')}
        hasBorder
      />
      <PageContent>
        <Match
          value={step}
          landing={() => <ReferralLanding onFinish={toNextStep} />}
        />
      </PageContent>
    </>
  )
}

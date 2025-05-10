import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { useCurrentVaultSecurityType } from '@core/ui/vault/state/currentVault'
import { Button } from '@lib/ui/buttons/Button'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { PageHeaderBackButton } from '@lib/ui/page/PageHeaderBackButton'
import { PageHeaderTitle } from '@lib/ui/page/PageHeaderTitle'
import { InfoBlock } from '@lib/ui/status/InfoBlock'
import { Text } from '@lib/ui/text'
import { match } from '@lib/utils/match'
import { useTranslation } from 'react-i18next'

export const ReshareVaultPage = () => {
  const { t } = useTranslation()
  const navigate = useCoreNavigate()
  const securityType = useCurrentVaultSecurityType()

  return (
    <VStack fullHeight>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        title={<PageHeaderTitle>{t('reshare')}</PageHeaderTitle>}
        hasBorder
      />
      <PageContent gap={8} alignItems="center" justifyContent="center" flexGrow>
        <Text color="contrast" size={20} weight="600">
          {t('reshare_your_vault')}
        </Text>
        <Text color="supporting" size={14}>
          {t('reshare_explanation')}
        </Text>
      </PageContent>
      <PageFooter gap={16}>
        <InfoBlock>{t('reshare_disclaimer')}</InfoBlock>
        <Button
          kind="primary"
          onClick={() =>
            match(securityType, {
              fast: () => navigate({ id: 'reshareVaultFast' }),
              secure: () => navigate({ id: 'reshareVaultSecure' }),
            })
          }
        >
          {t('start_reshare')}
        </Button>
        <Button
          kind="outlined"
          onClick={() =>
            navigate({ id: 'uploadQr', state: { title: t('join_reshare') } })
          }
        >
          {t('join_reshare')}
        </Button>
      </PageFooter>
    </VStack>
  )
}

import { useTranslation } from 'react-i18next'

import { Switch } from '../../lib/ui/inputs/switch'
import { FlowPageHeader } from '../../ui/flow/FlowPageHeader'
import { PageContent } from '../../ui/page/PageContent'
import { useIsDklsLibEnabled } from '../state/isDklsLibEnabled'

export const ManageDklsPage = () => {
  const { t } = useTranslation()

  const [isDklsLibEnabled, setIsDklsLibEnabled] = useIsDklsLibEnabled()

  return (
    <>
      <FlowPageHeader title={t('advanced')} />
      <PageContent>
        <Switch
          value={isDklsLibEnabled}
          onChange={setIsDklsLibEnabled}
          label={t('enable_dkls')}
        />
      </PageContent>
    </>
  )
}

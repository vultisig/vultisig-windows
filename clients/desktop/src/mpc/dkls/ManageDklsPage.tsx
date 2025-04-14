import { useTranslation } from 'react-i18next'

import { Switch } from '../../lib/ui/inputs/switch'
import { FlowPageHeader } from '@lib/ui/flow/FlowPageHeader'
import { PageContent } from '../../ui/page/PageContent'
import { useVaultCreationMpcLib } from '../state/vaultCreationMpcLib'

export const ManageDklsPage = () => {
  const { t } = useTranslation()

  const [value, setValue] = useVaultCreationMpcLib()

  return (
    <>
      <FlowPageHeader title={t('advanced')} />
      <PageContent>
        <Switch
          value={value === 'DKLS'}
          onChange={() => setValue(value === 'DKLS' ? 'GG20' : 'DKLS')}
          label={t('enable_dkls')}
        />
      </PageContent>
    </>
  )
}

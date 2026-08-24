import { FlowErrorPageContent } from '@core/ui/flow/FlowErrorPageContent'
import { ProductLogoBlock } from '@core/ui/product/ProductLogoBlock'
import { useCore } from '@core/ui/state/core'
import { ChildrenProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { useMutation } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { migrateExtensionStorage } from './migrateExtensionStorage'

export const StorageMigrationsManager = ({ children }: ChildrenProp) => {
  const { t } = useTranslation()
  const { version } = useCore()

  const { mutate: migrate, ...mutationStatus } = useMutation({
    // MatchQuery only takes the success branch for defined data, so a void
    // mutation would keep the whole app on the null `inactive` branch after
    // migrations finish
    mutationFn: async () => {
      await migrateExtensionStorage(version)
      return true
    },
  })

  useEffect(() => {
    migrate()
  }, [migrate])

  return (
    <MatchQuery
      value={mutationStatus}
      pending={() => <ProductLogoBlock />}
      error={error => (
        <FlowErrorPageContent
          title={t('failed_to_migrate_storage')}
          error={error}
        />
      )}
      success={() => <>{children}</>}
    />
  )
}

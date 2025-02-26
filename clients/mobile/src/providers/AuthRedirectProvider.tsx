import { useRouter, useSegments } from 'expo-router'
import { FC, PropsWithChildren, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { PageContent } from '~/lib/ui/components/PageContent'

import { useVaultsQuery } from '../hooks/queries/useVaultsQuery'
import { Text } from '../lib/ui/components/Text'

export const AuthRedirectProvider: FC<PropsWithChildren> = ({ children }) => {
  const { data: vaults = [], isFetching } = useVaultsQuery()
  const hasVault = vaults.length > 0
  const router = useRouter()
  const segments = useSegments()
  const { t } = useTranslation()

  useEffect(() => {
    if (isFetching) return

    const inNoVaultFlow = segments[0] === 'new-vault'

    if (hasVault && inNoVaultFlow) {
      router.replace('/')
      return
    }

    if (!hasVault && !inNoVaultFlow) {
      router.replace('/new-vault')
    }
  }, [hasVault, isFetching, router, segments])

  return isFetching ? (
    <PageContent>
      <Text size={32} color="contrast">
        {t('loading')}
      </Text>
    </PageContent>
  ) : (
    children
  )
}

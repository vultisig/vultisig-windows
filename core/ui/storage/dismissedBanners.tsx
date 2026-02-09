import { useRefetchQueries } from '@lib/ui/query/hooks/useRefetchQueries'
import { noRefetchQueryOptions } from '@lib/ui/query/utils/options'
import { useMutation, useQuery } from '@tanstack/react-query'

import { useCore } from '../state/core'
import { StorageKey } from './StorageKey'

export type BannerId = 'followOnX' | 'migrate'

type GetDismissedBannersFunction = () => Promise<BannerId[]>
type SetDismissedBannersFunction = (banners: BannerId[]) => Promise<void>

export type DismissedBannersStorage = {
  getDismissedBanners: GetDismissedBannersFunction
  setDismissedBanners: SetDismissedBannersFunction
}

const useDismissedBannersQuery = () => {
  const { getDismissedBanners } = useCore()

  return useQuery({
    queryKey: [StorageKey.dismissedBanners],
    queryFn: getDismissedBanners,
    ...noRefetchQueryOptions,
  })
}

export const useDismissedBanners = () => {
  const { data } = useDismissedBannersQuery()
  const dismissedBanners = new Set(data || [])

  return {
    isBannerDismissed: (id: BannerId) => dismissedBanners.has(id),
    dismissedBanners,
  }
}

const useSetDismissedBannersMutation = () => {
  const { setDismissedBanners } = useCore()
  const refetchQueries = useRefetchQueries()

  const mutationFn: SetDismissedBannersFunction = async input => {
    await setDismissedBanners(input)
    await refetchQueries([StorageKey.dismissedBanners])
  }

  return useMutation({
    mutationFn,
  })
}

export const useDismissBanner = () => {
  const { data } = useDismissedBannersQuery()
  const { mutateAsync } = useSetDismissedBannersMutation()

  return async (bannerId: BannerId) => {
    const current = data || []
    if (!current.includes(bannerId)) {
      await mutateAsync([...current, bannerId])
    }
  }
}

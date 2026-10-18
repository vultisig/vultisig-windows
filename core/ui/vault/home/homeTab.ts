import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { useNavigation } from '@lib/ui/navigation/state'
import { getLastItem } from '@vultisig/lib-utils/array/getLastItem'

/** The home pager's pages, left to right. */
export const homeTabs = ['wallet', 'defi'] as const

export type HomeTab = (typeof homeTabs)[number]

/** The route each home tab lives on, so deep links and back land on it. */
const homeTabViewId = {
  wallet: 'vault',
  defi: 'defi',
} as const satisfies Record<HomeTab, string>

/** The home tab the current route shows. */
export const useHomeTab = (): HomeTab => {
  const [{ history }] = useNavigation()

  return getLastItem(history).id === homeTabViewId.defi ? 'defi' : 'wallet'
}

/** Moves the current home route to `tab` in place, keeping the history depth. */
export const useNavigateToHomeTab = () => {
  const navigate = useCoreNavigate()

  return (tab: HomeTab) => {
    if (tab === 'defi') {
      navigate({ id: 'defi', state: {} }, { replace: true })
    } else {
      navigate({ id: 'vault' }, { replace: true })
    }
  }
}

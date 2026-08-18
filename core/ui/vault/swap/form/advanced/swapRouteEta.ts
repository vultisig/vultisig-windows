import { useTranslation } from 'react-i18next'

/**
 * Renders a route's estimated settlement time as a coarse human duration
 * ("~4m", "~1h 10m"). Coarse on purpose: the figure is the provider's own
 * estimate for a cross-chain settlement, so second precision would overstate
 * what it can promise. Anything under a minute still reads as "~1m".
 */
export const useFormatSwapRouteEta = () => {
  const { t } = useTranslation()

  return (seconds: number): string => {
    const totalMinutes = Math.max(1, Math.round(seconds / 60))
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60

    if (hours === 0) {
      return t('swap_route_eta_minutes', { minutes })
    }

    return minutes > 0
      ? t('swap_route_eta_hours_minutes', { hours, minutes })
      : t('swap_route_eta_hours', { hours })
  }
}

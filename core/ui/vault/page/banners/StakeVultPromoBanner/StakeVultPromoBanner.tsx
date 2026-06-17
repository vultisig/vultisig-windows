import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'

import { StakeVultPromoBannerContent } from './StakeVultPromoBannerContent'

type StakeVultPromoBannerProps = {
  onDismiss: () => void
}

/** Nudges holders of unstaked VULT to stake it and unlock a higher discount tier. */
export const StakeVultPromoBanner = ({
  onDismiss,
}: StakeVultPromoBannerProps) => {
  const navigate = useCoreNavigate()

  return (
    <StakeVultPromoBannerContent
      onStake={() =>
        navigate({ id: 'defi', state: { protocol: 'vultStaking' } })
      }
      onDismiss={onDismiss}
    />
  )
}

import { useMpcPeers } from '@core/ui/mpc/state/mpcPeers'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

type PeersManagerTitleProps = {
  target: number
}

export const PeersManagerTitle = ({ target }: PeersManagerTitleProps) => {
  const selectedPeers = useMpcPeers()

  const { t } = useTranslation()

  return (
    <Text color="contrast" size={22} weight="500">
      {t('devices')} ({selectedPeers.length + 1}/{target})
    </Text>
  )
}

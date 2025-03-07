import { useTranslation } from 'react-i18next'

import { Text } from '../../lib/ui/text'
import { useSelectedPeers } from '../../vault/keysign/shared/state/selectedPeers'

type PeersManagerTitleProps = {
  target: number
}

export const PeersManagerTitle = ({ target }: PeersManagerTitleProps) => {
  const selectedPeers = useSelectedPeers()

  const { t } = useTranslation()

  return (
    <Text color="contrast" size={22} weight="500">
      {t('devices')} ({selectedPeers.length + 1}/{target})
    </Text>
  )
}

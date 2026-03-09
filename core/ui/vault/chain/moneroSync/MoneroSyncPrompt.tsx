import { getMoneroAddress } from '@core/chain/chains/monero/getMoneroAddress'
import { getMoneroScanStorage } from '@core/chain/chains/monero/moneroScanStorage'
import { getMoneroVaultData } from '@core/chain/chains/monero/moneroVaultData'
import { ClockIcon } from '@lib/ui/icons/ClockIcon'
import { VStack } from '@lib/ui/layout/Stack'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { Text } from '@lib/ui/text'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { SecondaryActionWrapper } from '../../components/PrimaryActions.styled'

type MoneroSyncPromptProps = {
  onClick: () => void
}

export const MoneroSyncPrompt = ({ onClick }: MoneroSyncPromptProps) => {
  const { t } = useTranslation()
  const [isSyncing, setIsSyncing] = useState(true)

  useEffect(() => {
    let cancelled = false

    const check = async () => {
      const vaultData = getMoneroVaultData()
      if (!vaultData) return

      const address = await getMoneroAddress(vaultData.keyShare)
      const data = await getMoneroScanStorage().load(address)
      if (!cancelled) {
        setIsSyncing(
          data?.scanHeight === null || data?.scanHeight === undefined
        )
      }
    }

    check()
    const id = setInterval(check, 3000)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [])

  return (
    <VStack alignItems="center" gap={8}>
      <SecondaryActionWrapper onClick={onClick}>
        {isSyncing ? <Spinner size={20} /> : <ClockIcon />}
      </SecondaryActionWrapper>
      <Text color="shyExtra" size={12}>
        {t('sync')}
      </Text>
    </VStack>
  )
}

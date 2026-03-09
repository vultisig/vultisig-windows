import { getMoneroChainTip } from '@core/chain/chains/monero/chainTip'
import { getMoneroAddress } from '@core/chain/chains/monero/getMoneroAddress'
import { getMoneroScanStorage } from '@core/chain/chains/monero/moneroScanStorage'
import { getMoneroVaultData } from '@core/chain/chains/monero/moneroVaultData'
import { initializeFromt } from '@core/mpc/fromt/initialize'
import { OnCloseProp } from '@lib/ui/props'
import { fromt_keyshare_birthday } from 'fromt-wasm'
import { useTranslation } from 'react-i18next'

import { ChainSyncModal } from '../ChainSyncModal'

export const MoneroSyncModal = ({ onClose }: OnCloseProp) => {
  const { t } = useTranslation()

  const setup = async () => {
    const vaultData = getMoneroVaultData()
    if (!vaultData) throw new Error('No Monero vault data')

    await initializeFromt()
    const keyShare = new Uint8Array(Buffer.from(vaultData.keyShare, 'base64'))
    const birthday = Number(fromt_keyshare_birthday(keyShare))
    const identifier = await getMoneroAddress(vaultData.keyShare)
    let chainTip: number | null = null
    try {
      chainTip = await getMoneroChainTip()
    } catch {
      // chain tip fetch failed, continue without it
    }
    return { identifier, birthday: birthday || null, chainTip }
  }

  const loadScanHeight = async (address: string) => {
    const data = await getMoneroScanStorage().load(address)
    return data?.scanHeight ?? null
  }

  const loadScanTarget = async (address: string) => {
    const data = await getMoneroScanStorage().load(address)
    return data?.scanTarget ?? null
  }

  return (
    <ChainSyncModal
      onClose={onClose}
      title={t('monero_sync_status')}
      setup={setup}
      loadScanHeight={loadScanHeight}
      loadScanTarget={loadScanTarget}
    />
  )
}

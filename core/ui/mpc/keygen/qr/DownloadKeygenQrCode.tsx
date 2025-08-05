import { SaveAsImage } from '@core/ui/file/SaveAsImage'
import { useKeygenVault } from '@core/ui/mpc/keygen/state/keygenVault'
import { PrintableQrCode } from '@core/ui/qr/PrintableQrCode'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { ShareIcon } from '@lib/ui/icons/ShareIcon'
import { ValueProp } from '@lib/ui/props'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { getVaultExportUid } from '../../../vault/export/core/uid'

const prefix = 'VaultKeygenQR'

export const DownloadKeygenQrCode = ({ value }: ValueProp<string>) => {
  const { t } = useTranslation()
  const keygenVault = useKeygenVault()

  const fileName = useMemo(() => {
    if ('existingVault' in keygenVault) {
      const uid = getVaultExportUid(keygenVault.existingVault)
      return [prefix, keygenVault.existingVault.name, uid.slice(-3)].join('-')
    }

    return prefix
  }, [keygenVault])

  return (
    <SaveAsImage
      fileName={fileName}
      renderTrigger={({ onClick }) => (
        <IconButton onClick={onClick}>
          <ShareIcon />
        </IconButton>
      )}
      value={
        <PrintableQrCode
          value={value}
          title={t('join_keygen')}
          description={t('scan_with_devices')}
        />
      }
    />
  )
}

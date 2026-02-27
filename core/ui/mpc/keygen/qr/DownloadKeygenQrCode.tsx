import { SaveAsImage } from '@core/ui/file/SaveAsImage'
import {
  useKeygenVault,
  useKeygenVaultName,
} from '@core/ui/mpc/keygen/state/keygenVault'
import { PrintableQrCode } from '@core/ui/qr/PrintableQrCode'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { ShareIcon } from '@lib/ui/icons/ShareIcon'
import { ValueProp } from '@lib/ui/props'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { getVaultExportUid } from '../../../vault/export/core/uid'

const prefix = 'VaultKeygenQR'

type IconButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
type IconButtonKind = 'link' | 'primary' | 'secondary' | 'outlined'

type DownloadKeygenQrCodeProps = ValueProp<string> & {
  iconButtonKind?: IconButtonKind
  iconButtonSize?: IconButtonSize
}

export const DownloadKeygenQrCode = ({
  value,
  iconButtonKind = 'link',
  iconButtonSize = 'md',
}: DownloadKeygenQrCodeProps) => {
  const { t } = useTranslation()
  const keygenVault = useKeygenVault()
  const vaultName = useKeygenVaultName()
  const fileName = useMemo(() => {
    if ('existingVault' in keygenVault) {
      const uid = getVaultExportUid(keygenVault.existingVault)
      return [prefix, keygenVault.existingVault.name, uid.slice(-3)].join('-')
    }

    return [prefix, vaultName].join('-')
  }, [keygenVault, vaultName])

  return (
    <SaveAsImage
      fileName={fileName}
      renderTrigger={({ onClick }) => (
        <IconButton
          kind={iconButtonKind}
          onClick={onClick}
          size={iconButtonSize}
        >
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

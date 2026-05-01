import { SaveAsImage } from '@core/ui/file/SaveAsImage'
import {
  useKeygenVault,
  useKeygenVaultName,
} from '@core/ui/mpc/keygen/state/keygenVault'
import { useTargetDeviceCount } from '@core/ui/mpc/keygen/state/targetDeviceCount'
import {
  PrintableQrCode,
  PrintableQrCodeRow,
} from '@core/ui/qr/PrintableQrCode'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { ShareIcon } from '@lib/ui/icons/ShareIcon'
import { ValueProp } from '@lib/ui/props'
import { getKeygenThreshold } from '@vultisig/core-mpc/getKeygenThreshold'
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
  const targetDeviceCount = useTargetDeviceCount()

  const fileName =
    'existingVault' in keygenVault
      ? [
          prefix,
          keygenVault.existingVault.name,
          getVaultExportUid(keygenVault.existingVault).slice(-3),
        ].join('-')
      : [prefix, vaultName].join('-')

  const totalSigners =
    'existingVault' in keygenVault
      ? keygenVault.existingVault.signers.length
      : targetDeviceCount

  const rows: PrintableQrCodeRow[] = [{ label: t('vault'), value: vaultName }]

  if (totalSigners !== undefined) {
    rows.push({
      label: t('type'),
      value: `${getKeygenThreshold(totalSigners)}-${totalSigners}`,
    })
  }

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
          brandLabel={t('vultisig')}
          rows={rows}
        />
      }
    />
  )
}

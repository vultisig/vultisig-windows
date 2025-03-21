import { ValueProp } from '@lib/ui/props'
import { useTranslation } from 'react-i18next'

import { ShareIconNew } from '../../../../lib/ui/icons/ShareIconNew'
import { SaveAsImage } from '../../../../ui/file/SaveAsImage'
import { PageHeaderIconButton } from '../../../../ui/page/PageHeaderIconButton'
import { PrintableQrCode } from '../../../../ui/qr/PrintableQrCode'
import { getVaultPublicKeyExport } from '../../../share/utils/getVaultPublicKeyExport'
import { useCurrentVault } from '../../../state/currentVault'

export const DownloadKeygenQrCode = ({ value }: ValueProp<string>) => {
  const vault = useCurrentVault()
  const { name } = vault
  const { t } = useTranslation()
  const { uid } = getVaultPublicKeyExport(vault) ?? ''
  const lastThreeUID = uid.slice(-3)

  return (
    <SaveAsImage
      fileName={`VayltKeygenQR-${name}-${lastThreeUID}`}
      renderTrigger={({ onClick }) => (
        <PageHeaderIconButton icon={<ShareIconNew />} onClick={onClick} />
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

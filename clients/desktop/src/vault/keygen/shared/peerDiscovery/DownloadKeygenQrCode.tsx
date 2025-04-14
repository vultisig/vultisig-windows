import { useKeygenVault } from '@core/ui/mpc/keygen/state/keygenVault'
import { ShareIconNew } from '@lib/ui/icons/ShareIconNew'
import { PageHeaderIconButton } from '@lib/ui/page/PageHeaderIconButton'
import { ValueProp } from '@lib/ui/props'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { SaveAsImage } from '../../../../ui/file/SaveAsImage'
import { PrintableQrCode } from '../../../../ui/qr/PrintableQrCode'
import { getVaultPublicKeyExport } from '../../../share/utils/getVaultPublicKeyExport'

const prefix = 'VayltKeygenQR'

export const DownloadKeygenQrCode = ({ value }: ValueProp<string>) => {
  const { t } = useTranslation()
  const keygenVault = useKeygenVault()

  const fileName = useMemo(() => {
    if ('existingVault' in keygenVault) {
      const { uid } = getVaultPublicKeyExport(keygenVault.existingVault)
      return [prefix, keygenVault.existingVault.name, uid.slice(-3)].join('-')
    }

    return prefix
  }, [keygenVault])

  return (
    <SaveAsImage
      fileName={fileName}
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

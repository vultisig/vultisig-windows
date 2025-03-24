import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { useTranslation } from 'react-i18next'

import { FileUpIcon } from '../../../../lib/ui/icons/FileUpIcon'
import { SaveAsImage } from '../../../../ui/file/SaveAsImage'
import { PageHeaderIconButton } from '../../../../ui/page/PageHeaderIconButton'
import { PrintableQrCode } from '../../../../ui/qr/PrintableQrCode'
import { getVaultPublicKeyExport } from '../../../share/utils/getVaultPublicKeyExport'
import { useCurrentVault } from '../../../state/currentVault'
import { useJoinKeysignUrlQuery } from '../../shared/queries/useJoinKeysignUrlQuery'

export const DownloadKeysignQrCode = () => {
  const joinKeysignUrlQuery = useJoinKeysignUrlQuery()
  const { t } = useTranslation()
  const vault = useCurrentVault()
  const { name } = vault
  const { uid } = getVaultPublicKeyExport(vault)
  const lastThreeUID = uid.slice(-3)

  return (
    <MatchQuery
      value={joinKeysignUrlQuery}
      success={data => (
        <SaveAsImage
          fileName={`VaultKeysignQR-${name}-${lastThreeUID}`}
          renderTrigger={({ onClick }) => (
            <PageHeaderIconButton icon={<FileUpIcon />} onClick={onClick} />
          )}
          value={
            <PrintableQrCode
              value={data}
              title={t('join_keysign')}
              description={t('scan_with_devices_to_sign')}
            />
          }
        />
      )}
      pending={() => null}
      error={() => null}
    />
  )
}

import { SaveAsImage } from '@core/ui/file/SaveAsImage'
import { useJoinKeysignUrlQuery } from '@core/ui/mpc/keysign/queries/useJoinKeysignUrlQuery'
import { useCoreViewState } from '@core/ui/navigation/hooks/useCoreViewState'
import { PrintableQrCode } from '@core/ui/qr/PrintableQrCode'
import { getVaultPublicKeyExport } from '@core/ui/vault/share/utils/getVaultPublicKeyExport'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { FileUpIcon } from '@lib/ui/icons/FileUpIcon'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { useTranslation } from 'react-i18next'

export const DownloadKeysignQrCode = () => {
  const [{ keysignPayload }] = useCoreViewState<'keysign'>()
  const joinKeysignUrlQuery = useJoinKeysignUrlQuery(keysignPayload)
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
            <IconButton onClick={onClick}>
              <FileUpIcon />
            </IconButton>
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

import { useTranslation } from 'react-i18next';

import { FileUpIcon } from '../../../../lib/ui/icons/FileUpIcon';
import { ValueProp } from '../../../../lib/ui/props';
import { SaveAsImage } from '../../../../ui/file/SaveAsImage';
import { PageHeaderIconButton } from '../../../../ui/page/PageHeaderIconButton';
import { PrintableQrCode } from '../../../../ui/qr/PrintableQrCode';
import { getVaultPublicKeyExport } from '../../../share/utils/getVaultPublicKeyExport';
import { useCurrentKeygenVault } from '../../state/currentKeygenVault';

export const DownloadKeygenQrCode = ({ value }: ValueProp<string>) => {
  const vault = useCurrentKeygenVault();
  const { name } = vault;
  const { t } = useTranslation();
  const { uid } = getVaultPublicKeyExport(vault) ?? '';
  const lastThreeUID = uid.slice(-3);

  return (
    <SaveAsImage
      fileName={`VayltKeygenQR-${name}-${lastThreeUID}`}
      renderTrigger={({ onClick }) => (
        <PageHeaderIconButton icon={<FileUpIcon />} onClick={onClick} />
      )}
      value={
        <PrintableQrCode
          value={value}
          title={t('join_keygen')}
          description={t('scan_with_devices')}
        />
      }
    />
  );
};

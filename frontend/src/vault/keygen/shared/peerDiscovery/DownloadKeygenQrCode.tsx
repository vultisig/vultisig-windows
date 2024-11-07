import { useTranslation } from 'react-i18next';

import { FileUpIcon } from '../../../../lib/ui/icons/FileUpIcon';
import { ComponentWithValueProps } from '../../../../lib/ui/props';
import { SaveAsImage } from '../../../../ui/file/SaveAsImage';
import { PageHeaderIconButton } from '../../../../ui/page/PageHeaderIconButton';
import { PrintableQrCode } from '../../../../ui/qr/PrintableQrCode';
import { getVaultPublicKeyExport } from '../../../share/utils/getVaultPublicKeyExport';
import { useAssertCurrentVault } from '../../../state/useCurrentVault';

export const DownloadKeygenQrCode = ({
  value,
}: ComponentWithValueProps<string>) => {
  const vault = useAssertCurrentVault();
  const { uid } = getVaultPublicKeyExport(vault);
  const { t } = useTranslation();

  return (
    <SaveAsImage
      fileName={`VaultKeygen-${vault.name}-${uid}-${new Date().toISOString()}`}
      renderTrigger={({ onClick }) => (
        <PageHeaderIconButton icon={<FileUpIcon />} onClick={onClick} />
      )}
      value={<PrintableQrCode value={value} title={t('join_keygen')} />}
    />
  );
};

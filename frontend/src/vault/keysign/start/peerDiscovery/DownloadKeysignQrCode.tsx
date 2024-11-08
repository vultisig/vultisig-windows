import { useTranslation } from 'react-i18next';

import { FileUpIcon } from '../../../../lib/ui/icons/FileUpIcon';
import { QueryDependant } from '../../../../lib/ui/query/components/QueryDependant';
import { SaveAsImage } from '../../../../ui/file/SaveAsImage';
import { PageHeaderIconButton } from '../../../../ui/page/PageHeaderIconButton';
import { PrintableQrCode } from '../../../../ui/qr/PrintableQrCode';
import { getVaultPublicKeyExport } from '../../../share/utils/getVaultPublicKeyExport';
import { useAssertCurrentVault } from '../../../state/useCurrentVault';
import { useKeysignMsgQuery } from '../../shared/queries/useKeysignMsgQuery';

export const DownloadKeysignQrCode = () => {
  const msgQuery = useKeysignMsgQuery();
  const { t } = useTranslation();
  const vault = useAssertCurrentVault();
  const { uid } = getVaultPublicKeyExport(vault);

  return (
    <QueryDependant
      query={msgQuery}
      success={data => (
        <SaveAsImage
          fileName={`VaultSend-${vault.name}-${uid}-${new Date().toISOString()}`}
          renderTrigger={({ onClick }) => (
            <PageHeaderIconButton icon={<FileUpIcon />} onClick={onClick} />
          )}
          value={<PrintableQrCode value={data} title={t('join_keysign')} />}
        />
      )}
      pending={() => null}
      error={() => null}
    />
  );
};

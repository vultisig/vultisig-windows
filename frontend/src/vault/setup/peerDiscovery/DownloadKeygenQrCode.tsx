import { useTranslation } from 'react-i18next';

import { FileUpIcon } from '../../../lib/ui/icons/FileUpIcon';
import { QueryDependant } from '../../../lib/ui/query/components/QueryDependant';
import { SaveAsImage } from '../../../ui/file/SaveAsImage';
import { PageHeaderIconButton } from '../../../ui/page/PageHeaderIconButton';
import { PrintableQrCode } from '../../../ui/qr/PrintableQrCode';
import { useCurrentLocalPartyId } from '../../keygen/state/currentLocalPartyId';
import { useKeygenMsgQuery } from '../queries/useKeygenMsgQuery';

export const DownloadKeygenQrCode = () => {
  const keygenMsgQuery = useKeygenMsgQuery();

  const localPartyId = useCurrentLocalPartyId();

  const { t } = useTranslation();

  return (
    <QueryDependant
      query={keygenMsgQuery}
      success={data => (
        <SaveAsImage
          fileName={localPartyId}
          renderTrigger={({ onClick }) => (
            <PageHeaderIconButton icon={<FileUpIcon />} onClick={onClick} />
          )}
          value={<PrintableQrCode value={data} title={t('join_keygen')} />}
        />
      )}
      pending={() => null}
      error={() => null}
    />
  );
};

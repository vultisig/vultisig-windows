import { useTranslation } from 'react-i18next';

import { FileUpIcon } from '../../../../lib/ui/icons/FileUpIcon';
import { ComponentWithValueProps } from '../../../../lib/ui/props';
import { SaveAsImage } from '../../../../ui/file/SaveAsImage';
import { PageHeaderIconButton } from '../../../../ui/page/PageHeaderIconButton';
import { PrintableQrCode } from '../../../../ui/qr/PrintableQrCode';
import { useCurrentLocalPartyId } from '../../state/currentLocalPartyId';

export const DownloadKeygenQrCode = ({
  value,
}: ComponentWithValueProps<string>) => {
  const localPartyId = useCurrentLocalPartyId();

  const { t } = useTranslation();

  return (
    <SaveAsImage
      fileName={localPartyId}
      renderTrigger={({ onClick }) => (
        <PageHeaderIconButton icon={<FileUpIcon />} onClick={onClick} />
      )}
      value={<PrintableQrCode value={value} title={t('join_keygen')} />}
    />
  );
};

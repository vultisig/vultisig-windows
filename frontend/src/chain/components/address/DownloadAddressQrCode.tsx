import { PageHeaderIconButton } from '../../../ui/page/PageHeaderIconButton';
import { FileUpIcon } from '../../../lib/ui/icons/FileUpIcon';
import { ComponentWithValueProps } from '../../../lib/ui/props';
import { PrintableAddressQrCode } from './PrintableAddressQrCode';
import { SaveAsImage } from '../../../ui/file/SaveAsImage';

export const DownloadAddressQrCode = ({
  value,
}: ComponentWithValueProps<string>) => {
  return (
    <SaveAsImage
      fileName={value}
      renderTrigger={({ onClick }) => (
        <PageHeaderIconButton icon={<FileUpIcon />} onClick={onClick} />
      )}
      value={<PrintableAddressQrCode />}
    />
  );
};

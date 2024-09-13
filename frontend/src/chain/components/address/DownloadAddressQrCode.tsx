import { PageHeaderIconButton } from '../../../ui/page/PageHeaderIconButton';
import { FileUpIcon } from '../../../lib/ui/icons/FileUpIcon';
import { SaveFile } from '../../../../wailsjs/go/main/App';
import { ComponentWithValueProps } from '../../../lib/ui/props';
import { useMutation } from '@tanstack/react-query';

export const DownloadAddressQrCode = ({
  value,
}: ComponentWithValueProps<string>) => {
  const { mutate: saveFile } = useMutation({
    mutationFn: () => {
      const base64Data = 'todo';

      const fileName = `${value}.png`;

      return SaveFile(fileName, base64Data);
    },
  });

  return (
    <PageHeaderIconButton icon={<FileUpIcon />} onClick={() => saveFile()} />
  );
};

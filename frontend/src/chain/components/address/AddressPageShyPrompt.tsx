import { Link } from 'react-router-dom';

import { IconButton } from '../../../lib/ui/buttons/IconButton';
import { QrCodeIcon } from '../../../lib/ui/icons/QrCodeIcon';
import { ComponentWithValueProps } from '../../../lib/ui/props';
import { makeAppPath } from '../../../navigation';

export const AddressPageShyPrompt = ({
  value,
}: ComponentWithValueProps<string>) => {
  return (
    <Link to={makeAppPath('address', { address: value })}>
      <IconButton as="div" title="Address QR code" icon={<QrCodeIcon />} />
    </Link>
  );
};

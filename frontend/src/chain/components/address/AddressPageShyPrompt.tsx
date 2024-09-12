import { IconButton } from '../../../lib/ui/buttons/IconButton';
import { ComponentWithValueProps } from '../../../lib/ui/props';
import { Link } from 'react-router-dom';
import { makeAddressPath } from '../../../navigation';
import { QrCodeIcon } from '../../../lib/ui/icons/QrCodeIcon';

export const AddressPageShyPrompt = ({
  value,
}: ComponentWithValueProps<string>) => {
  return (
    <Link to={makeAddressPath({ address: value })}>
      <IconButton as="div" title="Address QR code" icon={<QrCodeIcon />} />
    </Link>
  );
};

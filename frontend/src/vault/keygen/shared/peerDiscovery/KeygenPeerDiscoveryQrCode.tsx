import { ComponentWithValueProps } from '../../../../lib/ui/props';
import { FramedQrCode } from '../../../../lib/ui/qr/FramedQrCode';

export const KeygenPeerDiscoveryQrCode = ({
  value,
}: ComponentWithValueProps<string>) => {
  return <FramedQrCode value={value} />;
};

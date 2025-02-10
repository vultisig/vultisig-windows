import { ValueProp } from '../../../../lib/ui/props';
import { FramedQrCode } from '../../../../lib/ui/qr/FramedQrCode';

export const KeygenPeerDiscoveryQrCode = ({
  value,
  size,
}: ValueProp<string> & {
  size?: number;
}) => {
  return <FramedQrCode value={value} size={size} />;
};

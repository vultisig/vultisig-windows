import { ValueProp } from '../../../../lib/ui/props';
import { FramedQrCode } from '../../../../lib/ui/qr/FramedQrCode';

export const KeygenPeerDiscoveryQrCode = ({ value }: ValueProp<string>) => {
  return <FramedQrCode value={value} />;
};

import { ElementSizeAware } from '../../../../lib/ui/base/ElementSizeAware';
import { TakeWholeSpaceCenterContent } from '../../../../lib/ui/layout/TakeWholeSpaceCenterContent';
import { ComponentWithValueProps } from '../../../../lib/ui/props';
import { FramedQrCode } from '../../../../lib/ui/qr/FramedQrCode';

export const KeygenPeerDiscoveryQrCode = ({
  value,
}: ComponentWithValueProps<string>) => {
  return (
    <ElementSizeAware
      render={({ setElement, size }) => (
        <TakeWholeSpaceCenterContent ref={setElement}>
          <FramedQrCode
            value={value}
            size={size ? Math.min(size.width, size.height) : 0}
          />
        </TakeWholeSpaceCenterContent>
      )}
    />
  );
};

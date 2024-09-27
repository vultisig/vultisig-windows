import styled from 'styled-components';

import { ElementSizeAware } from '../../../lib/ui/base/ElementSizeAware';
import { centerContent } from '../../../lib/ui/css/centerContent';
import { takeWholeSpace } from '../../../lib/ui/css/takeWholeSpace';
import { FramedQrCode } from '../../../lib/ui/qr/FramedQrCode';
import { QueryDependant } from '../../../lib/ui/query/components/QueryDependant';
import { getQueryDependantDefaultProps } from '../../../lib/ui/query/utils/getQueryDependantDefaultProps';
import { useKeygenMsgQuery } from '../queries/useKeygenMsgQuery';

const Container = styled.div`
  ${takeWholeSpace};
  ${centerContent};
`;

export const SetupVaultPeerDiscoveryQrCode = () => {
  const keygenMsgQuery = useKeygenMsgQuery();

  return (
    <QueryDependant
      query={keygenMsgQuery}
      success={data => (
        <ElementSizeAware
          render={({ setElement, size }) => (
            <Container ref={setElement}>
              <FramedQrCode
                value={data}
                size={size ? Math.min(size.width, size.height) : 0}
              />
            </Container>
          )}
        />
      )}
      {...getQueryDependantDefaultProps('keygen message')}
    />
  );
};

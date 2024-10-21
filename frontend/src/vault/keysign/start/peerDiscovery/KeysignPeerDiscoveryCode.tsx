import styled from 'styled-components';

import { centerContent } from '../../../../lib/ui/css/centerContent';
import { takeWholeSpace } from '../../../../lib/ui/css/takeWholeSpace';
import { FramedQrCode } from '../../../../lib/ui/qr/FramedQrCode';
import { QueryDependant } from '../../../../lib/ui/query/components/QueryDependant';
import { getQueryDependantDefaultProps } from '../../../../lib/ui/query/utils/getQueryDependantDefaultProps';
import { useKeysignMsgQuery } from '../../shared/queries/useKeysignMsgQuery';

const Container = styled.div`
  ${takeWholeSpace};
  ${centerContent};
`;

export const KeysignPeerDiscoveryQrCode = () => {
  const keygenMsgQuery = useKeysignMsgQuery();

  return (
    <QueryDependant
      query={keygenMsgQuery}
      success={data => (
        <Container>
          <FramedQrCode value={data} />
        </Container>
      )}
      {...getQueryDependantDefaultProps('keysign message')}
    />
  );
};

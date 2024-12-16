import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { centerContent } from '../../../../lib/ui/css/centerContent';
import { FramedQrCode } from '../../../../lib/ui/qr/FramedQrCode';
import { MatchQuery } from '../../../../lib/ui/query/components/MatchQuery';
import { useKeysignMsgQuery } from '../../shared/queries/useKeysignMsgQuery';

const Container = styled.div`
  ${centerContent};
`;

export const KeysignPeerDiscoveryQrCode = () => {
  const keygenMsgQuery = useKeysignMsgQuery();

  const { t } = useTranslation();

  return (
    <MatchQuery
      value={keygenMsgQuery}
      success={data => (
        <Container>
          <FramedQrCode value={data} />
        </Container>
      )}
      error={() => t('failed_to_load')}
      pending={() => t('loading')}
    />
  );
};

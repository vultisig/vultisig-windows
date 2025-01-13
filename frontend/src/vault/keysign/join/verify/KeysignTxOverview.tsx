import { MatchRecordUnion } from '../../../../lib/ui/base/MatchRecordUnion';
import { KeysignSwapTxInfo } from '../../../swap/keysign/KeysignSwapTxInfo';
import { KeysignTxPrimaryInfo } from '../../shared/KeysignTxPrimaryInfo';
import { KeysignPayloadProvider } from '../../shared/state/keysignPayload';
import { useJoinKeysignMessagePayload } from '../state/joinKeysignMessagePayload';
import { KeysignCustomMessageInfo } from './KeysignCustomMessageInfo';

export const KeysignTxOverview = () => {
  const keysignMessagePayload = useJoinKeysignMessagePayload();

  return (
    <MatchRecordUnion
      value={keysignMessagePayload}
      handlers={{
        keysign: keysignPayload => (
          <KeysignPayloadProvider value={keysignPayload}>
            {keysignPayload.swapPayload.value ? (
              <KeysignSwapTxInfo />
            ) : (
              <KeysignTxPrimaryInfo />
            )}
          </KeysignPayloadProvider>
        ),
        custom: value => <KeysignCustomMessageInfo value={value} />,
      }}
    />
  );
};

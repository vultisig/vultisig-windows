import { getKeysignMessagePayload } from '../../../../chain/keysign/KeysignMessagePayload';
import { MatchRecordUnion } from '../../../../lib/ui/base/MatchRecordUnion';
import { useAppPathState } from '../../../../navigation/hooks/useAppPathState';
import { KeysignSwapTxInfo } from '../../../swap/keysign/KeysignSwapTxInfo';
import { KeysignTxPrimaryInfo } from '../../shared/KeysignTxPrimaryInfo';
import { KeysignPayloadProvider } from '../../shared/state/keysignPayload';
import { KeysignCustomMessageInfo } from './KeysignCustomMessageInfo';

export const KeysignTxOverview = () => {
  const { keysignMsg } = useAppPathState<'joinKeysign'>();

  const keysignMessagePayload = getKeysignMessagePayload(keysignMsg);

  return (
    <MatchRecordUnion
      value={keysignMessagePayload}
      handlers={{
        keysign: keysignPayload => (
          <KeysignPayloadProvider value={keysignPayload}>
            {keysignPayload.swapPayload ? (
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

import { MatchRecordUnion } from '../../../../lib/ui/base/MatchRecordUnion';
import { KeysignSwapTxInfo } from '../../../swap/keysign/KeysignSwapTxInfo';
import { KeysignTxPrimaryInfo } from '../../shared/KeysignTxPrimaryInfo';
import { useKeysignMessagePayload } from '../../shared/state/keysignMessagePayload';
import { KeysignCustomMessageInfo } from './KeysignCustomMessageInfo';

export const KeysignTxOverview = () => {
  const keysignMessagePayload = useKeysignMessagePayload();

  return (
    <MatchRecordUnion
      value={keysignMessagePayload}
      handlers={{
        keysign: payload =>
          payload.swapPayload.value ? (
            <KeysignSwapTxInfo />
          ) : (
            <KeysignTxPrimaryInfo value={payload} />
          ),
        custom: value => <KeysignCustomMessageInfo value={value} />,
      }}
    />
  );
};
